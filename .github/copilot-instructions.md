# FoodTrip API v2.1 — Project Instructions

**Last Updated:** May 12, 2026  
**Applies To:** All agents, developers, and contributions to FoodTrip API v2.1

---

## 🎯 Core Principles

All work on FoodTrip API must follow these non-negotiable principles:

### 1. **Architecture Alignment**

- Follow **Controller → Service → Repository** pattern
- Use **Sequelize ORM** with `paranoid: true` for soft deletes
- Implement **transaction isolation** (REPEATABLE_READ) for critical operations
- Never deviate from v2.1 architecture decisions documented in `Plan_v2/`

### 2. **Transaction & Data Safety**

- **Stock deduction MUST use atomic SQL UPDATE** (single operation, no separate SELECT)
  ```typescript
  UPDATE dishes SET stock = stock - :qty, version = version + 1
  WHERE id = :id AND stock >= :qty
  ```
- All financial/order operations require explicit `transaction` parameter
- Use `sequelize.transaction()` wrapper for multi-step operations
- Never allow negative stock, negative totals, or duplicate orders

### 3. **Error Handling**

- Use standardized error codes from `API-ERROR-CODES.MD` (40+ codes defined)
- Every endpoint must validate input and return proper error response
- Error response format:
  ```json
  {
    "success": false,
    "message": "User error",
    "errors": [
      {
        "code": "INVALID_EMAIL",
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
  ```
- Map error codes to HTTP status correctly (400, 401, 403, 429, 500, etc.)

### 4. **Security & Authorization**

- Validate authorization BEFORE data access (not after)
- Check role + resource ownership for all operations
- Rate limiting: 20 req/min for auth, 100 req/min for general
- Hash passwords with bcrypt (10+ rounds)
- JWT tokens: 15m access, 7d refresh

### 5. **Code Quality**

- **TypeScript strict mode** — No `any`, no type escapes
- **ESLint + Prettier** enforced on all PRs
- Meaningful variable/function names (avoid abbreviations)
- Comments only for "why", not "what" (code should be self-documenting)
- Max function length: 50 lines (break into smaller functions)

### 6. **Testing**

- **Unit tests** for services & helpers (mock dependencies)
- **Integration tests** for API endpoints (real DB, transactions)
- **Race condition tests** for concurrent stock deduction (CRITICAL)
- **Error coverage** — test all error codes returned by each endpoint
- Minimum coverage: 80% for critical modules (auth, orders, stock)

### 7. **Database Standards**

- All migrations must be **reversible** (down function implemented)
- Table names: `snake_case` (users, restaurant_menus)
- Column names: `snake_case` (created_at, updated_at, deleted_at)
- Foreign keys: `{table}_id` (restaurant_id, user_id)
- Never allow NULL for critical fields (use default or CHECK constraints)
- Soft delete scope: All queries on paranoid models exclude deleted_at IS NULL

### 8. **API Standards**

- Endpoint format: `/api/v1/{resource}/{id}/{action}`
- Request validation: Use middleware or schema validators
- Response status: 200 (success), 201 (created), 204 (no content), 400+ (errors)
- Pagination: `limit`, `offset`, `total`, `hasMore` in response
- Field names in API: `camelCase` (createdAt, restaurantId)

### 9. **Documentation**

- Document ALL endpoints in Swagger/OpenAPI format
- Include request/response examples
- Document error codes each endpoint returns
- Provide TypeScript interfaces in API documentation
- Link related documents: endpoints reference error codes, error codes reference HTTP status

### 10. **Phases & Scope**

- Work ONLY on your assigned phase
- Check `IMPLEMENTATION-CHECKLIST.MD` for exact tasks
- Do NOT add Post-MVP features before Phase 11 completes
- Post-MVP features deferred to Phase 16+

---

## 🔄 Development Workflow

### For Any Task:

1. **Reference the Plan** — Check `Plan_v2/IMPLEMENTATION-CHECKLIST.MD` for the phase
2. **Understand Context** — Read related documents (DATABASE_DESIGN, ERROR-CODES, ENVIRONMENT-GUIDE)
3. **Design First** — Plan the implementation (schema, error codes, tests)
4. **Code** — Follow architecture patterns from this file
5. **Test** — Unit + integration tests before PR
6. **Review** — Use FoodTrip Code Reviewer agent for final check

### When Creating a New Feature:

1. **Check Database** — Is the table/column in `DATABASE_DESIGN-V2.1.MD`?
2. **Check Error Codes** — Are all error cases in `API-ERROR-CODES.MD`?
3. **Check Phase** — Is this feature in your current phase?
4. **Design Endpoints** — Prepare request/response examples
5. **Implement** — Create model, repository, service, controller, routes
6. **Test** — All success + error paths
7. **Document** — Swagger spec with examples

---

## 🛠️ Code Patterns

### Service Layer Example

```typescript
// CORRECT: Service returns plain data/error, doesn't know about HTTP
class OrderService {
  async createOrder(userId: string, cartItems: CartItem[], t: Transaction) {
    // Validate authorization (user owns cart)
    // Deduct stock atomically
    // Create order + order items in transaction
    // Return Order object or throw error
    return order;
  }
}
```

### Controller Layer Example

```typescript
// CORRECT: Controller handles HTTP, uses service
async createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.createOrder(
      req.user.id,
      req.body.items,
      req.transaction
    );
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error); // Pass to error middleware
  }
}
```

### Error Handling Example

