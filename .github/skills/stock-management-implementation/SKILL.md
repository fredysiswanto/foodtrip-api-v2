---
name: stock-management-implementation
user-invocable: true
description: "Use when: implementing atomic stock deduction, preventing race conditions in concurrent orders, implementing stock-related validations, creating transaction patterns for order checkout, testing concurrent stock scenarios. Provides code templates and race condition prevention patterns."
---

# Stock Management Implementation

Implement atomic stock deduction with race condition prevention following STOCK-MANAGEMENT-STRATEGY.MD.

## Why Stock Management is Critical

Race conditions can cause **overselling** — multiple orders could be placed simultaneously on the same dish, resulting in **negative stock**.

**Problem Example:**

```
T1: SELECT stock FROM dishes WHERE id = 1 → 10 units
T2: SELECT stock FROM dishes WHERE id = 1 → 10 units
T1: Customer orders 8 units → UPDATE stock = 2
T2: Customer orders 5 units → UPDATE stock = 5
Result: Stock is 5, but 13 units were sold! (overselling by 8)
```

## Recommended Solution: Atomic SQL UPDATE

**Never do:** Check then deduct (2 SQL statements)  
**Always do:** Atomic UPDATE (1 SQL statement)

---

## Implementation Pattern

### 1. **Order Service with Atomic Stock Deduction**

```typescript
// src/modules/orders/services/OrderService.ts

import { Transaction } from "sequelize";
import { InsufficientStockError } from "../errors/InsufficientStockError";

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private dishRepository: DishRepository,
    private cartRepository: CartRepository,
  ) {}

  /**
   * Create order and deduct stock atomically
   * @param userId - User placing order
   * @param restaurantId - Restaurant ID
   * @param transaction - DB transaction for atomicity
   * @returns Created order
   * @throws InsufficientStockError if any dish has insufficient stock
   */
  async createOrder(
    userId: string,
    restaurantId: string,
    transaction: Transaction,
  ): Promise<Order> {
    // 1. Get cart items
    const cartItems = await this.cartRepository.getByUserAndRestaurant(
      userId,
      restaurantId,
      transaction,
    );

    if (!cartItems.length) {
      throw new EmptyCartError();
    }

    // 2. Validate authorization
    const cart = await this.cartRepository.findByUserId(userId, transaction);
    if (cart.restaurantId !== restaurantId) {
      throw new ForbiddenError("Cannot order from different restaurant");
    }

    // 3. ATOMIC STOCK DEDUCTION - Single UPDATE statement per item
    for (const item of cartItems) {
      const deducted = await this.dishRepository.deductStockAtomically(
        item.dishId,
        item.quantity,
        transaction,
      );

      if (!deducted) {
        // Rollback happens automatically by transaction wrapper
        throw new InsufficientStockError(
          `Not enough stock for dish ${item.dishId}`,
        );
      }
    }

    // 4. Create order
    const order = await this.orderRepository.create(
      {
        userId,
        restaurantId,
        items: cartItems.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          price: item.price,
        })),
        status: "PENDING",
      },
      transaction,
    );

    // 5. Clear cart
    await this.cartRepository.clearByUserId(userId, transaction);

    return order;
  }
}
```

### 2. **Repository with Atomic Stock Deduction**

