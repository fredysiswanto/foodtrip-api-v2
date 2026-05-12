# 🍽️ FoodTrip API v2.1

Backend REST API untuk platform restoran & food ordering system yang mendukung multi-role, multi-restaurant, dan scalable architecture.

**Status:** ✅ Planning Complete (v2.1) | 🚀 Ready for Implementation  
**Version:** 2.1 (Refined with feedback)  
**Last Updated:** May 12, 2026

---

## 🚀 Overview

FoodTrip API adalah sistem backend yang dirancang untuk mengelola ekosistem restoran digital secara end-to-end, mulai dari manajemen restoran, menu, pemesanan, hingga tracking order dengan **production-ready architecture**.

**Sistem ini dibangun dengan fokus pada:**

- ✅ **Modular architecture** — feature-based modules dengan clear separation
- ✅ **Scalability** — stateless JWT auth, repository pattern, connection pooling
- ✅ **Transaction safety** — atomic stock deduction, REPEATABLE_READ isolation
- ✅ **Security** — rate limiting, helmet headers, CORS, bcrypt hashing
- ✅ **Multi-role access control (RBAC)** — 5 roles dengan granular permissions
- ✅ **Multi-database support** — SQLite (dev), MySQL (prod)
- ✅ **Soft deletes** — all core tables support logical deletion
- ✅ **Comprehensive error handling** — 40+ standardized error codes

---

## 🧩 Core Features (v2.1)

### 👤 Authentication & Authorization (Phase 4)

- Register & Login (JWT-based + refresh token)
- Token expiration (15m access, 7d refresh)
- Role-based access control (RBAC) — 5 roles
- Secure password hashing (bcrypt, 10+ rounds)
- Rate limiting (20 req/min auth, 100 req/min general)

**Roles:**

- **Super Admin** — Full system access, restaurant approval
- **Resto Admin** — Own restaurant management, staff management
- **Resto Staff** — Operational only (order updates)
- **Driver** — Delivery assignment, status updates
- **Customer** — Browsing, ordering, tracking

---

### 🏪 Restaurant Management (Phase 5)

- CRUD restaurant with approval workflow
- Status management: PENDING → APPROVED → ACTIVE → SUSPENDED
- Restaurant approval by super admin
- Rejection with detailed reasons
- Opening hours & location (latitude/longitude)
- Logo & banner image upload (via centralized uploads)
- Soft delete support

---

### 🍔 Menu Management (Phase 6)

- CRUD dishes/menu with soft deletes
- Category management
- Price management (decimal precision)
- Stock management with **atomic deduction** (prevents overselling)
- Optimistic locking (version field)
- Dish availability toggle
- Featured dish support
- Image gallery support (via uploads table)
- Unique slug per restaurant

---

### 🛒 Cart System (Phase 7)

- Add/remove items
- Update quantity
- **One cart per restaurant per user** (enforced at DB level)
- Real-time cart summary
- Clear cart on checkout
- Snapshot pricing (preserves price at add time)

---

### 📦 Order System (Phase 8 - CRITICAL)

- Atomic checkout process with **race condition prevention**
- Order creation with automatic stock deduction
- Immutable order items (snapshots of dish name, price)
- Order status tracking: PENDING → CONFIRMED → PREPARING → DELIVERING → COMPLETED
- Optional CANCELLED status with stock refund
- Payment status: UNPAID, PAID, FAILED, REFUNDED
- Payment methods: CASH, TRANSFER, EWALLET, QRIS
- Order history per user
- Order tracking per restaurant

**Critical Implementation:**

- Stock deducted atomically (single SQL UPDATE)
- Transaction isolation: REPEATABLE_READ
- Concurrent race condition testing required

---

### 🚚 Delivery System (Phase 9)

- Driver role management
- Delivery assignment (SUPER_ADMIN, RESTO_ADMIN only)
- Delivery status tracking: PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
- Optional FAILED status
- Driver can only see assigned deliveries
- Delivery history & tracking

---

### 🧑‍💼 Admin Dashboard API (Phase 11)

- Platform analytics (orders, revenue, trends)
- User management & listing
- Restaurant approval/rejection system
- Restaurant listing & filtering
- System monitoring & audit logs

---