```typescript
// CORRECT: Custom error with code
class InsufficientStockError extends ApiError {
  constructor(message = "Not enough stock") {
    super(400, "INSUFFICIENT_STOCK", message, "stock");
  }
}

// Throw in service, catch in middleware
throw new InsufficientStockError(`Only ${available} units available`);
```

### Transaction Example

```typescript
// CORRECT: Atomic operation with rollback
const t = await sequelize.transaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
});

try {
  // All operations must pass transaction
  const updated = await Dish.update(
    { stock: sequelize.where(...) },
    { where: { id }, transaction: t }
  );

  if (!updated) throw new InsufficientStockError(...);

  const order = await Order.create({...}, { transaction: t });

  await t.commit();
  return order;
} catch (error) {
  await t.rollback();
  throw error;
}
```

---

## ❌ Anti-Patterns (Never Do These)

| Anti-Pattern                        | Problem                                     | Solution                                                  |
| ----------------------------------- | ------------------------------------------- | --------------------------------------------------------- |
| Check then act (SELECT then UPDATE) | Race condition with concurrent requests     | Use atomic SQL UPDATE (see Stock Management)              |
| HTTP logic in service               | Service tied to request/response            | Move HTTP handling to controller                          |
| Missing authorization check         | Security vulnerability                      | Check `req.user.restaurantId === dish.restaurantId` FIRST |
| No transaction for multi-step       | Data inconsistency if partial failure       | Wrap in `sequelize.transaction()`                         |
| `any` type in TypeScript            | Defeats type safety                         | Use proper types, generics if needed                      |
| Soft delete filter in code          | Forget to exclude deleted records           | Use Sequelize `paranoid: true` + scopes                   |
| String concatenation for SQL        | SQL injection vulnerability                 | Use parameterized queries (Sequelize does this)           |
| No error code                       | Client can't handle errors programmatically | Use standardized error code from API-ERROR-CODES          |
| Commit without tests                | Broken code in main                         | Run `pnpm test` before push                               |
| Missing migration down              | Database state unpredictable                | Always implement rollback function                        |

---

## 📋 Pre-Commit Checklist

Before submitting a PR, verify:

- [ ] Code follows TypeScript strict mode
- [ ] All functions have JSDoc comments
- [ ] No `any` types or type escapes
- [ ] Error codes match `API-ERROR-CODES.MD`
- [ ] Unit + integration tests added
- [ ] Tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] No console.log() in production code (use logger)
- [ ] Transactions used for multi-step operations
- [ ] Authorization checks before data access
- [ ] Soft delete scope applied correctly
- [ ] Database migration is reversible
- [ ] API documentation updated in Swagger
- [ ] Error response format matches standard
- [ ] No hardcoded values (use .env)

---

## 🤖 Using AI Agents

When working with agents, be explicit about:

1. **Which phase** you're in (e.g., "Phase 4: Auth System")
2. **What decision** you need (e.g., "Design the checkout process")
3. **What constraint** matters (e.g., "Must prevent race conditions")

**Example prompts:**

```
/agents foodtrip-api-architect Create detailed Phase 8 checklist with all transactions
/agents foodtrip-implementation-engineer Implement atomic stock deduction following STOCK-MANAGEMENT-STRATEGY
/agents foodtrip-testing-specialist Create concurrent race condition tests for order checkout
/agents foodtrip-code-reviewer Review this PR for transaction safety and error handling
```

---

## 📚 Key References

Always consult these documents before coding:

- **[IMPLEMENTATION-CHECKLIST.MD](../../Plan_v2/IMPLEMENTATION-CHECKLIST.MD)** — 15 phases, exact tasks
- **[DATABASE_DESIGN-V2.1.MD](../../Plan_v2/DATABASE_DESIGN-V2.1.MD)** — Schema, constraints, indexes
- **[API-ERROR-CODES.MD](../../Plan_v2/API-ERROR-CODES.MD)** — All 40+ error codes with HTTP mapping
- **[STOCK-MANAGEMENT-STRATEGY.MD](../../Plan_v2/STOCK-MANAGEMENT-STRATEGY.MD)** — Prevent overselling
- **[ENVIRONMENT-GUIDE.MD](../../Plan_v2/ENVIRONMENT-GUIDE.MD)** — .env setup, secrets
- **[README.MD](../../README.MD)** — Quick overview & agent guide

---

## 🆘 Common Questions

**Q: What if I disagree with a v2.1 decision?**  
A: Document your reasoning in a GitHub issue. Don't code around it — consistency is critical.

**Q: Can I use a different ORM or library?**  
A: No. Stick to v2.1 stack (Sequelize, Express, Bcrypt, JWT, Helmet, etc.). Deviations break consistency.

**Q: What about performance optimization?**  
A: After Phase 11 (MVP). Focus on correctness & safety first, optimize later.

**Q: How do I handle fields not in the schema?**  
A: Check `DATABASE_DESIGN-V2.1.MD`. If missing, propose it as a Phase 16+ enhancement.

**Q: Can I skip writing tests?**  
A: No. Tests are mandatory. They catch race conditions, authorization bugs, and error cases.

---

## 📞 Getting Help

- **Architecture questions** → Consult Plan_v2 docs or use FoodTrip API Architect agent
- **Code review** → Use FoodTrip Code Reviewer agent
- **Implementation help** → Use FoodTrip Implementation Engineer agent
- **Testing help** → Use FoodTrip Testing Specialist agent
- **Documentation** → Use FoodTrip Documentation Bot agent

---

**Remember:** Consistency > Perfection. The v2.1 plan is battle-tested. Follow it exactly.
