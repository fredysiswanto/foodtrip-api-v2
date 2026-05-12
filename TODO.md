# FoodTrip API v2.1 — Project TODO Tracking

**Status:** 🚀 Ready for Implementation  
**Version:** 2.1  
**Last Updated:** May 12, 2026  
**Total Timeline:** 18-20 weeks (MVP Phases 1-11)

---

## 📊 Progress Dashboard

| Phase | Status         | Duration | Key Deliverable         | Notes                                   |
| ----- | -------------- | -------- | ----------------------- | --------------------------------------- |
| 0     | ⏳ Not Started | 3-4 days | Framework verification  | Verify instructions, agents, skills     |
| 1     | ⏳ Not Started | 1 week   | Project setup           | TypeScript, database, errors, testing   |
| 2     | ⏳ Not Started | 1 week   | Database & ORM          | Sequelize config, migrations            |
| 3     | ⏳ Not Started | 1 week   | Shared infrastructure   | Middleware, helpers, utilities          |
| 4     | ⏳ Not Started | 1 week   | Authentication          | JWT, bcrypt, password reset             |
| 5     | ⏳ Not Started | 1 week   | Restaurant management   | CRUD with approval workflow             |
| 6     | ⏳ Not Started | 1 week   | Menu management         | Categories, dishes, stock               |
| 7     | ⏳ Not Started | 1 week   | Cart system             | Add/remove items, cart persistence      |
| 8     | ⏳ Not Started | 2 weeks  | Order system (CRITICAL) | Atomic stock deduction, transactions    |
| 9     | ⏳ Not Started | 1 week   | Delivery system         | Driver management, assignment, tracking |
| 10    | ⏳ Not Started | 1 week   | File uploads            | Centralized uploads table, S3 support   |
| 11    | ⏳ Not Started | 1 week   | Admin dashboard         | Analytics, user mgmt, approval system   |
| 12-15 | ⏳ Not Started | 4 weeks  | Testing & deployment    | Coverage, security, production setup    |

---

## 🎯 Phase 0: Verification & Setup (Days 1-3)

### Verification Tasks

- [ ] **Verify instructions load in VS Code**
  - Check: `.github/copilot-instructions.md` loaded
  - Test: Ask agent about v2.1 core principles
  - Success: Agent references 10 core principles
  - Duration: 30 min

- [ ] **Test all 5 agents with new instructions**
  - [ ] Test Architect agent
  - [ ] Test Implementation Engineer agent
  - [ ] Test Code Reviewer agent
  - [ ] Test Documentation Bot agent
  - [ ] Test Testing Specialist agent
  - Duration: 2 hours
  - Success: All agents follow v2.1 patterns

- [ ] **Verify 5 skills load correctly**
  - [ ] v2-1-architecture-review skill
  - [ ] stock-management-implementation skill
  - [ ] error-handling-implementation skill
  - [ ] sequelize-migration-creation skill
  - [ ] phase-planning-breakdown skill
  - Duration: 1.5 hours
  - Success: Skills provide detailed templates

- [ ] **Test one complete workflow**
  - Run: `/agents foodtrip-api-architect Create Phase 1 overview`
  - Verify: Complete breakdown with timeline
  - Check: All 10 core principles followed
  - Duration: 1 hour

### Setup Tasks

- [ ] **Initialize project directory structure**
  - Create: `src/app`, `src/config`, `src/modules`, `src/shared`, `src/database`
  - Create: `tests/`, `Plan_v2/` (already exists)
  - Duration: 1 hour

- [ ] **Setup TypeScript configuration**
  - Create: `tsconfig.json` (strict mode)
  - Create: `.eslintrc.json`
  - Create: `.prettierrc`
  - Duration: 1 hour
  - Success: `pnpm lint` passes

- [ ] **Create .env.example from ENVIRONMENT-GUIDE**
  - Reference: `Plan_v2/ENVIRONMENT-GUIDE.MD`
  - Include: 40+ variables (database, JWT, auth, storage, logging, etc.)
  - Duration: 1 hour

---

## 🚀 Phase 1: Project Setup (Week 1-2)

