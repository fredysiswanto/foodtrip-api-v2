# Implementation Checklist (v2.1)

Complete phased roadmap incorporating all v2.1 improvements. Organized by phase with clear dependencies and milestones.

**📖 For detailed Phase 1 breakdown with configuration examples and rationale, see [PHASE-1-OVERVIEW.MD](./PHASE-1-OVERVIEW.MD)**

---

# Phase 1: Project Setup & Infrastructure

## 1.1 Initialize Project

- [ ] Create project directory structure
- [ ] Initialize pnpm workspace
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Setup path aliases (`@/src`, `@modules`, `@shared`)

## 1.2 Dependencies

- [ ] Install core: express, sequelize, pg/mysql2, dotenv
- [ ] Install auth: jsonwebtoken, bcryptjs
- [ ] Install validation: zod or joi
- [ ] Install file upload: multer, sharp (image processing)
- [ ] Install security: helmet, cors, express-rate-limit
- [ ] Install testing: jest, supertest
- [ ] Install dev tools: ts-node, nodemon, tsconfig-paths

## 1.3 Configuration

- [ ] Setup environment files (`.env.example`, `.env.development`)
- [ ] Create config loaders (`src/config/`)
- [ ] Configure database connection
- [ ] Configure logging service
- [ ] Configure JWT strategy
- [ ] Validate environment on startup

## 1.4 Code Quality

- [ ] Install ESLint, Prettier
- [ ] Configure lint rules
- [ ] Install Husky & lint-staged
- [ ] Setup commit hooks (conventional commits)
- [ ] Create `.gitignore`

## 1.5 Build & Run Scripts

- [ ] `pnpm dev` - development server with auto-reload
- [ ] `pnpm build` - TypeScript compilation
- [ ] `pnpm start` - run production build
- [ ] `pnpm lint` - ESLint check
- [ ] `pnpm format` - Prettier formatting
- [ ] `pnpm test` - run tests
- [ ] `pnpm db:migrate` - run migrations
- [ ] `pnpm db:seed` - seed database

---

# Phase 2: Database & ORM Setup

**📖 For detailed Phase 2 breakdown with migration examples and schema guide, see [PHASE-2-OVERVIEW.MD](./PHASE-2-OVERVIEW.MD)**

## 2.1 Sequelize Configuration

- [ ] Initialize Sequelize CLI
- [ ] Configure SQLite for development
- [ ] Configure MySQL for production (when ready)
- [ ] Setup connection pooling
- [ ] Configure logging

## 2.2 Migrations Infrastructure

- [ ] Create migrations directory structure
- [ ] Setup migration runner
- [ ] Create initial database creation migration

## 2.3 Database Schema (v2.1)

- [ ] Migration: roles table
- [ ] Migration: users table (with CHECK constraint)
- [ ] Migration: refresh_tokens table
- [ ] Migration: restaurants table (with status CHECK, UNIQUE slug)
- [ ] Migration: restaurant_images table
- [ ] Migration: categories table
- [ ] Migration: dishes table (with version, CHECK stock >= 0)
- [ ] Migration: dish_images table
- [ ] Migration: carts table (UNIQUE user_id + restaurant_id)
- [ ] Migration: cart_items table
- [ ] Migration: orders table (with status/payment_status CHECK)
- [ ] Migration: order_items table
- [ ] Migration: deliveries table (with status CHECK)
- [ ] Migration: uploads table (with type and folder columns)
- [ ] Migration: audit_logs table

## 2.4 Indexes

- [ ] Add all recommended indexes from DATABASE DESIGN-V2.1.MD
- [ ] Test query performance

## 2.5 Seeding Infrastructure

- [ ] Create seeders directory
- [ ] Create role seeder
- [ ] Create sample restaurant seeder
- [ ] Create sample user seeder

---

# Phase 3: Shared Infrastructure

## 3.1 Error Handling (v2.1)

- [ ] Create `AppError` base class
- [ ] Create domain-specific error classes:
  - [ ] `ValidationError`
  - [ ] `UnauthorizedError`
  - [ ] `ForbiddenError`
  - [ ] `NotFoundError`
  - [ ] `ConflictError`
  - [ ] `InsufficientStockError`
  - [ ] `InvalidStatusTransitionError`
  - [ ] `RateLimitError`

## 3.2 Response Helpers

- [ ] Create success response formatter
- [ ] Create error response formatter (with error code taxonomy)
- [ ] Create pagination helper
- [ ] Create validation error aggregator

## 3.3 Constants