### 📁 File Upload System (Phase 10)

- **Centralized uploads table** — single source of truth
- Categories: avatars, restaurant logos, banners, dish images
- Secure filename hashing
- MIME type validation
- File size limits per type
- Support for local storage (dev) & S3 (prod)
- Upload metadata tracking (uploader, size, type)

---

## 🏗️ Tech Stack (v2.1)

| Layer               | Technology                       | Purpose                                 |
| ------------------- | -------------------------------- | --------------------------------------- |
| **Runtime**         | Node.js 18+                      | JavaScript runtime                      |
| **Framework**       | Express.js 4.x                   | HTTP server & routing                   |
| **Language**        | TypeScript 5.x                   | Type safety                             |
| **ORM**             | Sequelize 6.x                    | Database abstraction                    |
| **Database (Dev)**  | SQLite 3                         | Local development                       |
| **Database (Prod)** | MySQL 8                          | Production deployment                   |
| **Authentication**  | JWT + Bcrypt                     | Token auth + password hashing           |
| **Security**        | Helmet, CORS, express-rate-limit | Security headers, rate limiting         |
| **File Upload**     | Multer                           | Multipart form handling                 |
| **Validation**      | Zod or Joi                       | Input validation & schemas              |
| **Testing**         | Jest + Supertest                 | Unit & integration tests                |
| **Tooling**         | ESLint, Prettier, Husky          | Code quality & formatting               |
| **Package Manager** | PNPM                             | Fast, disk-efficient package management |

---

## 🧱 Architecture (v2.1)

```txt
Client (Web / Mobile / Admin)
        ↓
        ↓ HTTPS (TLS/SSL in prod)
        ↓
Express.js API Gateway (/api/v1)
        ↓
Middleware Layer
  ├─ Logger (request/response)
  ├─ CORS & Helmet (security)
  ├─ Rate Limiter (100 req/min general, 20 req/min auth)
  ├─ Auth (JWT validation)
  ├─ Authorization (role-based)
  ├─ Validation (Zod/Joi)
  └─ Error Handler (standardized responses)
        ↓
Module Controllers (HTTP handlers)
        ↓
Business Logic Services (transactions, validations)
        ↓
Repository Layer (data access)
        ↓
Sequelize ORM (type-safe queries)
        ↓
Database (SQLite dev / MySQL prod)
        ↓
Optional: Redis Cache (Phase 16+)
        ↓
Optional: S3/GCS Storage (production file upload)
```

### Transaction Safety

- **Order Creation:** REPEATABLE_READ isolation
- **Stock Deduction:** Atomic SQL UPDATE (prevents overselling)
- **Cart Operations:** Row-level locking for consistency
- **Delivery Assignment:** Unique constraints prevent double-booking

---

## 📁 Project Structure (v2.1)

```txt
foodtrip-api/
│
├── src/
│   ├── app/                          # Express app initialization
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── routes.ts
│   │
│   ├── config/                       # Configuration files
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   ├── multer.ts
│   │   ├── rate-limit.ts
│   │   └── logger.ts
│   │
│   ├── modules/                      # Feature-based modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── restaurants/
│   │   ├── categories/
│   │   ├── dishes/
│   │   ├── carts/
│   │   ├── orders/                   # CRITICAL: stock deduction
│   │   ├── deliveries/               # NEW in v2.1
│   │   ├── uploads/
│   │   └── admin/
│   │
│   ├── shared/
│   │   ├── constants/                # Role, status, error codes
│   │   ├── middleware/               # Auth, validation, errors, rate-limit
│   │   ├── helpers/                  # JWT, bcrypt, response, stock
│   │   ├── errors/                   # Error classes with codes
│   │   ├── validators/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── database/
│   │   ├── models/                   # Sequelize models
│   │   ├── migrations/               # Database migrations
│   │   ├── seeders/                  # Initial data
│   │   └── factories/                # Test factories
│   │
│   ├── cli/                          # CLI tools
│   │   └── commands/
│   │
│   ├── uploads/                      # Local file storage (dev)
│   │
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── .github/
│   └── agents/                       # Custom Copilot agents (v2.1)
│       ├── foodtrip-api-architect.agent.md
│       ├── foodtrip-implementation-engineer.agent.md
│       ├── foodtrip-code-reviewer.agent.md
│       ├── foodtrip-documentation-bot.agent.md
│       └── foodtrip-testing-specialist.agent.md
│
├── Plan_v2/                          # Complete v2.1 planning docs
│   ├── README-V2.1.MD                # Overview & navigation
│   ├── DATABASE_DESIGN-V2.1.MD       # Schema, 23 tables, indexes
│   ├── STOCK-MANAGEMENT-STRATEGY.MD  # Race condition prevention
│   ├── API-ERROR-CODES.MD            # 40+ error codes
│   ├── ENVIRONMENT-GUIDE.MD          # .env setup
│   └── IMPLEMENTATION-CHECKLIST.MD   # 15 phases, 200+ tasks
│
├── .env.example
├── .env.development
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── jest.config.js
├── package.json
├── pnpm-lock.yaml
└── README.MD (this file)
```