### Database & ORM Setup

- [ ] **Create Sequelize database configuration**
  - Create: `src/config/database.ts`
  - Setup: Connection pooling for SQLite (dev)
  - Setup: Connection pooling for MySQL (prod)
  - Duration: 2 hours

- [ ] **Create Phase 1 database migrations**
  - Reference: `Plan_v2/DATABASE_DESIGN-V2.1.MD`
  - Migrations:
    - [ ] Users table with soft deletes
    - [ ] Refresh tokens table
    - [ ] Roles table (with CHECK constraint)
    - [ ] All indexes and constraints
  - Duration: 3 hours
  - Success: `pnpm db:migrate` runs without errors

- [ ] **Create base Sequelize models**
  - Create: User model with soft deletes
  - Create: Role model
  - Create: RefreshToken model
  - Setup: Paranoid: true for soft deletes
  - Duration: 2 hours

### Infrastructure & Shared Layer

- [ ] **Implement error handling system**
  - Reference: `.github/skills/error-handling-implementation/SKILL.md`
  - Create: Base ApiError class
  - Create: 40+ custom error classes
  - Create: Error middleware
  - Create: Error response formatter
  - Duration: 4 hours
  - Success: All error codes mapped correctly

- [ ] **Implement logger**
  - Setup: Winston or Pino
  - Features: Request ID tracking, structured logs, log levels
  - Duration: 2 hours
  - Success: Logs appear in console

- [ ] **Create shared types and interfaces**
  - Create: IRequest extends Express.Request
  - Create: Common DTOs (CreateUserDTO, etc.)
  - Create: Pagination types
  - Create: API response types
  - Duration: 2 hours
  - Success: All TypeScript strict mode compliance

- [ ] **Create authentication helpers**
  - Create: JWT helper (sign, verify, decode)
  - Create: Bcrypt helper (hash, compare)
  - Create: Token refresh logic
  - Duration: 1.5 hours

### Testing Framework Setup

- [ ] **Setup Jest configuration**
  - Create: `jest.config.js`
  - Setup: Test environment (node)
  - Setup: Coverage thresholds (80%+)
  - Duration: 1 hour

- [ ] **Setup Supertest for API testing**
  - Create: Test helpers and utilities
  - Create: Database test fixtures
  - Create: Mock utilities
  - Duration: 1.5 hours

- [ ] **Create test setup scripts**
  - `pnpm test` — Run all tests
  - `pnpm test:watch` — Watch mode
  - `pnpm test:coverage` — Coverage report
  - Duration: 30 min

### Package & Build Setup

- [ ] **Configure package.json**
  - Add: All dependencies from v2.1 stack
  - Add: Build, dev, test, lint scripts
  - Add: Pre-commit hooks (Husky optional)
  - Duration: 1 hour
  - Dependencies:
    - [ ] express
    - [ ] sequelize
    - [ ] mysql2
    - [ ] jwt & bcrypt
    - [ ] helmet, cors, express-rate-limit
    - [ ] zod or joi (validation)
    - [ ] winston (logging)
    - [ ] jest, supertest (testing)
    - [ ] eslint, prettier (code quality)

- [ ] **Setup build pipeline**
  - Test: `pnpm build` compiles TypeScript
  - Test: `pnpm start` runs compiled code
  - Duration: 30 min

### Documentation

- [ ] **Document Phase 1 completion**
  - Update: README.MD installation section
  - Create: Initial API documentation structure
  - Duration: 1 hour

---

## 🔐 Phase 2: Database & Models (Week 2)

- [ ] **Create comprehensive database migrations**
  - Reference: `Plan_v2/DATABASE_DESIGN-V2.1.MD` (23 tables)
  - Migrations for: restaurants, categories, dishes, carts, orders, deliveries, uploads, etc.
  - Duration: 4-5 hours
  - Success: All tables created with constraints

- [ ] **Create all Sequelize models**
  - Models: User, Restaurant, Category, Dish, Cart, CartItem, Order, OrderItem, Delivery, Upload, etc.
  - Features:
    - [ ] Soft deletes on core tables (paranoid: true)
    - [ ] All relationships (hasMany, belongsTo, etc.)
    - [ ] Timestamps (createdAt, updatedAt)
    - [ ] Custom getters/setters as needed
  - Duration: 5-6 hours

