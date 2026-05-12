---
name: phase-planning-breakdown
user-invocable: true
description: "Use when: breaking down a phase into detailed checklist, planning phase tasks with dependencies, identifying blockers, organizing work into milestones, creating phase implementation plan. Returns actionable task list with estimated time, dependencies, and acceptance criteria."
---

# Phase Planning & Breakdown

Break down a v2.1 phase into detailed, actionable tasks with dependencies and acceptance criteria.

## Phase Overview (v2.1)

| Phase | Name                  | Duration | MVP | Key Deliverable           |
| ----- | --------------------- | -------- | --- | ------------------------- |
| 1     | Project Setup         | 1 week   | ✅  | Working dev environment   |
| 2     | Database & ORM        | 1 week   | ✅  | Sequelize configured      |
| 3     | Shared Infrastructure | 1 week   | ✅  | Error handling, logging   |
| 4     | Authentication        | 1 week   | ✅  | JWT + refresh tokens      |
| 5     | Restaurants           | 1 week   | ✅  | CRUD + approval           |
| 6     | Dishes                | 1 week   | ✅  | Menu management           |
| 7     | Cart                  | 1 week   | ✅  | Add/remove items          |
| 8     | Order System          | 2 weeks  | ✅  | Atomic stock deduction    |
| 9     | Deliveries            | 1 week   | ✅  | Delivery tracking         |
| 10    | File Uploads          | 1 week   | ✅  | S3 integration            |
| 11    | Admin Dashboard       | 1 week   | ✅  | Management UI             |
| 12    | Testing               | 1 week   | ✅  | Test suite                |
| 13    | Documentation         | 1 week   | ✅  | API docs                  |
| 14    | Security              | 1 week   | ✅  | Rate limiting, CORS       |
| 15    | Deployment            | 1 week   | ✅  | Production ready          |
| 16+   | Post-MVP              | TBD      | ❌  | Payments, WebSocket, etc. |

---

## Phase Planning Template

When planning a phase, create a checklist with:

1. **Database** — Migrations, models, indexes
2. **Backend** — Controllers, services, repositories
3. **API Endpoints** — Routes, request/response specs
4. **Error Handling** — All error codes used
5. **Authorization** — Role checks and data scope
6. **Validation** — Input validation rules
7. **Testing** — Unit, integration, error cases
8. **Documentation** — Swagger/API docs

---

## Example: Phase 4 — Authentication (1 week)

### Tasks Breakdown

#### Database (2 days)

- [ ] **Create users table migration**
  - Duration: 2 hours
  - Depends on: Phase 2 (Database setup)
  - Columns: id, email, password_hash, name, phone, role, status, created_at, updated_at, deleted_at
  - Constraints: UNIQUE email, ENUM role (SUPER_ADMIN, RESTO_ADMIN, RESTO_STAFF, DRIVER, CUSTOMER)
  - Indexes: email, role, deleted_at
  - Acceptance Criteria:
    - [ ] Migration up() creates users table
    - [ ] Migration down() drops table completely
    - [ ] UNIQUE constraint on email
    - [ ] All required columns present
    - [ ] Soft delete (deleted_at) included

- [ ] **Create user model**
  - Duration: 3 hours
  - Depends on: Users table migration
  - Acceptance Criteria:
    - [ ] Model has paranoid: true
    - [ ] Password hashing logic in hooks
    - [ ] Validations for email, password strength
    - [ ] Enum validation for role

- [ ] **Create JWT tokens table (optional, for token blacklist)**
  - Duration: 2 hours
  - Columns: id, user_id, token, type (access/refresh), expires_at, created_at
  - Acceptance Criteria:
    - [ ] Stores revoked tokens
    - [ ] Foreign key to users with CASCADE

---

#### Backend Services (3 days)

- [ ] **Create error classes for auth**
  - Duration: 2 hours
  - Depends on: Phase 3 (Error handling)
  - Error codes needed:
    - [ ] INVALID_CREDENTIALS
    - [ ] TOKEN_EXPIRED
    - [ ] UNAUTHORIZED
    - [ ] INVALID_EMAIL
    - [ ] INVALID_PASSWORD
    - [ ] DUPLICATE_EMAIL
  - Acceptance Criteria:
    - [ ] All extend ApiError
    - [ ] Correct HTTP status codes
    - [ ] Match API-ERROR-CODES.MD