---

## 🔐 Role-Based Access Control (v2.1)

| Role            | Permissions                 | Data Scope                                       |
| --------------- | --------------------------- | ------------------------------------------------ |
| **Super Admin** | Full system access          | All data (users, restaurants, orders, analytics) |
| **Resto Admin** | Restaurant mgmt, staff mgmt | Own restaurant only                              |
| **Resto Staff** | Order operations            | Own restaurant orders only                       |
| **Driver**      | Delivery operations         | Assigned deliveries only                         |
| **Customer**    | Browsing, ordering          | Personal cart & orders only                      |

**Key Rules:**

- Super Admin & Customer: no `restaurant_id` required
- Driver: no `restaurant_id` required (independent contractor)
- Resto Admin & Staff: `restaurant_id` REQUIRED
- All queries scoped by user role & `restaurant_id`
- Driver can only see deliveries assigned to them

---

## 📊 Database Design (v2.1)

**23 Tables with soft deletes, constraints, and 40+ indexes:**

### Core Tables

- `roles` — Role definitions
- `users` — All users (with avatar_id FK to uploads)
- `refresh_tokens` — JWT refresh token storage
- `restaurants` — Restaurant data (with logo_id, banner_id FKs)
- `restaurant_images` — Gallery (via uploads)
- `categories` — Dish categories
- `dishes` — Menu items (with version for optimistic locking)
- `dish_images` — Dish gallery (via uploads)
- `carts` — User shopping carts (UNIQUE user_id + restaurant_id)
- `cart_items` — Items in cart
- `orders` — Order records with snapshots
- `order_items` — Order line items (immutable snapshots)
- `deliveries` — Delivery tracking
- `uploads` — Centralized file storage
- `audit_logs` — System audit trail

**Key Constraints:**

- ✅ Soft deletes (`deleted_at`) on core tables
- ✅ CHECK constraints on all status fields
- ✅ UNIQUE constraints on slugs, emails, order_no
- ✅ Foreign key constraints with CASCADE/RESTRICT
- ✅ Composite indexes for performance

**See:** [DATABASE_DESIGN-V2.1.MD](Plan_v2/DATABASE_DESIGN-V2.1.MD)

---

## ⚙️ API Standards (v2.1)

### Base URL

All endpoints use: `/api/v1/{resource}`

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "field": "value"
  }
}
```

### Error Response (Standardized)

```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": [
    {
      "code": "ERROR_CODE",
      "field": "fieldName",
      "message": "Why this happened"
    }
  ]
}
```

### Pagination

```
GET /api/v1/orders?page=1&limit=20
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### HTTP Status Codes

- **200** — Success
- **201** — Created
- **400** — Bad Request (validation errors)
- **401** — Unauthorized (invalid token)
- **403** — Forbidden (insufficient permissions)
- **404** — Not Found
- **409** — Conflict (duplicate email, invalid state)
- **422** — Unprocessable Entity (business logic error)
- **429** — Too Many Requests (rate limited)
- **500** — Internal Server Error

### Error Code Taxonomy

40+ standardized error codes:

