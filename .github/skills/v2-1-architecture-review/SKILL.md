---
name: v2-1-architecture-review
user-invocable: true
description: "Use when: reviewing code against v2.1 architecture patterns, auditing pull requests for consistency, checking Controller→Service→Repository pattern, verifying Sequelize soft deletes, validating transaction safety. Returns detailed review with checklist of v2.1 compliance."
---

# v2.1 Architecture Review

Validate code against FoodTrip v2.1 architecture standards and patterns.

## When to Use

- ✅ Reviewing pull requests for architectural consistency
- ✅ Checking new modules follow Controller→Service→Repository
- ✅ Verifying Sequelize patterns and soft deletes
- ✅ Auditing transaction safety in critical operations
- ✅ Ensuring error handling uses standardized codes
- ✅ Validating authorization checks placement
- ✅ Checking database patterns match v2.1 schema

## Architecture Review Checklist

### 1. **Layer Separation** (Controller → Service → Repository)

```typescript
// CORRECT
// Repository: Data access only
class DishRepository {
  async getDishById(id: string) { /* SQL only */ }
  async updateStock(id: string, qty: number, t: Transaction) { /* SQL only */ }
}

// Service: Business logic, no HTTP knowledge
class DishService {
  async decrementStock(dishId: string, qty: number, t: Transaction) {
    const result = await this.dishRepository.updateStock(dishId, qty, t);
    if (!result) throw new InsufficientStockError();
  }
}

// Controller: HTTP layer only
class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.orderService.createOrder(...);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error); // Pass to error middleware
    }
  }
}
```

**Review Checklist:**

- [ ] Repository contains ONLY database queries
- [ ] Service contains business logic but NO HTTP knowledge
- [ ] Controller handles HTTP but delegates to service
- [ ] No direct model access in controller
- [ ] No HTTP response building in service

### 2. **Soft Deletes & Sequelize Patterns**

```typescript
// CORRECT: Paranoid model automatically excludes deleted
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    paranoid: true, // Auto-exclude deleted_at IS NOT NULL
    timestamps: true,
  },
);

// CORRECT: Scope always applied automatically
const users = await User.findAll(); // Excludes deleted users

// CORRECT: Explicitly include deleted if needed
const usersIncludingDeleted = await User.findAll({ paranoid: false });
```

**Review Checklist:**

- [ ] Core tables have `paranoid: true`
- [ ] `deleted_at` column exists on paranoid models
- [ ] No manual `deleted_at IS NULL` filters needed
- [ ] Soft delete scope applied consistently
- [ ] Tests verify paranoid behavior

### 3. **Transaction Safety & Atomicity**

```typescript
// CORRECT: Atomic stock deduction
const t = await sequelize.transaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
});

try {
  // Single UPDATE statement (no separate SELECT)
  const [updated] = await Dish.update(
    { stock: sequelize.where(sequelize.col('stock'), Op.gte, qty) },
    {
      where: { id: dishId },
      transaction: t,
      validate: false
    }
  );

  if (updated === 0) {
    await t.rollback();
    throw new InsufficientStockError();
  }

  // All subsequent operations use same transaction
  const order = await Order.create({...}, { transaction: t });

  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

**Review Checklist:**

- [ ] REPEATABLE_READ isolation level for critical operations
- [ ] Stock deduction uses atomic SQL UPDATE
- [ ] No separate SELECT before UPDATE
- [ ] All operations in transaction use same `t` parameter
- [ ] Explicit commit/rollback handling
- [ ] Failure handling triggers rollback
- [ ] Version column incremented with stock change

### 4. **Error Handling & Standardized Codes**

```typescript
// CORRECT: Custom error with standardized code
class InsufficientStockError extends ApiError {
  constructor(available: number) {
    super(
      400, // HTTP status
      "INSUFFICIENT_STOCK", // Standardized code
      `Only ${available} units available`, // User message
      "stock", // Field name
    );
  }
}