- [ ] Role constants (SUPER_ADMIN, RESTO_ADMIN, etc.)
- [ ] Order status constants
- [ ] Payment status constants
- [ ] Delivery status constants
- [ ] HTTP status codes
- [ ] Error code constants (from API-ERROR-CODES.MD)

## 3.4 Middleware

- [ ] Logger middleware (request/response)
- [ ] CORS middleware
- [ ] Helmet middleware (security headers)
- [ ] Request validation middleware
- [ ] Error handler middleware (with error codes)
- [ ] Auth middleware (JWT validation)
- [ ] Role authorization middleware
- [ ] Rate limiter middleware (v2.1)

## 3.5 Utilities

- [ ] JWT helper (sign, verify, decode)
- [ ] Bcrypt helper (hash, compare)
- [ ] UUID generator
- [ ] Date utilities (timezone support)
- [ ] Slug generator
- [ ] Optimistic lock helper (from STOCK-MANAGEMENT-STRATEGY.MD)
- [ ] Stock deduction helper

## 3.6 Types & Interfaces

- [ ] User types
- [ ] Restaurant types
- [ ] Order types
- [ ] Delivery types
- [ ] Error response types
- [ ] Pagination types

---

# Phase 4: Authentication & Authorization

## 4.1 Models

- [ ] Role model with associations
- [ ] User model with:
  - [ ] Soft deletes (paranoid: true)
  - [ ] Role association
  - [ ] Restaurant association (nullable)
  - [ ] Avatar association to uploads
  - [ ] Validation rules

## 4.2 Auth Service

- [ ] Register user
- [ ] Login user (return access + refresh tokens)
- [ ] Refresh token generation
- [ ] Token validation
- [ ] Token revocation

## 4.3 Auth Controller & Routes

- [ ] POST /api/v1/auth/register
- [ ] POST /api/v1/auth/login
- [ ] POST /api/v1/auth/refresh
- [ ] POST /api/v1/auth/logout
- [ ] GET /api/v1/auth/me (current user)

## 4.4 Authorization

- [ ] Role-based middleware
- [ ] Restaurant ownership validation
- [ ] Permission checking
- [ ] Apply to all protected routes

## 4.5 Testing

- [ ] Unit tests for auth service
- [ ] Integration tests for auth routes
- [ ] Test invalid credentials
- [ ] Test token expiration

---

# Phase 5: Restaurant Management

## 5.1 Models

- [ ] Restaurant model with:
  - [ ] Soft deletes
  - [ ] Owner user association
  - [ ] Status workflow (PENDING → APPROVED → ACTIVE → SUSPENDED)
  - [ ] Rejection reason field
  - [ ] Logo & banner association to uploads
  - [ ] Slug uniqueness

## 5.2 Restaurant Service & Repository

- [ ] Create restaurant
- [ ] Update restaurant
- [ ] Get restaurant by ID
- [ ] List restaurants (with filtering by status)
- [ ] Get restaurants by owner
- [ ] Soft delete restaurant

## 5.3 Admin Approval Workflow

- [ ] List pending restaurants (admin only)
- [ ] Approve restaurant
- [ ] Reject restaurant (with reason)
- [ ] Suspend restaurant
- [ ] Reactivate restaurant

## 5.4 Routes

- [ ] GET /api/v1/restaurants (public, filtered)
- [ ] GET /api/v1/restaurants/:id
- [ ] POST /api/v1/restaurants (resto owner only)
- [ ] PATCH /api/v1/restaurants/:id (owner only)
- [ ] PATCH /api/v1/restaurants/:id/status (admin only)
- [ ] DELETE /api/v1/restaurants/:id (owner only)

## 5.5 Image Management (v2.1)

- [ ] Upload restaurant logo (via uploads service)
- [ ] Upload restaurant banner
- [ ] Delete restaurant image

## 5.6 Testing

- [ ] Unit tests for restaurant service
- [ ] Integration tests for approval workflow
- [ ] Test authorization boundaries

---

# Phase 6: Categories & Dishes Management

## 6.1 Models

- [ ] Category model
- [ ] Dish model with:
  - [ ] Soft deletes
  - [ ] Version column (optimistic locking)
  - [ ] Stock field with CHECK >= 0
  - [ ] Image association to uploads
  - [ ] Restaurant-slug uniqueness
  - [ ] Availability toggle

## 6.2 Category Service

- [ ] Create category
- [ ] List categories
- [ ] Update category
- [ ] Delete category

## 6.3 Dish Service (v2.1)

