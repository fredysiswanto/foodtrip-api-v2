# Stock Management Strategy

**Purpose:** Prevent race conditions and overselling in order processing.

---

# Problem: Race Condition

```
Timeline:
T0: Dish A has stock = 10
T1: Order X checks stock → 10 available ✓
T2: Order Y checks stock → 10 available ✓
T3: Order X deducts 8 → stock becomes 2
T4: Order Y deducts 5 → stock becomes -3 ❌ OVERSELLING!
```

---

# Solution: Atomic Stock Deduction

## Strategy 1: Pessimistic Locking (Recommended for High Concurrency)

Lock the row before reading, preventing concurrent updates.

### Implementation

```typescript
// In transaction
const dish = await Dish.findByPk(dishId, {
  lock: t.LOCK.UPDATE, // Sequelize pessimistic lock
  transaction: t,
});

if (dish.stock < requestedQty) {
  throw new InsufficientStockError();
}

await dish.update({ stock: dish.stock - requestedQty }, { transaction: t });
```

**Pros:**

- Guarantees no overselling
- Simple to understand
- Database handles locking

**Cons:**

- Row locked → slower concurrent requests
- Potential deadlocks if multiple dishes in one order

---

## Strategy 2: Atomic SQL Update (Recommended for Medium Concurrency)

Single SQL statement ensures atomicity. UPDATE fails if condition not met.

### Implementation

```sql
-- Single statement: check + deduct in one operation
UPDATE dishes
SET stock = stock - ?, version = version + 1
WHERE id = ? AND stock >= ? AND deleted_at IS NULL
LIMIT 1;

-- Check rows affected
if (affectedRows === 0) {
  throw new InsufficientStockError();
}
```

### Sequelize Implementation

```typescript
const result = await sequelize.query(
  `UPDATE dishes 
   SET stock = stock - :quantity, version = version + 1
   WHERE id = :dishId AND stock >= :quantity AND deleted_at IS NULL`,
  {
    replacements: {
      dishId,
      quantity: requestedQty,
    },
    type: QueryTypes.UPDATE,
    transaction: t,
  },
);

if (result[1] === 0) {
  // sequelize returns [data, affectedRows]
  throw new InsufficientStockError();
}
```

**Pros:**

- Atomic at database level
- No row locking
- Highly concurrent

**Cons:**

- Cannot reuse updated object
- Harder to debug if fails

---

## Strategy 3: Optimistic Locking (Not Recommended for Stock)

Use version column to detect conflicts. Retry on failure.

```typescript
// Read current version
const dish = await Dish.findByPk(dishId);
const currentVersion = dish.version;

// Try to update
const updated = await Dish.update(
  {
    stock: dish.stock - requestedQty,
    version: currentVersion + 1,
  },
  {
    where: {
      id: dishId,
      version: currentVersion, // Only update if version matches
      stock: { [Op.gte]: requestedQty },
    },
  },
);

if (updated[0] === 0) {
  // Conflict: either version mismatch or insufficient stock
  throw new ConflictError("Stock changed. Please retry.");
}
```

**Pros:**

- No locks
- Good for low-conflict scenarios

**Cons:**

- Requires retry logic
- Not suitable for inventory (too much contention)

---

# Recommended Approach: Strategy 2 + Version Check

Use atomic SQL for stock deduction + version increment.

```typescript
async deductStock(
  dishId: UUID,
  quantity: number,
  transaction: Transaction
) {
  const result = await sequelize.query(
    `UPDATE dishes
     SET stock = stock - :qty, version = version + 1
     WHERE id = :id AND stock >= :qty AND deleted_at IS NULL`,
    {
      replacements: { id: dishId, qty: quantity },
      type: QueryTypes.UPDATE,
      transaction
    }
  );

  if (result[1] === 0) {
    const dish = await Dish.findByPk(dishId);
    if (!dish) throw new NotFoundError('Dish not found');
    if (dish.stock < quantity) {
      throw new InsufficientStockError(
        `Only ${dish.stock} units available`
      );
    }
    throw new DataIntegrityError('Unexpected stock deduction failure');
  }

  return true;
}
```

---

# Order Creation Transaction Flow