- [ ] **Create database indexes**
  - Reference: DATABASE_DESIGN-V2.1.MD (40+ indexes)
  - Indexes: email, restaurant_id, user_id, status fields, etc.
  - Duration: 1 hour

- [ ] **Implement database constraints**
  - CHECK constraints: status ENUM values
  - UNIQUE constraints: email, slug, order_no
  - Foreign keys: CASCADE/RESTRICT policies
  - Duration: 1 hour

---

## 🔐 Phase 3: Shared Infrastructure (Week 2-3)

- [ ] **Implement rate limiting middleware**
  - General: 100 req/min
  - Auth endpoints: 20 req/min
  - Duration: 1 hour

- [ ] **Implement validation middleware**
  - Setup: Zod or Joi schemas
  - Middleware: Request validation
  - Duration: 2 hours

- [ ] **Implement authorization middleware**
  - Check: JWT token validity
  - Check: User role permissions
  - Scopes: user_id, restaurant_id
  - Duration: 2 hours

- [ ] **Create utility functions**
  - Response formatter (success, error)
  - Query builder helpers
  - Stock deduction helpers (CRITICAL)
  - Duration: 2 hours

- [ ] **Setup database transactions**
  - Helper: Transaction wrapper
  - Setup: REPEATABLE_READ isolation level
  - Duration: 1.5 hours

---

## 👤 Phase 4: Authentication (Week 3)

- [ ] **Implement user registration**
  - Endpoint: POST /api/v1/auth/register
  - Features: Email validation, password hashing, error handling
  - Tests: Valid/invalid inputs, duplicate email
  - Duration: 2 hours

- [ ] **Implement user login**
  - Endpoint: POST /api/v1/auth/login
  - Features: JWT generation (15m), refresh token (7d)
  - Tests: Valid/invalid credentials, rate limiting
  - Duration: 2 hours

- [ ] **Implement token refresh**
  - Endpoint: POST /api/v1/auth/refresh
  - Features: Validate refresh token, issue new access token
  - Tests: Expired tokens, invalid tokens
  - Duration: 1 hour

- [ ] **Implement password management**
  - Endpoints: Change password, reset password, forgot password
  - Features: Email verification, secure tokens
  - Duration: 2 hours

- [ ] **Test authentication system**
  - Unit tests: AuthService (register, login, refresh)
  - Integration tests: All auth endpoints
  - Error tests: All error codes (INVALID_CREDENTIALS, TOKEN_EXPIRED, etc.)
  - Coverage: >90%
  - Duration: 3 hours

---

## 🏪 Phase 5: Restaurant Management (Week 4)

- [ ] **Implement restaurant CRUD**
  - POST /api/v1/restaurants (create)
  - GET /api/v1/restaurants (list with pagination)
  - GET /api/v1/restaurants/:id (details)
  - PUT /api/v1/restaurants/:id (update)
  - DELETE /api/v1/restaurants/:id (soft delete)
  - Duration: 3 hours

- [ ] **Implement restaurant approval workflow**
  - Statuses: PENDING → APPROVED → ACTIVE → SUSPENDED
  - Endpoints: Super admin approval/rejection
  - Fields: rejected_reason field
  - Duration: 2 hours

- [ ] **Implement restaurant image management**
  - Logo upload (via uploads table)
  - Banner upload (via uploads table)
  - Image gallery support
  - Duration: 2 hours

- [ ] **Implement role-based access control**
  - Resto Admin: Can only manage own restaurant
  - Resto Staff: Can only view own restaurant
  - Super Admin: Can manage all restaurants
  - Duration: 1.5 hours

- [ ] **Test restaurant management**
  - Unit tests: RestaurantService
  - Integration tests: All endpoints
  - Authorization tests: Role-based access
  - Coverage: >80%
  - Duration: 2 hours

---

## 🍔 Phase 6: Menu Management (Week 5)