- **Authentication:** `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `UNAUTHORIZED`
- **Authorization:** `FORBIDDEN`, `INSUFFICIENT_PERMISSIONS`, `OWNER_ONLY`
- **Validation:** `INVALID_EMAIL`, `INVALID_PHONE`, `MISSING_REQUIRED_FIELD`
- **Business Logic:** `INSUFFICIENT_STOCK`, `INVALID_STATE_TRANSITION`, `RESTAURANT_CLOSED`
- **Conflict:** `DUPLICATE_EMAIL`, `RESOURCE_ALREADY_EXISTS`
- **Rate Limit:** `RATE_LIMIT_EXCEEDED`

**See:** [API-ERROR-CODES.MD](Plan_v2/API-ERROR-CODES.MD)

---

## 📦 Installation & Setup (v2.1)

### Prerequisites

- Node.js 18+
- PNPM 8+
- MySQL 8 (for production; SQLite used in development)
- Git

### Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd foodtrip-api-v2

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your database & JWT secrets

# 4. Initialize database
pnpm db:migrate
pnpm db:seed

# 5. Start development server
pnpm dev
```

Server will run at `http://localhost:3000`

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm dev:debug       # Start with debugging enabled

# Building
pnpm build           # Compile TypeScript
pnpm start           # Run production build

# Database
pnpm db:migrate      # Run pending migrations
pnpm db:rollback     # Rollback last migration
pnpm db:seed         # Seed test data
pnpm db:reset        # Reset database (drop & recreate)

# Code Quality
pnpm lint            # Run ESLint
pnpm format          # Format code with Prettier
pnpm type-check      # TypeScript type checking

# Testing
pnpm test            # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report

# Documentation
pnpm docs:generate  # Generate API docs
```

---

## 🛠️ Development Workflow (v2.1)

### Using AI Agents

5 specialized agents available for different tasks:

```bash
# Architecture & Planning
/agents foodtrip-api-architect Create Phase 1 detailed checklist

# Implementation
/agents foodtrip-implementation-engineer Implement Phase 4: Auth module

# Testing
/agents foodtrip-testing-specialist Create tests for stock deduction

# Code Review
/agents foodtrip-code-reviewer Review PR for auth module

# Documentation
/agents foodtrip-documentation-bot Generate Swagger spec
```

**See:** [Agent Documentation](.github/agents/)

### Development Phases

Work through 15 phases systematically:

1. **Phase 1** — Project Setup (1 week)
2. **Phase 2** — Database & ORM (1 week)
3. **Phase 3** — Shared Infrastructure (1 week)
4. **Phase 4** — Authentication (1 week)
5. **Phase 5-11** — Feature Implementation
6. **Phase 8** — Order System (⚠️ CRITICAL, 2 weeks)
7. **Phase 12-15** — Testing, Docs, Security, Deploy

**See:** [IMPLEMENTATION-CHECKLIST.MD](Plan_v2/IMPLEMENTATION-CHECKLIST.MD)

---

## 🧪 Testing Strategy (v2.1)

### Test Coverage Goals

- **Auth:** 90%
- **Stock Management:** 95% (critical)
- **Orders:** 90%
- **Authorization:** 85%
- **Error Handling:** 100%

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage

# Specific test file
pnpm test auth.test.ts

# Integration tests
pnpm test --testPathPattern=integration

# Concurrent/Race condition tests
pnpm test --testNamePattern="concurrent|race"
```

### Critical Tests Required

- ✅ Stock deduction atomicity
- ✅ Concurrent race conditions
- ✅ Transaction rollback
- ✅ All error codes (40+)
- ✅ Authorization boundaries
- ✅ Order status transitions

**See:** [Testing Specialist Agent](.github/agents/foodtrip-testing-specialist.agent.md)

---

## ⚠️ Critical: Stock Management Strategy (v2.1)

**Problem:** Race conditions can cause overselling (simultaneous orders exceed available stock)

**Solution:** Atomic SQL UPDATE with REPEATABLE_READ transaction isolation

```typescript
// Correct implementation (prevents overselling)
const result = await sequelize.query(
  `UPDATE dishes 
   SET stock = stock - :qty, version = version + 1
   WHERE id = :id AND stock >= :qty`,
  { replacements: { qty: orderedQty, id: dishId }, transaction: t },
);

if (result[1] === 0) {
  throw new InsufficientStockError("Only 5 units available");
}
```

**Why it matters:**