```typescript
// src/modules/dishes/repositories/DishRepository.ts

import { Op, Transaction } from "sequelize";
import Dish from "../models/Dish";

export class DishRepository {
  /**
   * Deduct stock atomically in single SQL statement
   * Prevents race condition where multiple transactions
   * read same stock value and all succeed
   *
   * @param dishId - Dish ID
   * @param quantity - Quantity to deduct
   * @param transaction - DB transaction
   * @returns true if stock was deducted, false if insufficient stock
   */
  async deductStockAtomically(
    dishId: string,
    quantity: number,
    transaction: Transaction,
  ): Promise<boolean> {
    // Atomic SQL UPDATE: single operation
    // WHERE clause checks stock >= quantity
    // If condition fails, 0 rows updated
    const [updatedCount] = await Dish.update(
      {
        stock: sequelize.where(sequelize.col("stock"), Op.minus, quantity),
        // Also increment version for optimistic locking
        version: sequelize.where(sequelize.col("version"), Op.plus, 1),
      },
      {
        where: {
          id: dishId,
          // KEY: Check stock >= qty in WHERE clause
          // This makes the UPDATE atomic
          stock: { [Op.gte]: quantity },
        },
        transaction,
        validate: false, // Skip validations (already validated)
        returning: true,
      },
    );

    // If updatedCount === 0, stock was insufficient
    return updatedCount > 0;
  }

  async getById(
    dishId: string,
    transaction?: Transaction,
  ): Promise<Dish | null> {
    return Dish.findByPk(dishId, { transaction });
  }

  async getByIdWithLock(
    dishId: string,
    transaction: Transaction,
  ): Promise<Dish | null> {
    // Use database-level lock if needed
    return Dish.findByPk(dishId, {
      lock: Transaction.LOCK.UPDATE,
      transaction,
    });
  }
}
```

### 3. **Dish Model with Stock & Version Columns**

```typescript
// src/modules/dishes/models/Dish.ts

import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database";

class Dish extends Model {
  declare id: string;
  declare restaurantId: string;
  declare name: string;
  declare description: string;
  declare price: number;
  declare stock: number;
  declare version: number; // Optimistic locking
  declare deletedAt: Date | null;
}

Dish.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "restaurants", key: "id" },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }, // Prevents negative in app layer
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // Incremented with each stock change for optimistic locking
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Dish",
    tableName: "dishes",
    paranoid: true, // Soft deletes
    timestamps: true,
  },
);

export default Dish;
```

---

## 4. **Controller with Transaction Wrapper**

```typescript
// src/modules/orders/controllers/OrderController.ts

export class OrderController {
  constructor(private orderService: OrderService) {}

  /**
   * POST /api/v1/orders
   * Create order with automatic transaction management
   */
  async createOrder(req: IRequest, res: Response, next: NextFunction) {
    // Transaction wrapper handles begin/commit/rollback
    const transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });

    try {
      const order = await this.orderService.createOrder(
        req.user.id,
        req.body.restaurantId,
        transaction,
      );

      // Commit on success
      await transaction.commit();

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      // Rollback on failure
      await transaction.rollback();
      next(error);
    }
  }
}
```

---

## 5. **Transaction Helper**

```typescript
// src/common/utils/transaction.ts

import { Transaction } from "sequelize";
import sequelize from "../../config/database";

/**
 * Wrapper for database operations that need atomicity
 * Automatically handles begin/commit/rollback
 */
export async function withTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  });

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Usage:
const order = await withTransaction(async (t) => {
  return await orderService.createOrder(userId, restaurantId, t);
});
```

---

## Testing: Race Condition Prevention

### Unit Test

```typescript
// src/modules/dishes/repositories/__tests__/DishRepository.test.ts

describe("DishRepository - Stock Deduction", () => {
  it("should prevent overselling with concurrent requests", async () => {
    // Setup: Create dish with 10 stock
    const dish = await Dish.create({
      id: "dish-1",
      restaurantId: "resto-1",
      name: "Pizza",
      stock: 10,
      price: 10,
    });

    // Simulate concurrent requests
    const promise1 = dishRepository.deductStockAtomically(
      "dish-1",
      7,
      transaction1,
    );
    const promise2 = dishRepository.deductStockAtomically(
      "dish-1",
      5,
      transaction2,
    );

    const [result1, result2] = await Promise.all([promise1, promise2]);

    // One should succeed, one should fail
    expect(result1).toBe(true);
    expect(result2).toBe(false); // Not enough stock for second order

    // Final stock should be 3, not -2
    const final = await Dish.findByPk("dish-1");
    expect(final.stock).toBe(3);
  });
});
```

### Integration Test