- [ ] **Implement category management**
  - CRUD endpoints for categories
  - Soft delete support
  - Unique per restaurant
  - Duration: 1.5 hours

- [ ] **Implement dish management**
  - POST /api/v1/dishes (create with stock)
  - GET /api/v1/dishes (list with pagination)
  - GET /api/v1/dishes/:id (details)
  - PUT /api/v1/dishes/:id (update price, stock, availability)
  - DELETE /api/v1/dishes/:id (soft delete)
  - Features: Slug generation, version field (optimistic locking)
  - Duration: 3 hours

- [ ] **Implement stock management**
  - Add: Stock field on dishes
  - Add: Version field (optimistic locking)
  - Validation: No negative stock
  - Duration: 1 hour

- [ ] **Implement dish image management**
  - Multiple images per dish
  - Via uploads table (centralized)
  - Gallery support
  - Duration: 1.5 hours

- [ ] **Test menu management**
  - Unit tests: DishService, CategoryService
  - Integration tests: All endpoints
  - Stock validation tests
  - Coverage: >80%
  - Duration: 2 hours

---

## 🛒 Phase 7: Cart System (Week 5-6)

- [ ] **Implement cart CRUD**
  - GET /api/v1/carts (get user's cart)
  - POST /api/v1/carts/items (add item)
  - PUT /api/v1/carts/items/:id (update quantity)
  - DELETE /api/v1/carts/items/:id (remove item)
  - DELETE /api/v1/carts (clear cart)
  - Duration: 3 hours

- [ ] **Implement cart constraints**
  - One cart per user per restaurant (UNIQUE constraint)
  - Cart total calculation
  - Pricing snapshot (preserves price at add time)
  - Duration: 1 hour

- [ ] **Implement cart persistence**
  - Save to database (not just session)
  - Real-time updates
  - Cart summary response
  - Duration: 1.5 hours

- [ ] **Test cart system**
  - Unit tests: CartService
  - Integration tests: All endpoints
  - Edge cases: Adding duplicate items, exceeding stock
  - Coverage: >80%
  - Duration: 2 hours

---

## 📦 Phase 8: Order System (2 weeks) ⚠️ CRITICAL

### CRITICAL: Stock Deduction with Race Condition Prevention

This phase is critical because it implements the atomic stock deduction strategy that prevents overselling.

- [ ] **Implement atomic stock deduction**
  - Reference: `Plan_v2/STOCK-MANAGEMENT-STRATEGY.MD`
  - Pattern: Single SQL UPDATE (no SELECT then UPDATE)
  - SQL: `UPDATE dishes SET stock = stock - :qty WHERE id = :id AND stock >= :qty`
  - Duration: 1 hour

- [ ] **Implement order creation with transactions**
  - Endpoint: POST /api/v1/orders (checkout)
  - Process:
    - [ ] Validate cart exists
    - [ ] Start transaction (REPEATABLE_READ)
    - [ ] Deduct stock atomically
    - [ ] Create order record
    - [ ] Create order items (snapshots)
    - [ ] Clear cart
    - [ ] Commit transaction
  - Duration: 3 hours

- [ ] **Implement order status tracking**
  - Statuses: PENDING → CONFIRMED → PREPARING → DELIVERING → COMPLETED
  - Optional: CANCELLED with stock refund
  - Endpoint: PUT /api/v1/orders/:id (update status)
  - Duration: 1.5 hours

- [ ] **Implement payment status tracking**
  - Statuses: UNPAID, PAID, FAILED, REFUNDED
  - Methods: CASH, TRANSFER, EWALLET, QRIS
  - Endpoint: PUT /api/v1/orders/:id/payment (update payment)
  - Duration: 1 hour

- [ ] **Implement order history & tracking**
  - GET /api/v1/orders (user's orders with pagination)
  - GET /api/v1/orders/:id (order details)
  - GET /api/v1/restaurants/:id/orders (restaurant's orders)
  - Duration: 2 hours

- [ ] **Implement immutable order items**
  - Snapshot: dish name, price, quantity at order time
  - Purpose: Preserve pricing history
  - Duration: 1 hour

### CRITICAL: Race Condition Testing

- [ ] **Create concurrent order tests**
  - Test: 10 simultaneous orders for same dish (stock: 5)
  - Expected: Only 5 orders succeed, 5 fail
  - Verify: No negative stock
  - Duration: 2 hours

- [ ] **Create transaction rollback tests**
  - Test: Order creation fails mid-transaction
  - Expected: Stock refunded, order not created
  - Duration: 1.5 hours

- [ ] **Create stock atomicity tests**
  - Test: Verify atomic UPDATE prevents overselling
  - Test: Version field increments correctly
  - Duration: 1 hour

- [ ] **Test order system (complete)**
  - Unit tests: OrderService (>90% coverage)
  - Integration tests: All endpoints
  - Concurrent tests: Race conditions
  - Error tests: INSUFFICIENT_STOCK, INVALID_STATE_TRANSITION, etc.
  - Coverage: >90%
  - Duration: 4 hours

**Duration:** 2 weeks total | Critical for production

---

## 🚚 Phase 9: Delivery System (Week 7)

- [ ] **Implement driver management**
  - CRUD endpoints for drivers
  - Soft delete support
  - Phone/email unique constraints
  - Duration: 1.5 hours

- [ ] **Implement delivery assignment**
  - Endpoint: POST /api/v1/deliveries (assign order to driver)
  - Auth: SUPER_ADMIN or RESTO_ADMIN only
  - Duration: 1.5 hours

- [ ] **Implement delivery tracking**
  - Statuses: PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
  - Optional: FAILED status
  - Endpoint: PUT /api/v1/deliveries/:id (update status)
  - Duration: 1.5 hours

- [ ] **Implement driver scoping**
  - Driver can only see assigned deliveries
  - Driver can only update own deliveries
  - Duration: 1 hour

- [ ] **Test delivery system**
  - Unit tests: DeliveryService
  - Integration tests: All endpoints
  - Authorization tests: Role-based access
  - Coverage: >80%
  - Duration: 2 hours

---

## 📁 Phase 10: File Upload System (Week 7-8)

- [ ] **Create uploads table**
  - Fields: id, uploader_id, file_name, mime_type, file_size, category, storage_type, storage_path, created_at
  - Reference: `Plan_v2/DATABASE_DESIGN-V2.1.MD`
  - Duration: 30 min

- [ ] **Implement file upload endpoint**
  - POST /api/v1/uploads (upload file)
  - Features: MIME type validation, file size limits, secure filename
  - Duration: 2 hours

- [ ] **Implement storage adapters**
  - Local storage (development)
  - S3 storage (production)
  - Storage type selection via .env
  - Duration: 2.5 hours

- [ ] **Implement file categories**
  - avatars (max 2MB)
  - restaurant_logos (max 5MB)
  - restaurant_banners (max 10MB)
  - dish_images (max 5MB)
  - Unique size limits per category
  - Duration: 1 hour

- [ ] **Implement file deletion**
  - DELETE /api/v1/uploads/:id
  - Soft delete support
  - Cascading deletes for references
  - Duration: 1 hour

- [ ] **Test file upload system**
  - Unit tests: UploadService
  - Integration tests: All endpoints
  - Storage adapter tests: Local & S3
  - File validation tests
  - Coverage: >80%
  - Duration: 2 hours

---

## 🧑‍💼 Phase 11: Admin Dashboard (Week 8)

- [ ] **Implement platform analytics**
  - GET /api/v1/admin/analytics
  - Metrics: Total orders, total revenue, order trends, top dishes
  - Time ranges: Today, this week, this month, custom
  - Duration: 2 hours

- [ ] **Implement user management**
  - GET /api/v1/admin/users (list all users with pagination)
  - GET /api/v1/admin/users/:id (user details)
  - PUT /api/v1/admin/users/:id (update role, status)
  - Filters: role, status, created_date range
  - Duration: 2 hours

- [ ] **Implement restaurant approval system**
  - GET /api/v1/admin/restaurants (list all with status)
  - PUT /api/v1/admin/restaurants/:id/approve (approve restaurant)
  - PUT /api/v1/admin/restaurants/:id/reject (reject with reason)
  - Filters: status (PENDING, APPROVED, ACTIVE, SUSPENDED)
  - Duration: 2 hours

- [ ] **Implement audit logging**
  - Create: audit_logs table
  - Log: All admin actions (approvals, rejections, user updates)
  - Endpoint: GET /api/v1/admin/audit-logs
  - Duration: 1.5 hours

- [ ] **Test admin system**
  - Unit tests: AdminService
  - Integration tests: All endpoints
  - Authorization tests: Super admin only
  - Analytics tests: Accurate calculations
  - Coverage: >80%
  - Duration: 2 hours

---

## 🧪 Phase 12: Testing & Quality Assurance (Week 9)

- [ ] **Achieve test coverage targets**
  - [ ] Auth: >90% coverage
  - [ ] Orders: >90% coverage
  - [ ] Stock Management: >95% coverage
  - [ ] Overall: >80% coverage
  - Command: `pnpm test --coverage`
  - Duration: 3-4 hours

- [ ] **Test all error codes**
  - Verify: All 40+ error codes tested
  - Coverage: Each error code has unit test
  - Coverage: Each error code has integration test
  - Duration: 2 hours

- [ ] **Test authorization boundaries**
  - Verify: Customer can't access admin endpoints
  - Verify: Resto Staff can't access other restaurants
  - Verify: Driver can only see own deliveries
  - Duration: 2 hours

- [ ] **Test soft delete behavior**
  - Verify: Deleted records excluded from queries
  - Verify: paranoid: true working correctly
  - Verify: Restore functionality (if implemented)
  - Duration: 1 hour

- [ ] **Performance testing (optional)**
  - Load test: 1000 concurrent requests
  - Stress test: Rate limiting behavior
  - Duration: 1.5 hours (optional)

---

## 📚 Phase 13: API Documentation (Week 10)

- [ ] **Generate Swagger/OpenAPI spec**
  - Tool: Swagger/OpenAPI 3.0
  - Coverage: All endpoints
  - Features: Request/response examples
  - Duration: 3 hours

- [ ] **Document all endpoints**
  - Format: OpenAPI 3.0
  - Include: Parameters, request body, response schema
  - Include: Example values for all endpoints
  - Duration: 2 hours

- [ ] **Document error codes**
  - For each endpoint: List all possible error codes
  - Include: HTTP status, error code, message
  - Duration: 1.5 hours

- [ ] **Document TypeScript interfaces**
  - Export: All request/response DTOs
  - Export: All model interfaces
  - Duration: 1 hour

- [ ] **Create deployment guide**
  - Setup: Environment variables
  - Setup: Database initialization
  - Setup: Production checklist
  - Duration: 1.5 hours

---

## 🔒 Phase 14: Security & Hardening (Week 10)

- [ ] **Implement CORS configuration**
  - Setup: CORS allowed origins (from .env)
  - Duration: 30 min

- [ ] **Implement Helmet security headers**
  - Setup: Default security headers
  - Duration: 30 min

- [ ] **Implement rate limiting**
  - General: 100 req/min
  - Auth: 20 req/min
  - Verify: Working correctly
  - Duration: 1 hour

- [ ] **Implement input validation**
  - Verify: All endpoints validate input
  - Coverage: All 40+ error codes
  - Duration: 1.5 hours

- [ ] **Security testing**
  - Test: SQL injection protection
  - Test: XSS protection
  - Test: CSRF protection (if applicable)
  - Duration: 1.5 hours

---

## 🚀 Phase 15: Deployment & Production (Week 11)

- [ ] **Setup production environment**
  - Configure: Production .env variables
  - Configure: Database (MySQL 8)
  - Configure: Logging (Sentry or similar)
  - Duration: 1 hour

- [ ] **Setup CI/CD pipeline**
  - GitHub Actions: Run tests on push
  - GitHub Actions: Run linting on push
  - Duration: 1.5 hours

- [ ] **Database migrations for production**
  - Verify: All migrations reversible
  - Test: Up and down migrations
  - Duration: 1 hour

- [ ] **Production deployment**
  - Setup: Application hosting (Heroku, Railway, AWS, etc.)
  - Setup: Database hosting (AWS RDS, MySQL, etc.)
  - Setup: File storage (S3 for production)
  - Duration: 2 hours

- [ ] **Production testing**
  - Verify: Application works end-to-end
  - Verify: Rate limiting working
  - Verify: Error handling working
  - Duration: 1.5 hours

---

## 📋 Phase 16+: Post-MVP Features

**Start after Phase 15 completes. Do NOT implement before MVP is done.**

- [ ] Payment gateway integration (Stripe, Midtrans)
- [ ] WebSocket real-time order tracking
- [ ] Push notifications (Firebase)
- [ ] Email notifications (SendGrid)
- [ ] Promo codes & discounts
- [ ] Reviews & ratings
- [ ] Loyalty points system
- [ ] Redis caching layer
- [ ] Advanced analytics
- [ ] SMS notifications (Twilio)
- [ ] Order scheduling (future orders)
- [ ] Bulk user management
- [ ] Restaurant analytics dashboard
- [ ] Custom reporting
- [ ] Mobile app (iOS/Android)

---

## 🎯 Quick Reference: By Category

### Database Tasks

- [ ] Phase 1: Setup database config
- [ ] Phase 2: Create migrations for all 23 tables
- [ ] Phase 2: Create all Sequelize models
- [ ] Phase 2: Create indexes (40+)
- [ ] Phase 3: Setup transaction helpers
- [ ] Phase 15: Production database setup

### Backend API Tasks

- [ ] Phase 1: Setup error handling (40+ codes)
- [ ] Phase 1: Setup logger
- [ ] Phase 3: Setup validation
- [ ] Phase 3: Setup authorization middleware
- [ ] Phase 3: Setup rate limiting
- [ ] Phase 4: Auth endpoints (register, login, refresh)
- [ ] Phase 5: Restaurant endpoints (CRUD + approval)
- [ ] Phase 6: Menu endpoints (categories, dishes)
- [ ] Phase 7: Cart endpoints (add, remove, update)
- [ ] Phase 8: Order endpoints (checkout, status, history) ⚠️ CRITICAL
- [ ] Phase 9: Delivery endpoints (assignment, tracking)
- [ ] Phase 10: Upload endpoints (upload, delete)
- [ ] Phase 11: Admin endpoints (analytics, user mgmt, approval)

### Testing Tasks

- [ ] Phase 1: Setup testing framework (Jest + Supertest)
- [ ] Phase 8: Create race condition tests ⚠️ CRITICAL
- [ ] Phase 8: Create transaction rollback tests ⚠️ CRITICAL
- [ ] Phase 12: Achieve coverage targets (>80%)
- [ ] Phase 12: Test all error codes
- [ ] Phase 12: Test authorization boundaries
- [ ] Phase 12: Test soft deletes
- [ ] Phase 14: Security testing

### Documentation Tasks

- [ ] Phase 1: Document Phase 1 in README
- [ ] Phase 13: Generate Swagger/OpenAPI spec
- [ ] Phase 13: Document all endpoints
- [ ] Phase 13: Document error codes
- [ ] Phase 13: Create deployment guide

### Infrastructure Tasks

- [ ] Phase 1: Setup TypeScript (strict mode)
- [ ] Phase 1: Setup ESLint & Prettier
- [ ] Phase 1: Setup package.json
- [ ] Phase 1: Setup build pipeline
- [ ] Phase 15: Setup CI/CD (GitHub Actions)
- [ ] Phase 15: Setup production environment

---

## 📊 Estimated Time Per Phase

```
Phase 1:  7 days  (Setup: TypeScript, database, errors, testing)
Phase 2:  7 days  (Database: 23 tables, models, indexes)
Phase 3:  7 days  (Infrastructure: middleware, helpers, utilities)
Phase 4:  7 days  (Auth: register, login, password reset)
Phase 5:  7 days  (Restaurants: CRUD, approval workflow)
Phase 6:  7 days  (Menu: categories, dishes, stock)
Phase 7:  7 days  (Cart: add/remove, persistence)
Phase 8:  14 days (Orders: CRITICAL stock deduction, race conditions)
Phase 9:  7 days  (Delivery: assignment, tracking)
Phase 10: 7 days  (Uploads: local & S3 storage)
Phase 11: 7 days  (Admin: analytics, user mgmt, approval)
Phase 12: 7 days  (Testing: coverage, error codes, auth)
Phase 13: 7 days  (Docs: Swagger, deployment guide)
Phase 14: 7 days  (Security: CORS, rate limiting, validation)
Phase 15: 7 days  (Deployment: CI/CD, production setup)
─────────────────
TOTAL:   103 days (≈ 18-20 weeks / 4-5 months)
```

---

## ✅ Success Criteria Per Phase

### Phase 0 Success

- [ ] All agents work with v2.1 instructions
- [ ] All skills provide detailed output
- [ ] One complete workflow tested
- [ ] No blockers for Phase 1

### Phase 1 Success

- [ ] `pnpm install` succeeds
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm lint` passes all checks
- [ ] `pnpm test` runs (empty test suite OK)
- [ ] Database connects
- [ ] Error middleware working
- [ ] Logger working

### Phase 2 Success

- [ ] All 23 tables created
- [ ] All migrations reversible
- [ ] `pnpm db:migrate` succeeds
- [ ] `pnpm db:rollback` succeeds
- [ ] All models compile (TypeScript)
- [ ] All relationships working

### Phase 4 Success (Auth)

- [ ] Register endpoint working
- [ ] Login returns JWT token
- [ ] Token refresh working
- [ ] Auth middleware protecting endpoints
- [ ] > 90% test coverage

### Phase 8 Success (CRITICAL)

- [ ] Atomic stock deduction implemented
- [ ] Zero overselling in concurrent tests
- [ ] Transaction rollback working
- [ ] > 90% test coverage
- [ ] Race condition tests passing
- [ ] READY FOR PRODUCTION

### Phase 12 Success (Testing)

- [ ] Overall coverage >80%
- [ ] All 40+ error codes tested
- [ ] Authorization tests passing
- [ ] Soft delete tests passing
- [ ] Zero flaky tests

### Phase 15 Success (Deployment)

- [ ] Production environment working
- [ ] Database backups configured
- [ ] Monitoring (Sentry) configured
- [ ] CI/CD pipeline working
- [ ] Ready for production launch

---

## 📝 Notes

- **Stay on schedule** — Each phase depends on previous phases
- **Stock deduction is critical** — Phase 8 prevents overselling
- **Test as you go** — Don't save testing for Phase 12
- **Follow v2.1 patterns** — Refer to Plan_v2 documents constantly
- **Use agents for planning** — Let them break down each phase
- **Commit early, commit often** — Small commits are easier to review

---

## 🔗 Key References

- `.github/copilot-instructions.md` — 10 core principles (mandatory)
- `Plan_v2/DATABASE_DESIGN-V2.1.MD` — 23-table schema
- `Plan_v2/API-ERROR-CODES.MD` — 40+ error codes
- `Plan_v2/STOCK-MANAGEMENT-STRATEGY.MD` — Race condition prevention
- `Plan_v2/ENVIRONMENT-GUIDE.MD` — Configuration
- `Plan_v2/IMPLEMENTATION-CHECKLIST.MD` — Detailed phase breakdown

---

## 🚀 How to Use This TODO

1. **Pick a phase** — Start with Phase 1
2. **Check tasks** — See what needs to be done
3. **Use agents** — `/agents foodtrip-api-architect Create Phase X overview`
4. **Implement** — Use FoodTrip Implementation Engineer agent
5. **Test** — Use FoodTrip Testing Specialist agent
6. **Review** — Use FoodTrip Code Reviewer agent
7. **Document** — Use FoodTrip Documentation Bot agent
8. **Mark complete** — Check off tasks as done
9. **Move to next phase** — When all tasks complete

---

**Status:** 🚀 Ready to start Phase 1  
**Next Action:** Run `pnpm install` and verify all 5 agents work with your instructions  
**Estimated MVP Completion:** 18-20 weeks from start