- Prevents negative stock
- Handles concurrent orders correctly
- Atomic at database level
- Used in Phase 8 (Order System)

**See:** [STOCK-MANAGEMENT-STRATEGY.MD](Plan_v2/STOCK-MANAGEMENT-STRATEGY.MD)

---

## 🚀 Deployment & Configuration (v2.1)

### Environment Setup

```bash
# Development
cp .env.example .env.development

# Staging
cp .env.example .env.staging
# Configure: MySQL, S3, monitoring

# Production
cp .env.example .env.production
# Configure: Secrets Manager, RDS, CloudFront, monitoring
```

### Configuration Options

- **JWT_SECRET** — Min 32 chars, use `openssl rand -hex 32`
- **DB_DIALECT** — `sqlite` (dev) or `mysql` (prod)
- **STORAGE_TYPE** — `local` (dev) or `s3` (prod)
- **RATE_LIMIT_MAX_REQUESTS** — 100 (general), 20 (auth endpoints)
- **LOG_LEVEL** — `debug` (dev) or `warn` (prod)

**See:** [ENVIRONMENT-GUIDE.MD](Plan_v2/ENVIRONMENT-GUIDE.MD)

### Production Checklist

- [ ] Environment variables configured
- [ ] Secrets in AWS Secrets Manager
- [ ] Database migrations run
- [ ] S3 bucket created
- [ ] Monitoring (Sentry, New Relic) configured
- [ ] CORS origins restricted
- [ ] Health check endpoint working
- [ ] Database backups enabled
- [ ] Rate limiting tested
- [ ] Error logging verified

---

## 📌 Roadmap (v2.1)

### MVP (Phases 1-11) — Estimated 11 weeks

✅ **Core Features:**

- User management & authentication (Phases 4)
- Restaurant management with approval (Phase 5)
- Menu & categories (Phase 6)
- Cart & ordering (Phases 7-8)
- Stock management with atomic deduction
- Delivery system (Phase 9)
- File uploads (Phase 10)
- Admin dashboard (Phase 11)

### Post-MVP (Phase 16+) — Future enhancements

🚀 **Planned Features:**

- Payment gateway integration (Stripe, Midtrans)
- WebSocket real-time order tracking
- Push notifications (Firebase)
- Email notifications (SendGrid)
- Promo codes & discounts
- Reviews & ratings
- Loyalty points system
- Redis caching layer
- Advanced analytics
- SMS notifications (Twilio)

---

## � Documentation & Planning (v2.1)

All planning documents in `Plan_v2/` folder:

| Document                                                             | Purpose                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| [README-V2.1.MD](Plan_v2/README-V2.1.MD)                             | Overview, improvements, document navigation          |
| [DATABASE_DESIGN-V2.1.MD](Plan_v2/DATABASE_DESIGN-V2.1.MD)           | 23-table schema, constraints, indexes, relationships |
| [STOCK-MANAGEMENT-STRATEGY.MD](Plan_v2/STOCK-MANAGEMENT-STRATEGY.MD) | Race condition prevention, atomic SQL, testing       |
| [API-ERROR-CODES.MD](Plan_v2/API-ERROR-CODES.MD)                     | 40+ error codes, response format, implementation     |
| [ENVIRONMENT-GUIDE.MD](Plan_v2/ENVIRONMENT-GUIDE.MD)                 | .env setup, multi-environment config, secrets        |
| [IMPLEMENTATION-CHECKLIST.MD](Plan_v2/IMPLEMENTATION-CHECKLIST.MD)   | 15 phases, 200+ tasks, time estimates, testing       |

---

## 🤖 AI Agents for Development (v2.1)

5 specialized agents in `.github/agents/`:

| Agent                       | Tools                       | Use Case                                |
| --------------------------- | --------------------------- | --------------------------------------- |
| **API Architect**           | read, edit, search          | Architecture planning, design decisions |
| **Implementation Engineer** | read, edit, search, execute | Writing code, migrations, services      |
| **Code Reviewer**           | read, search, web           | PR review, architecture audit           |
| **Documentation Bot**       | read, edit, search          | API docs, Swagger, deployment guides    |
| **Testing Specialist**      | read, edit, search, execute | Test creation, concurrent testing       |

**Start with:**