- [ ] Create dish
- [ ] List dishes (scoped by restaurant)
- [ ] Get dish by ID
- [ ] Update dish (price, availability, etc.)
- [ ] Delete dish (soft)
- [ ] **Deduct stock atomically** (from STOCK-MANAGEMENT-STRATEGY.MD)
- [ ] Check stock availability
- [ ] Add stock (for refunds)

## 6.4 Routes

- [ ] POST /api/v1/categories
- [ ] GET /api/v1/categories
- [ ] GET /api/v1/dishes (by restaurant_id)
- [ ] GET /api/v1/dishes/:id
- [ ] POST /api/v1/dishes (resto admin only)
- [ ] PATCH /api/v1/dishes/:id (resto admin only)
- [ ] PATCH /api/v1/dishes/:id/stock (atomic deduction)
- [ ] DELETE /api/v1/dishes/:id (resto admin only)

## 6.5 Image Management (v2.1)

- [ ] Upload dish image
- [ ] List dish images
- [ ] Delete dish image

## 6.6 Validation

- [ ] Price > 0
- [ ] Stock >= 0
- [ ] Availability rules

## 6.7 Testing

- [ ] Stock deduction atomicity test (concurrent orders)
- [ ] Test insufficient stock error
- [ ] Soft delete verification

---

# Phase 7: Cart System

## 7.1 Models

- [ ] Cart model with UNIQUE(user_id, restaurant_id)
- [ ] CartItem model

## 7.2 Cart Service

- [ ] Get or create cart
- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear cart
- [ ] Get cart summary

## 7.3 Business Rules

- [ ] Enforce 1 cart per user per restaurant
- [ ] Prevent adding items from different restaurants
- [ ] Update cart timestamp on changes

## 7.4 Routes