- [ ] **Implement AuthService**
  - Duration: 4 hours
  - Depends on: Error classes, User model
  - Methods:
    - [ ] register(email, password) → User
    - [ ] login(email, password) → { accessToken, refreshToken }
    - [ ] refreshToken(token) → { accessToken, refreshToken }
    - [ ] validateToken(token) → User | throw
  - Acceptance Criteria:
    - [ ] Email validation (format)
    - [ ] Password strength validation (min 8 chars, uppercase, lowercase, number)
    - [ ] Duplicate email check
    - [ ] Bcrypt hashing (10+ rounds)
    - [ ] JWT generation with 15m/7d expiry
    - [ ] Token refresh logic

- [ ] **Create auth middleware**
  - Duration: 3 hours
  - Depends on: AuthService
  - Middleware:
    - [ ] authenticateToken — Verify JWT, attach user to req
    - [ ] authorize(role) — Check user role
  - Acceptance Criteria:
    - [ ] Validates token signature
    - [ ] Throws UNAUTHORIZED if invalid
    - [ ] Throws FORBIDDEN if role insufficient

- [ ] **Implement UserRepository**
  - Duration: 2 hours
  - Methods:
    - [ ] findByEmail(email) → User | null
    - [ ] findById(id) → User | null
    - [ ] create(userData) → User
    - [ ] update(id, data) → User
  - Acceptance Criteria:
    - [ ] Uses transaction parameter
    - [ ] Respects paranoid (soft delete)

---

#### API Endpoints (1.5 days)

- [ ] **Create auth routes**
  - Duration: 2 hours
  - Endpoints:
    - [ ] POST /api/v1/auth/register
      - Request: { email, password, name, phone }
      - Response: { user: { id, email, name, role }, accessToken, refreshToken }
      - Error codes: INVALID_EMAIL, INVALID_PASSWORD, DUPLICATE_EMAIL
    - [ ] POST /api/v1/auth/login
      - Request: { email, password }
      - Response: { user, accessToken, refreshToken }
      - Error codes: INVALID_CREDENTIALS
    - [ ] POST /api/v1/auth/refresh
      - Request: { refreshToken }
      - Response: { accessToken, refreshToken }
      - Error codes: UNAUTHORIZED, TOKEN_EXPIRED
  - Acceptance Criteria:
    - [ ] Routes defined
    - [ ] Controllers call service
    - [ ] Errors passed to middleware

- [ ] **Create user routes (read-only for now)**
  - Duration: 1.5 hours
  - Endpoints:
    - [ ] GET /api/v1/profile
      - Requires: Authentication
      - Response: { user }
      - Error codes: UNAUTHORIZED
    - [ ] GET /api/v1/users/:id
      - Requires: Super admin only
      - Response: { user }
      - Error codes: FORBIDDEN, NOT_FOUND
  - Acceptance Criteria:
    - [ ] Authentication middleware applied
    - [ ] Authorization checked
    - [ ] Proper error codes

---

#### Testing (2 days)

- [ ] **Unit tests for AuthService**
  - Duration: 4 hours
  - Test cases:
    - [ ] register() with valid data → creates user
    - [ ] register() with invalid email → throws INVALID_EMAIL
    - [ ] register() with weak password → throws INVALID_PASSWORD
    - [ ] register() with duplicate email → throws DUPLICATE_EMAIL
    - [ ] login() with correct credentials → returns tokens
    - [ ] login() with wrong password → throws INVALID_CREDENTIALS
    - [ ] login() with non-existent user → throws INVALID_CREDENTIALS
    - [ ] refreshToken() with valid token → returns new tokens
    - [ ] refreshToken() with expired token → throws TOKEN_EXPIRED
  - Acceptance Criteria:
    - [ ] All tests pass
    - [ ] > 90% coverage on AuthService
    - [ ] Mock UserRepository

- [ ] **Integration tests for auth endpoints**
  - Duration: 4 hours
  - Test cases:
    - [ ] POST /register with valid data → 201 Created
    - [ ] POST /register with invalid email → 400 + error code
    - [ ] POST /login with valid creds → 200 + tokens
    - [ ] POST /login with invalid creds → 401
    - [ ] GET /profile without token → 401
    - [ ] GET /profile with valid token → 200 + user
    - [ ] GET /users/:id as customer → 403
    - [ ] GET /users/:id as super admin → 200 + user
  - Acceptance Criteria:
    - [ ] All tests pass
    - [ ] Real database used
    - [ ] Transactions tested
    - [ ] Error codes validated