```typescript
// src/modules/orders/__tests__/order.integration.test.ts

describe("Order Creation - Race Condition Prevention", () => {
  it("should not allow concurrent orders exceeding stock", async () => {
    const dish = await Dish.create({
      stock: 5,
      restaurantId: "resto-1",
      name: "Pizza",
      price: 10,
    });

    // Attempt two concurrent orders of 3 units each
    const order1Promise = request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token1}`)
      .send({ restaurantId: "resto-1", items: [{ dishId: dish.id, qty: 3 }] });

    const order2Promise = request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token2}`)
      .send({ restaurantId: "resto-1", items: [{ dishId: dish.id, qty: 3 }] });

    const [res1, res2] = await Promise.all([order1Promise, order2Promise]);

    // One succeeds, one fails with InsufficientStockError
    const successCount =
      (res1.status === 201 ? 1 : 0) + (res2.status === 201 ? 1 : 0);
    expect(successCount).toBe(1);

    // Verify no overselling
    const finalDish = await Dish.findByPk(dish.id);
    expect(finalDish.stock).toBeGreaterThanOrEqual(0);
    expect(finalDish.stock).toBeLessThanOrEqual(5);
  });
});
```

---

## Strategies Reference

### Strategy 1: Pessimistic Locking (Not Recommended for most cases)

```typescript
// Lock dish before reading/updating
const dish = await Dish.findByPk(dishId, {
  lock: Transaction.LOCK.UPDATE, // Row lock
  transaction,
});

if (dish.stock < quantity) {
  throw new InsufficientStockError();
}

await dish.update({ stock: dish.stock - quantity }, { transaction });
```

**Pros:** Simple, guaranteed consistency  
**Cons:** Poor concurrency (locks block other transactions)

### Strategy 2: Atomic SQL UPDATE (RECOMMENDED ✅)

```typescript
// Single UPDATE with WHERE condition
const [updated] = await Dish.update(
  { stock: sequelize.col("stock") - quantity },
  {
    where: {
      id: dishId,
      stock: { [Op.gte]: quantity }, // Atomic check
    },
    transaction,
  },
);

if (updated === 0) throw new InsufficientStockError();
```

**Pros:** Good concurrency, database handles atomicity  
**Cons:** Requires proper WHERE clause logic

### Strategy 3: Optimistic Locking with Retry

```typescript
// Update with version check, retry if version changed
let retries = 3;
while (retries > 0) {
  try {
    const [updated] = await Dish.update(
      {
        stock: sequelize.col("stock") - quantity,
        version: sequelize.col("version") + 1,
      },
      {
        where: {
          id: dishId,
          version: currentVersion, // Only update if version matches
          stock: { [Op.gte]: quantity },
        },
        transaction,
      },
    );

    if (updated > 0) break; // Success

    // Version changed, retry
    retries--;
    if (retries === 0) throw new VersionConflictError();
  } catch (error) {
    retries--;
    if (retries === 0) throw error;
    await sleep(100); // Exponential backoff
  }
}
```

**Pros:** Detects concurrent updates, allows retries  
**Cons:** Complex, requires retry logic

---

## Checklist for Stock Deduction Implementation

- [ ] Repository has `deductStockAtomically()` method
- [ ] Method uses single SQL UPDATE statement
- [ ] WHERE clause includes `stock >= quantity` check
- [ ] Returns boolean (success/failure)
- [ ] Service calls repository in transaction
- [ ] Transaction has REPEATABLE_READ isolation level
- [ ] Controller wraps service call in transaction
- [ ] Error thrown if stock insufficient
- [ ] Transaction committed on success
- [ ] Transaction rolled back on failure
- [ ] Version column incremented with stock change
- [ ] Tests verify no overselling possible
- [ ] Concurrent tests with multiple simultaneous orders
- [ ] Final stock validation (never negative)

---

## Usage in Chat

```
Implement stock deduction for Phase 8:
- Create DishRepository.deductStockAtomically()
- Implement in OrderService.createOrder()
- Add controller wrapper with transaction
- Create integration test for race conditions
```

This skill will provide templates, validate patterns, and ensure atomic implementation.