- [ ] GET /api/v1/cart (current user's cart)
- [ ] POST /api/v1/cart/items (add item)
- [ ] PUT /api/v1/cart/items/:id (update quantity)
- [ ] DELETE /api/v1/cart/items/:id (remove item)
- [ ] DELETE /api/v1/cart (clear cart)

## 7.5 Testing

- [ ] Test cart isolation per restaurant
- [ ] Test quantity updates
- [ ] Test cart summary calculation

---

# Phase 8: Order System (Critical)

## 8.1 Models

- [ ] Order model with:
  - [ ] Soft deletes
  - [ ] Status CHECK constraint
  - [ ] Payment status CHECK
  - [ ] Snapshot fields (customer_name, phone, address)
  - [ ] Timestamps for each status

## 8.2 OrderItem Model

- [ ] Snapshot: dish_name, dish_price
- [ ] Quantity & subtotal
- [ ] Immutable after creation

## 8.3 Order Service (v2.1)

- [ ] Create order (from cart):
  - [ ] Validate stock (check before deduct)
  - [ ] **Atomically deduct stock** (STOCK-MANAGEMENT-STRATEGY)
  - [ ] Create order items (snapshots)
  - [ ] Clear cart
  - [ ] All in one transaction
- [ ] Get order by ID
- [ ] List orders (scoped by user/restaurant)
- [ ] Update order status (with validation)
- [ ] Cancel order (with stock refund)

## 8.4 Order Status Flow

- [ ] PENDING → CONFIRMED
- [ ] CONFIRMED → PREPARING
- [ ] PREPARING → DELIVERING (only if delivery assigned)
- [ ] DELIVERING → COMPLETED
- [ ] Any → CANCELLED (with stock restoration)

## 8.5 Routes

- [ ] POST /api/v1/orders (checkout)
- [ ] GET /api/v1/orders (list)
- [ ] GET /api/v1/orders/:id
- [ ] PATCH /api/v1/orders/:id/status (update status)
- [ ] PATCH /api/v1/orders/:id/cancel (cancel with refund)

## 8.6 Validation (v2.1)

- [ ] Cart not empty
- [ ] Stock available for all items
- [ ] Valid status transitions
- [ ] Restaurant open check (optional)
- [ ] Minimum order amount (future)

## 8.7 Testing (Critical)

- [ ] Test atomic stock deduction during checkout
- [ ] Test concurrent order creation (race condition)
- [ ] Test order status transitions
- [ ] Test overselling prevention
- [ ] Test stock refund on cancellation
- [ ] Test order immutability

---

# Phase 9: Delivery System (v2.1)

## 9.1 Models

- [ ] Delivery model with:
  - [ ] Status CHECK constraint
  - [ ] Driver association (FK users where role = DRIVER)
  - [ ] Order association (UNIQUE order_id)
  - [ ] Timestamps

## 9.2 Delivery Service

- [ ] Assign driver to order
- [ ] Get delivery by order
- [ ] List deliveries (driver sees own, admin sees all)
- [ ] Update delivery status

## 9.3 Business Rules

- [ ] Only SUPER_ADMIN or RESTO_ADMIN can assign driver
- [ ] Order must be CONFIRMED before assignment
- [ ] Driver must exist and have DRIVER role
- [ ] Status transitions: PENDING → PICKED_UP → IN_TRANSIT → DELIVERED

## 9.4 Driver Routes

- [ ] GET /api/v1/deliveries (list my deliveries)
- [ ] GET /api/v1/deliveries/:id
- [ ] PATCH /api/v1/deliveries/:id/status (driver updates)

## 9.5 Admin Routes

- [ ] POST /api/v1/deliveries/assign (assign driver)
- [ ] GET /api/v1/deliveries (list all)

## 9.6 Real-Time Features (Future)

- [ ] WebSocket for live location tracking
- [ ] Push notifications on status change

## 9.7 Testing

- [ ] Test driver assignment
- [ ] Test status transitions
- [ ] Test authorization

---

# Phase 10: File Upload System (v2.1)

## 10.1 Upload Model

- [ ] Upload model with:
  - [ ] Original filename
  - [ ] Hashed filename (security)
  - [ ] MIME type validation
  - [ ] Type field (avatar, restaurant_logo, dish_image)
  - [ ] Folder field (organization)
  - [ ] Size tracking
  - [ ] Uploader tracking

## 10.2 Storage Service (v2.1)

- [ ] Abstract storage interface
- [ ] Local storage implementation (development)
- [ ] S3 implementation (production)
- [ ] GCS implementation (optional)

## 10.3 Upload Service

- [ ] Upload file with validation
- [ ] Delete file
- [ ] Get file info
- [ ] Generate signed URLs (for S3)

## 10.4 Routes

- [ ] POST /api/v1/uploads (upload file)
- [ ] GET /api/v1/uploads/:id (get file info)
- [ ] DELETE /api/v1/uploads/:id (delete file)

## 10.5 Configuration (from ENVIRONMENT-GUIDE)

- [ ] Setup STORAGE_TYPE environment variable
- [ ] Configure local storage path (dev)
- [ ] Configure S3 credentials (prod)
- [ ] File size limits per type
- [ ] Allowed MIME types

## 10.6 Testing

- [ ] Test file upload
- [ ] Test file deletion
- [ ] Test concurrent uploads
- [ ] Test S3 connectivity (staging/prod)

---

# Phase 11: Admin Dashboard API

## 11.1 Analytics Service

- [ ] Total orders count
- [ ] Total revenue
- [ ] Order trend (daily/weekly/monthly)
- [ ] Restaurant count
- [ ] User count by role

## 11.2 Admin Routes

- [ ] GET /api/v1/admin/analytics
- [ ] GET /api/v1/admin/users (list all users)
- [ ] GET /api/v1/admin/restaurants (list all)
- [ ] PATCH /api/v1/admin/restaurants/:id/approve
- [ ] PATCH /api/v1/admin/restaurants/:id/reject

## 11.3 Audit Logging (v2.1)

- [ ] Log all admin actions
- [ ] Log restaurant approvals/rejections
- [ ] Log user management operations
- [ ] Exclude sensitive data from logs

## 11.4 Testing

- [ ] Test authorization (super admin only)
- [ ] Test analytics calculation

---

# Phase 12: Testing Infrastructure

## 12.1 Unit Tests

- [ ] Auth service tests
- [ ] Stock deduction logic tests
- [ ] Order status validation tests
- [ ] Validation helper tests

## 12.2 Integration Tests

- [ ] Auth flow (register → login → refresh)
- [ ] Order creation (cart → checkout → order)
- [ ] Stock deduction with concurrent orders
- [ ] Delivery assignment
- [ ] File upload

## 12.3 E2E Tests (Optional for MVP)

- [ ] Full order flow
- [ ] Approval workflow
- [ ] Refund flow

## 12.4 Test Database

- [ ] Separate test database
- [ ] Automated cleanup between tests
- [ ] Seed test data

## 12.5 CI/CD Integration

- [ ] Run tests on push
- [ ] Coverage reporting
- [ ] Lint checks

---

# Phase 13: API Documentation (v2.1)

## 13.1 OpenAPI/Swagger

- [ ] Setup swagger-ui in dev environment
- [ ] Document all endpoints
- [ ] Include error codes from API-ERROR-CODES.MD
- [ ] Document request/response schemas

## 13.2 Documentation

- [ ] Installation guide
- [ ] API reference
- [ ] Authentication guide
- [ ] Error handling guide
- [ ] Deployment guide

---

# Phase 14: Security Hardening (v2.1)

## 14.1 Rate Limiting (v2.1)

- [ ] Configure rate limiter middleware
- [ ] Apply to auth endpoints (20 req/min)
- [ ] Apply to general endpoints (100 req/min)
- [ ] Return 429 with proper error code

## 14.2 Input Validation

- [ ] Validate all inputs with Zod/Joi
- [ ] Sanitize strings
- [ ] Validate email format
- [ ] Validate phone format

## 14.3 Security Headers (Helmet)

- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] HSTS