- [ ] **Error handling tests**
  - Duration: 2 hours
  - Test cases:
    - [ ] All 6 error codes tested
    - [ ] Response format validated
    - [ ] HTTP status codes correct
  - Acceptance Criteria:
    - [ ] 100% error code coverage

---

#### Documentation (1 day)

- [ ] **Swagger/OpenAPI spec**
  - Duration: 3 hours
  - Endpoints:
    - [ ] POST /auth/register — with request/response examples
    - [ ] POST /auth/login — with request/response examples
    - [ ] POST /auth/refresh — with request/response examples
    - [ ] GET /profile — with request/response examples
  - Error codes documented
  - Acceptance Criteria:
    - [ ] All endpoints documented
    - [ ] Examples present
    - [ ] Error codes listed
    - [ ] Swagger validates

- [ ] **API Documentation markdown**
  - Duration: 2 hours
  - Sections:
    - [ ] Auth overview
    - [ ] Token format
    - [ ] Token expiry times
    - [ ] Role definitions
    - [ ] Error codes reference
  - Acceptance Criteria:
    - [ ] Clear explanation
    - [ ] Code examples
    - [ ] Links to error codes

---

### Phase 4 Summary

**Total Duration:** 8-9 days (1 week + padding)  
**Team Size:** 2-3 developers (can parallelize DB + services)

**Blockers:**

- None (Phase 3 error handling must be complete first)

**Dependencies:**

- Phase 2: Database setup
- Phase 3: Error handling, logging

**Key Decisions:**

- Use JWT with 15m/7d expiry (non-negotiable)
- Bcrypt with 10+ rounds (security standard)
- Soft deletes on users table
- 5 roles for RBAC (non-negotiable)

---

## Phase Planning Checklist

Before starting a phase, ensure:

- [ ] Read IMPLEMENTATION-CHECKLIST.MD for phase details
- [ ] Check DATABASE_DESIGN-V2.1.MD for required tables
- [ ] Review API-ERROR-CODES.MD for error codes
- [ ] Identify all required endpoints
- [ ] Plan database migrations
- [ ] Estimate task durations
- [ ] Identify dependencies
- [ ] Plan testing strategy
- [ ] Identify documentation needs
- [ ] Identify authorization boundaries

---

## Work Organization Strategies

### By Task Type

```
Day 1: Database (migrations + models)
Day 2-3: Services (business logic)
Day 4-5: Controllers + Routes (HTTP layer)
Day 6: Tests (comprehensive)
Day 7: Documentation
```

### By Feature

```
Feature: Register
  - Models & migrations
  - Service logic
  - Route & controller
  - Tests (unit + integration)
  - Documentation

Feature: Login
  - Service logic (reuse user model)
  - Route & controller
  - Tests
  - Documentation

Feature: Token Refresh
  - Service logic
  - Route & controller
  - Tests
```

### Parallel Work (Team)

```
Developer 1: Database + Models
Developer 2: Services + Error handling
Developer 3: Controllers + Routes

After: All work tests
All: Documentation
```

---

## Milestone Definition

Each phase should have clear milestones:

```
Phase 4 Milestones:
- Milestone 1 (Day 2): Database + models complete
- Milestone 2 (Day 4): Services complete
- Milestone 3 (Day 5): Endpoints complete
- Milestone 4 (Day 6): Tests complete
- Milestone 5 (Day 7): Documentation complete

Success Criteria:
- [ ] All endpoints working
- [ ] All error codes tested
- [ ] >90% coverage on critical modules
- [ ] All tests passing
- [ ] Swagger spec complete
- [ ] Zero console errors
```

---

## Usage in Chat

```
Break down Phase 4 (Auth) into detailed tasks:
- Database tasks
- Service tasks
- Endpoint tasks
- Testing tasks
- Documentation tasks

Include:
- Estimated duration
- Dependencies
- Acceptance criteria
- Error codes
```

Or:

```
I'm on Phase 8. What's the detailed breakdown?
- What are the critical tasks?
- What are the dependencies?
- What's the timeline?
- What are the blockers?
```

This skill will provide a comprehensive phase plan organized by task type with clear acceptance criteria and dependencies.