```
/agents foodtrip-api-architect Create Phase 1 detailed checklist
```

---

## 🔗 Key Concepts (v2.1)

### Soft Deletes

- All core tables include `deleted_at` column
- Sequelize `paranoid: true` automatically filters deleted records
- Enables data recovery & audit trails

### Optimistic Locking

- `version` column on dishes table
- Prevents concurrent updates from overwriting each other
- Useful for stock management in low-conflict scenarios

### Atomic Stock Deduction

- Single SQL UPDATE statement (no separate SELECT)
- Prevents race conditions with concurrent orders
- Used in Phase 8 (Order System)

### Transaction Isolation

- REPEATABLE_READ level for critical operations
- Prevents dirty reads & non-repeatable reads
- Used for order creation, stock deduction

### Error Codes

- Standardized taxonomy (40+ codes)
- Each code has HTTP status, field, message
- Clients parse codes for programmatic handling

---

## 💡 Architecture Highlights (v2.1)

✅ **Modular Design** — Feature-based modules with clear separation  
✅ **Clean Architecture** — Controller → Service → Repository pattern  
✅ **Type Safety** — TypeScript strict mode throughout  
✅ **Transaction Safety** — Atomic operations, proper isolation levels  
✅ **Security** — JWT + bcrypt, rate limiting, CORS, helmet headers  
✅ **Error Handling** — Standardized error codes with taxonomy  
✅ **Testing** — Unit, integration, concurrent race condition tests  
✅ **Scalability** — Stateless design, repository pattern for easy DB switching  
✅ **Maintainability** — ESLint, Prettier, soft deletes, audit logging  
✅ **Documentation** — Comprehensive planning docs & auto-generated API docs

---

## 📄 License

MIT License

---

## 👥 Contributing

### Development Workflow

1. **Review Plan** — Check [IMPLEMENTATION-CHECKLIST.MD](Plan_v2/IMPLEMENTATION-CHECKLIST.MD) for your phase
2. **Use Agent** — Let [FoodTrip API Architect](.github/agents/foodtrip-api-architect.agent.md) break down the phase
3. **Implement** — Use [Implementation Engineer](.github/agents/foodtrip-implementation-engineer.agent.md) to write code
4. **Test** — Use [Testing Specialist](.github/agents/foodtrip-testing-specialist.agent.md) to create tests
5. **Review** — Use [Code Reviewer](.github/agents/foodtrip-code-reviewer.agent.md) for PR review
6. **Document** — Use [Documentation Bot](.github/agents/foodtrip-documentation-bot.agent.md) for API docs

### Code Style

- TypeScript strict mode
- ESLint & Prettier enforced
- Meaningful commits with conventional format
- 80%+ test coverage for critical modules

### Testing Requirements

- Unit tests for services & helpers
- Integration tests for API endpoints
- Concurrent tests for stock deduction
- Error case coverage (all error codes)

---

## ❓ FAQ

**Q: When can I deploy to production?**  
A: After completing Phase 15 (Deployment Preparation), typically 18-20 weeks

**Q: What if I need to add features before Phase 11?**  
A: Stick to the MVP plan. Post-MVP features are deferred to Phase 16+

**Q: How do I prevent stock overselling?**  
A: Use atomic SQL UPDATE from [STOCK-MANAGEMENT-STRATEGY.MD](Plan_v2/STOCK-MANAGEMENT-STRATEGY.MD)

**Q: How many error codes are there?**  
A: 40+ defined in [API-ERROR-CODES.MD](Plan_v2/API-ERROR-CODES.MD)

**Q: Can I customize the agents?**  
A: Yes! Edit `.github/agents/*.agent.md` files to suit your needs

---

## 📞 Support

For questions about:

- **Architecture** → See Plan_v2 documents
- **Implementation** → Use FoodTrip Implementation Engineer agent
- **Testing** → Use FoodTrip Testing Specialist agent
- **Code Review** → Use FoodTrip Code Reviewer agent
- **Documentation** → Use FoodTrip Documentation Bot agent

---

**Project Status:** ✅ v2.1 Planning Complete | Ready for Implementation  
**Last Updated:** May 12, 2026  
**Next Step:** Start Phase 1 with `pnpm install` and use agents for structured development