## 14.4 CORS Configuration

- [ ] Restrict origins
- [ ] Allow credentials
- [ ] Configure methods

## 14.5 Data Protection

- [ ] Hash passwords with bcrypt (rounds: 10+)
- [ ] Never log sensitive data
- [ ] Mask email/phone in audit logs

---

# Phase 15: Deployment Preparation

## 15.1 Environment Configuration (from ENVIRONMENT-GUIDE)

- [ ] Create `.env.production`
- [ ] Setup secrets management (AWS Secrets Manager, Vault)
- [ ] Document all configuration options
- [ ] Create deployment checklist

## 15.2 Database

- [ ] MySQL setup in production
- [ ] Connection pooling configuration
- [ ] Backup strategy
- [ ] Migration running in production

## 15.3 File Storage

- [ ] S3 bucket creation
- [ ] CloudFront CDN setup (optional)
- [ ] Access key rotation plan

## 15.4 Monitoring & Logging

- [ ] Setup Sentry for error tracking
- [ ] Setup structured logging (JSON)
- [ ] Setup New Relic / DataDog (APM)
- [ ] Create dashboards

## 15.5 Deployment Scripts

- [ ] Docker image build
- [ ] Database migration script
- [ ] Health check endpoint
- [ ] Graceful shutdown

---

# Milestone Checklist

| Phase           | Status | Dependencies | Est. Time              |
| --------------- | ------ | ------------ | ---------------------- |
| 1 - Setup       | ⏳     | None         | 1 week                 |
| 2 - Database    | ⏳     | Phase 1      | 1 week                 |
| 3 - Shared      | ⏳     | Phase 2      | 1 week                 |
| 4 - Auth        | ⏳     | Phase 3      | 1 week                 |
| 5 - Restaurants | ⏳     | Phase 4      | 1 week                 |
| 6 - Dishes      | ⏳     | Phase 5      | 1 week                 |
| 7 - Cart        | ⏳     | Phase 6      | 3 days                 |
| 8 - Orders      | ⏳     | Phase 7      | **2 weeks** (critical) |
| 9 - Deliveries  | ⏳     | Phase 8      | 1 week                 |
| 10 - Upload     | ⏳     | Phase 3      | 1 week                 |
| 11 - Admin      | ⏳     | Phase 8      | 1 week                 |
| 12 - Testing    | ⏳     | All          | 2 weeks                |
| 13 - Docs       | ⏳     | All          | 1 week                 |
| 14 - Security   | ⏳     | All          | 1 week                 |
| 15 - Deploy     | ⏳     | All          | 1 week                 |

**Total Estimated Time:** 18-20 weeks for MVP (with parallels)

---

# MVP Cutoff

After Phase 11, you have a working **MVP**:

- ✅ User management & auth
- ✅ Restaurant management with approval
- ✅ Menu & categories
- ✅ Cart & orders
- ✅ Stock management (atomic)
- ✅ File uploads
- ✅ Admin dashboard

**Post-MVP (Phase 16+):**

- WebSocket real-time tracking
- Payment gateway integration
- Notifications (email/SMS)
- Promo codes
- Reviews & ratings
- Redis caching
- Analytics dashboard

---

# Critical Success Factors

✅ **Must Have:**

1. Atomic stock deduction (Phase 8)
2. Soft deletes everywhere (Phase 2)
3. Error code taxonomy (Phase 3)
4. Rate limiting (Phase 14)
5. Comprehensive testing (Phase 12)

⚠️ **Common Pitfalls to Avoid:**

- Skipping transaction tests in Phase 8
- Not validating stock before deducting
- Forgetting to scope queries by restaurant
- Missing CORS configuration
- Weak JWT secrets

---

# Next Steps

1. **Review this checklist** with team
2. **Estimate effort** per phase in your context
3. **Assign team members** to phases
4. **Create tickets** in your project management tool
5. **Start Phase 1** with environment setup

Good luck! 🚀