// CORRECT: All error codes from API-ERROR-CODES.MD
throw new InsufficientStockError(5);
throw new UnauthorizedError("Invalid credentials");
throw new ForbiddenError("Cannot access other restaurant");
throw new DuplicateEmailError("Email already registered");
```

**Review Checklist:**

- [ ] All errors have standardized code from API-ERROR-CODES.MD
- [ ] Error response includes: code, field, message
- [ ] HTTP status matches error code mapping
- [ ] No generic 500 errors for client mistakes
- [ ] Error middleware handles all error types
- [ ] Client can parse `code` field for programmatic handling

### 5. **Authorization & Data Scope**

```typescript
// CORRECT: Check authorization BEFORE data access
async updateDish(dishId: string, updates: any, req: IRequest) {
  const dish = await Dish.findByPk(dishId);

  if (!dish) throw new NotFoundError('Dish not found');

  // AUTHORIZATION CHECK FIRST
  if (dish.restaurantId !== req.user.restaurantId) {
    throw new ForbiddenError('Cannot access other restaurant dishes');
  }

  // THEN modify data
  return await dish.update(updates);
}
```

**Review Checklist:**

- [ ] Authorization checked BEFORE data access
- [ ] User can only access own restaurant data
- [ ] Staff can only update their restaurant
- [ ] Driver can only see assigned deliveries
- [ ] Super admin can access all data
- [ ] No authorization bypass patterns

### 6. **Input Validation**

```typescript
// CORRECT: Validate early, reject invalid input
async createOrder(req: Request) {
  const { items } = req.body;

  // Validate input exists
  if (!items || !Array.isArray(items)) {
    throw new ValidationError('items must be an array');
  }

  // Validate each item
  for (const item of items) {
    if (!item.dishId || item.qty <= 0) {
      throw new ValidationError('Invalid item format');
    }
  }

  // Proceed with business logic
  return await this.orderService.create(items, ...);
}
```

**Review Checklist:**

- [ ] Input validated before database queries
- [ ] Type checking for required fields
- [ ] Range checking (qty > 0, price >= 0)
- [ ] Format validation (email, phone, etc.)
- [ ] Meaningful error messages for each validation failure

### 7. **Migrations & Schema**

```typescript
// CORRECT: Reversible migration
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("dishes", {
      id: { type: Sequelize.UUID, primaryKey: true },
      restaurant_id: {
        type: Sequelize.UUID,
        references: { model: "restaurants", key: "id" },
        onDelete: "CASCADE",
      },
      stock: { type: Sequelize.INTEGER, allowNull: false },
      version: { type: Sequelize.INTEGER, defaultValue: 0 },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("dishes");
  },
};
```

**Review Checklist:**

- [ ] Migration matches DATABASE_DESIGN-V2.1.MD schema
- [ ] Down function implements full rollback
- [ ] Foreign keys with CASCADE/RESTRICT as per schema
- [ ] Constraints match (NOT NULL, UNIQUE, CHECK)
- [ ] Indexes created for performance
- [ ] No hardcoded data in production migrations

### 8. **TypeScript & Code Quality**

```typescript
// CORRECT: Strict TypeScript
interface CreateOrderRequest {
  items: Array<{ dishId: string; qty: number }>;
  notes?: string;
}

async createOrder(req: CreateOrderRequest): Promise<Order> {
  // No `any` types
  // All variables typed
  // No type escapes
}
```

**Review Checklist:**

- [ ] No `any` types
- [ ] All function parameters typed
- [ ] Return types specified
- [ ] Interfaces for request/response
- [ ] Generics used appropriately
- [ ] `strict: true` in tsconfig

### 9. **Testing Coverage**

```typescript
// CORRECT: Comprehensive tests
describe("OrderService", () => {
  it("should create order and deduct stock atomically", () => {
    // Success path test
  });

  it("should throw InsufficientStockError if stock < qty", () => {
    // Error case test
  });

  it("should rollback transaction on failure", () => {
    // Transaction rollback test
  });

  it("should prevent concurrent overselling", () => {
    // Race condition test
  });
});
```

**Review Checklist:**

- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] All error codes tested
- [ ] Success + failure paths covered
- [ ] Race condition tests for critical operations
- [ ] Minimum 80% coverage on critical modules

### 10. **API Documentation**

```typescript
/**
 * Create a new order
 *
 * @route POST /api/v1/orders
 * @access Private (Customer)
 * @param {CreateOrderRequest} req.body
 * @returns {Order} 201 Created
 *
 * @throws {INVALID_REQUEST} - Missing required fields
 * @throws {INSUFFICIENT_STOCK} - Not enough stock
 * @throws {UNAUTHORIZED} - User not authenticated
 */
async createOrder(req: Request) { ... }
```

**Review Checklist:**

- [ ] JSDoc for all public functions
- [ ] Route documented with endpoint
- [ ] Access level specified (Private/Public, role)
- [ ] All error codes documented
- [ ] Request/response examples in Swagger
- [ ] TypeScript interfaces exported

---

## Review Report Template

When reviewing code, produce this report:

```
## Architecture Review: [File/PR Name]

### Layers ✅/❌
- [ ] Repository layer: Data access only
- [ ] Service layer: Business logic
- [ ] Controller layer: HTTP handling

### Database ✅/❌
- [ ] Paranoid models use `paranoid: true`
- [ ] Soft delete scope applied
- [ ] Migrations reversible
- [ ] Schema matches v2.1 design

### Transactions ✅/❌
- [ ] REPEATABLE_READ isolation
- [ ] Atomic operations (no check-then-act)
- [ ] Commit/rollback handled
- [ ] Transaction parameter passed to all operations

### Error Handling ✅/❌
- [ ] All errors use v2.1 codes
- [ ] Error response format standardized
- [ ] HTTP status codes correct

### Authorization ✅/❌
- [ ] Checks BEFORE data access
- [ ] Data scope enforced
- [ ] No authorization bypass

### Code Quality ✅/❌
- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Input validation present
- [ ] Tests comprehensive

### Recommendations

[List specific improvements needed]

### Status

✅ Approve | ❌ Request Changes | 🔄 Needs Review
```

---

## How to Use in Chat

```
Review this code against v2.1 architecture:
[paste code or file path]

Checklist focus:
- Transaction safety
- Soft deletes
- Error codes
- Authorization
```

The skill will audit your code and return a detailed report with specific recommendations.