```typescript
async createOrder(cartId, paymentMethod) {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
  });

  try {
    // 1. Lock cart & get items
    const cart = await Cart.findByPk(cartId, {
      include: ['items'],
      transaction,
      lock: t.LOCK.UPDATE
    });

    // 2. Validate each item stock (read-only)
    for (const item of cart.items) {
      const dish = await Dish.findByPk(item.dishId);
      if (dish.stock < item.quantity) {
        throw new InsufficientStockError(
          `${dish.name}: only ${dish.stock} left`
        );
      }
    }

    // 3. Create order record
    const order = await Order.create({
      userId: cart.userId,
      restaurantId: cart.restaurantId,
      // ... other fields
      status: 'PENDING'
    }, { transaction });

    // 4. Create order items (snapshots)
    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        dishId: item.dishId,
        dishName: item.dish.name,
        dishPrice: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }, { transaction });
    }

    // 5. Atomically deduct stock for each dish
    for (const item of cart.items) {
      const result = await sequelize.query(
        `UPDATE dishes
         SET stock = stock - :qty, version = version + 1
         WHERE id = :id AND stock >= :qty`,
        {
          replacements: { id: item.dishId, qty: item.quantity },
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      if (result[1] === 0) {
        throw new InsufficientStockError(
          'Stock changed during checkout. Please retry.'
        );
      }
    }

    // 6. Clear cart
    await Cart.destroy({ where: { id: cartId }, transaction });

    // 7. Commit
    await transaction.commit();

    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

---

# Stock Update Operations

## Adding Stock (Refund, Restock)

```typescript
async addStock(dishId, quantity, reason) {
  const result = await sequelize.query(
    `UPDATE dishes
     SET stock = stock + :qty, version = version + 1
     WHERE id = :id AND deleted_at IS NULL`,
    {
      replacements: { id: dishId, qty: quantity },
      type: QueryTypes.UPDATE
    }
  );

  if (result[1] === 0) {
    throw new NotFoundError('Dish not found');
  }

  // Log to audit
  await AuditLog.create({
    action: 'UPDATE_STOCK',
    module: 'dishes',
    entityId: dishId,
    oldData: { quantity: '-' + quantity, reason },
    newData: null
  });
}
```

---

# Testing Stock Deduction

```typescript
// test/stock-deduction.test.ts

describe("Stock Deduction", () => {
  it("should deduct stock atomically", async () => {
    const dish = await Dish.create({ stock: 10 });

    const t = await sequelize.transaction();
    await deductStock(dish.id, 5, t);
    await t.commit();

    const updated = await Dish.findByPk(dish.id);
    expect(updated.stock).toBe(5);
  });

  it("should prevent overselling with concurrent requests", async () => {
    const dish = await Dish.create({ stock: 5 });

    const promises = [deductStock(dish.id, 3), deductStock(dish.id, 3)];

    const results = await Promise.allSettled(promises);

    // One succeeds, one fails
    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");

    const final = await Dish.findByPk(dish.id);
    expect(final.stock).toBe(2); // Only one deduction applied
  });

  it("should throw InsufficientStockError when not enough stock", async () => {
    const dish = await Dish.create({ stock: 2 });

    await expect(deductStock(dish.id, 5)).rejects.toThrow(
      InsufficientStockError,
    );
  });
});
```

---

# Monitoring Stock Health

```typescript
// Periodic check for negative stock (should never happen)
async function validateStockIntegrity() {
  const invalid = await Dish.findAll({
    where: { stock: { [Op.lt]: 0 } },
    paranoid: false,
  });

  if (invalid.length > 0) {
    logger.error("CRITICAL: Negative stock detected", {
      dishes: invalid.map((d) => ({ id: d.id, stock: d.stock })),
    });
    // Alert admin
  }
}

// Run hourly
setInterval(validateStockIntegrity, 3600000);
```

---

# Summary

| Scenario                           | Recommended Solution            |
| ---------------------------------- | ------------------------------- |
| High concurrency (>100 orders/sec) | Strategy 2: Atomic SQL          |
| Medium concurrency                 | Strategy 2 with monitoring      |
| Low concurrency (<10 orders/sec)   | Strategy 3: Optimistic locking  |
| Super safe, low throughput         | Strategy 1: Pessimistic locking |

**For FoodTrip MVP:** Use **Strategy 2 (Atomic SQL)** with proper transaction isolation and monitoring.
