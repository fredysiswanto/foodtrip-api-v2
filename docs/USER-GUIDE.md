# 🚀 FoodTrip v2.1 — User Guide for Agents, Skills & Instructions

**Created:** May 12, 2026  
**Purpose:** Help developers work effectively with AI agents and project framework  
**Audience:** All developers, from beginners to experienced

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Framework](#understanding-the-framework)
3. [Using Instructions](#using-instructions)
4. [Using Skills](#using-skills)
5. [Using Agents](#using-agents)
6. [Common Workflows](#common-workflows)
7. [Example Scenarios](#example-scenarios)
8. [Tips & Tricks](#tips--tricks)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 5-Minute Introduction

**What you have:**

- ✅ **Instructions** — Universal rules for all agents (`.github/copilot-instructions.md`)
- ✅ **Skills** — Reusable task templates (5 skills in `.github/skills/`)
- ✅ **Agents** — Specialized AI helpers (5 agents in `.github/agents/`)

**How they work together:**

```
Agent starts → Loads instructions (universal rules)
    ↓
You ask for a task
    ↓
Agent loads relevant skill (task template)
    ↓
Agent produces consistent, high-quality output ✅
```

**Example: Code Review**

```
You: "/agents foodtrip-code-reviewer Review my PR"

Agent:
1. Loads universal v2.1 principles
2. Loads v2-1-architecture-review skill
3. Audits code against 10-point checklist
4. Returns detailed review ✅
```

---

## Understanding the Framework

### Instructions (Universal Rules)

**What:** Project-wide principles that apply to **ALL agents**

**Location:** `.github/copilot-instructions.md`

**Contains:**

- ✅ 10 Core Principles (architecture, transactions, errors, security, code quality, testing, database, API, documentation, phases)
- ✅ Development Workflow (reference plan, design, code, test, review)
- ✅ Code Patterns (service layer, controller, error handling, transactions)
- ✅ Anti-Patterns (10 mistakes to avoid)
- ✅ Pre-Commit Checklist
- ✅ References to Plan_v2 documents

**Who uses it:** Every agent, automatically

**Example:** When you ask any agent to implement something, it will follow these principles:

- Use Controller→Service→Repository pattern
- Implement soft deletes with Sequelize paranoid mode
- Use REPEATABLE_READ transaction isolation
- Follow standardized error codes
- Check authorization BEFORE data access

---

### Skills (Task-Specific Templates)

**What:** Detailed, reusable guides for specific development tasks

**Location:** `.github/skills/*/SKILL.md` (5 skills)

**The 5 Skills:**

| Skill                               | Use When                                              | Outputs                                      |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------- |
| **v2-1-architecture-review**        | Reviewing PRs, auditing code                          | Checklist, audit report, recommendations     |
| **stock-management-implementation** | Implementing atomic stock, preventing race conditions | Code templates, transaction patterns, tests  |
| **error-handling-implementation**   | Creating error classes, setting up error handling     | Error taxonomy, code templates, middleware   |
| **sequelize-migration-creation**    | Creating database migrations                          | Migration templates, examples, configuration |
| **phase-planning-breakdown**        | Planning phases, breaking down work                   | Task breakdown, timeline, dependencies       |

**How to use:** Agent automatically loads relevant skill when you ask for a specific task

**Example:**

```
You: "Create migration for Phase 2 users table"

Agent loads: sequelize-migration-creation skill
Output: Production-ready migration file ✅
```

---

### Agents (Specialized AI Helpers)

**What:** Specialized AI agents trained for specific roles

**Location:** `.github/agents/*.agent.md` (5 agents)

**The 5 Agents:**

| Agent                                | Purpose                                 | Use For                                                      |
| ------------------------------------ | --------------------------------------- | ------------------------------------------------------------ |
| **FoodTrip API Architect**           | Architecture planning, design decisions | Planning phases, designing features, architectural decisions |
| **FoodTrip Implementation Engineer** | Writing production code                 | Implementing features, writing migrations, creating services |
| **FoodTrip Code Reviewer**           | Code audits, PR reviews                 | Reviewing code, auditing architecture, catching bugs         |
| **FoodTrip Documentation Bot**       | Writing documentation                   | API docs, Swagger specs, guides                              |
| **FoodTrip Testing Specialist**      | Creating tests                          | Writing unit/integration/concurrent tests                    |

**How to invoke an agent:**

```
/agents {agent-name} {your-request}

Examples:
/agents foodtrip-api-architect Create Phase 8 detailed plan
/agents foodtrip-implementation-engineer Implement atomic stock deduction
/agents foodtrip-code-reviewer Review my PR for transaction safety
/agents foodtrip-documentation-bot Generate Swagger spec for auth
/agents foodtrip-testing-specialist Create race condition tests
```

---

## Using Instructions

### Automatic Application

Instructions are **automatically applied to all agent conversations**. You don't need to do anything special.

### Reading Instructions

**If you want to understand the v2.1 standards:**

```
Open: .github/copilot-instructions.md

Sections:
1. Core Principles (read first!)
2. Development Workflow
3. Code Patterns (with examples)
4. Anti-Patterns (what NOT to do)
5. Pre-Commit Checklist
6. Common Questions
```

### Key Principles to Remember

When working with agents, remember these **10 core principles**:

1. **Controller → Service → Repository** — Always follow this pattern
2. **Atomic transactions** — Use single SQL UPDATE for stock deduction
3. **Standardized errors** — Use error codes from API-ERROR-CODES.MD
4. **Check auth first** — Validate authorization BEFORE data access
5. **Soft deletes** — Use `paranoid: true` in Sequelize
6. **TypeScript strict mode** — No `any` types
7. **Transaction isolation** — Use REPEATABLE_READ for critical ops
8. **Test everything** — Unit + integration tests required
9. **No hardcoded values** — Use environment variables
10. **Phase discipline** — Work only on assigned phase

### Pre-Commit Checklist

Before pushing code, verify:

- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Error codes match API-ERROR-CODES.MD
- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Authorization checks before data access
- [ ] Soft delete scope applied
- [ ] Migration is reversible
- [ ] Transactions use REPEATABLE_READ
- [ ] No console.log() in production code

---

## Using Skills

### Available Skills

#### Skill 1: v2-1-Architecture-Review

**Use when:** Reviewing code, auditing architecture consistency

**What it does:**

- Provides 10-point architecture checklist
- Verifies layer separation (Controller→Service→Repository)
- Checks soft deletes & paranoid patterns
- Validates transaction safety
- Audits error handling
- Checks authorization placement
- Validates TypeScript strict mode
- Checks test coverage

**How to use:**

```
/agents foodtrip-code-reviewer Review this code

[Include code in message]

Focus on:
- Layer separation
- Soft deletes
- Transaction safety
- Error codes
```

**What you get back:**

```
## Architecture Review: [File]

### Layers ✅/❌
- [ ] Repository: data access only ✅
- [ ] Service: business logic ✅
- [ ] Controller: HTTP handling ✅

### Database ✅/❌
- [ ] Paranoid models ✅
- [ ] Soft delete scope ✅

... (10 more items)

### Status: ✅ Approve
```

---

#### Skill 2: Stock-Management-Implementation

**Use when:** Implementing atomic stock deduction, preventing race conditions

**What it does:**

- Explains race condition problem
- Provides atomic SQL UPDATE pattern (recommended)
- Shows DishRepository.deductStockAtomically() template
- Shows OrderService integration
- Shows transaction wrapper
- Provides concurrent test examples
- Provides implementation checklist

**How to use:**

```
/agents foodtrip-implementation-engineer Implement atomic stock deduction

Include details:
- Which phase? (Phase 8)
- What's the context? (Order checkout)
```

**What you get back:**

````
## Stock Deduction Implementation

### Race Condition Problem
[Problem explanation with example]

### Solution: Atomic SQL UPDATE
```typescript
const [updated] = await Dish.update(
  { stock: sequelize.where(...) },
  { where: { id, stock: { [Op.gte]: qty } }, transaction: t }
);
if (updated === 0) throw new InsufficientStockError();
````

### Repository Template

[Complete DishRepository code]

### Service Integration

[Complete OrderService code]

### Transaction Wrapper

[Complete controller code]

### Testing

[Concurrent test examples]

### Checklist

- [ ] ... (15 items)

```

---

#### Skill 3: Error-Handling-Implementation
**Use when:** Implementing error classes, setting up error middleware

**What it does:**
- Provides 40+ error codes organized by category
- Shows error taxonomy
- Shows standard error response format
- Provides base ApiError class
- Provides 20+ custom error classes
- Shows error middleware setup
- Shows request validation middleware
- Provides testing strategy

**How to use:**
```

/agents foodtrip-implementation-engineer Implement error handling for Phase 4

Include:

- Which phase? (Phase 4: Auth)
- Which error codes needed? (INVALID_EMAIL, INVALID_CREDENTIALS, DUPLICATE_EMAIL, etc.)

```

**What you get back:**
```

## Error Handling Implementation

### Error Taxonomy

- Authentication (401)
- Validation (400)
- Resources (404)
- Business Logic (400, 409, 422)
- Rate Limiting (429)
- Server (500, 503)

### Standard Response Format

{
"success": false,
"message": "...",
"errors": [
{ "code": "INVALID_EMAIL", "field": "email", "message": "..." }
]
}

### Error Classes

```typescript
export class InvalidEmailError extends ApiError {
  constructor() {
    super(400, "INVALID_EMAIL", "Invalid email format", "email");
  }
}
```

### Error Middleware

[Complete middleware code]

### Validation Middleware

[Complete validation code]

### Testing

[Error test examples]

```

---

#### Skill 4: Sequelize-Migration-Creation
**Use when:** Creating database migrations for new tables or columns

**What it does:**
- Provides migration naming convention
- Shows 6 detailed migration examples
- Shows how to add foreign keys
- Shows how to add indexes
- Shows how to add constraints
- Shows common patterns (rename, add column, change type)
- Provides Sequelize CLI setup
- Provides reversible down() functions

**How to use:**
```

/agents foodtrip-implementation-engineer Create migration for users table

Include:

- Which phase? (Phase 2)
- What table? (users)
- What columns? (email, password_hash, name, phone, role, etc.)

```

**What you get back:**
```

## Sequelize Migration: Create Users Table

### Migration File

20260101120000-create-users-table.ts

### Code

```typescript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.UUID, primaryKey: true },
      email: { type: Sequelize.STRING, unique: true },
      password_hash: { type: Sequelize.STRING },
      role: { type: Sequelize.ENUM("...") },
      deleted_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE },
      updated_at: { type: Sequelize.DATE },
    });

    await queryInterface.addIndex("users", ["email"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
```

### Commands

```bash
pnpm db:migrate      # Run migration
pnpm db:rollback     # Undo migration
```

### Checklist

- [ ] ... (14 items)

```

---

#### Skill 5: Phase-Planning-Breakdown
**Use when:** Planning a phase, breaking down work, understanding timeline

**What it does:**
- Provides phase overview table
- Shows phase planning template
- Provides detailed example (Phase 4)
- Shows work organization strategies
- Shows milestone definitions
- Provides phase checklist

**How to use:**
```

/agents foodtrip-api-architect Create Phase 8 detailed breakdown

Include:

- Which phase? (Phase 8: Order System)
- Team size? (2-3 developers)
- What's the context? (Critical for MVP)

```

**What you get back:**
```

## Phase 8: Order System — Detailed Breakdown

### Phase Overview

- Duration: 2 weeks
- Team: 2-3 developers
- MVP: Critical ✅
- Key: Atomic stock deduction

### Database Tasks (2 days)

- [ ] Create orders table (2 hours)
  - Depends on: Phase 2 database setup
  - Acceptance: Migration up/down works, indexes created
- [ ] Create order_items table (2 hours)
- [ ] Create delivery_tracking table (2 hours)

### Service Tasks (4 days)

- [ ] Create OrderService (4 hours)
  - Methods: createOrder, updateStatus, getOrder, etc.
  - Atomic stock deduction ✅
  - Transaction handling ✅
- [ ] Create DeliveryService (4 hours)

### API Endpoints (2 days)

- [ ] POST /api/v1/orders
  - Request: { restaurantId, items[] }
  - Response: { order }
  - Errors: INSUFFICIENT_STOCK, EMPTY_CART
- [ ] GET /api/v1/orders/:id
- [ ] PATCH /api/v1/orders/:id/status

### Testing (2 days)

- [ ] Unit tests (4 hours)
- [ ] Integration tests (4 hours)
- [ ] Race condition tests (2 hours) ⚠️ CRITICAL

### Documentation (1 day)

- [ ] Swagger spec (3 hours)
- [ ] Architecture markdown (2 hours)

### Timeline

Day 1-2: Database
Day 3-6: Services
Day 7-8: Endpoints
Day 9-10: Tests
Day 11: Documentation

### Blockers

None (Phase 3 must be complete first)

### Success Criteria

- [ ] Zero overselling (race condition tests pass)
- [ ] All error codes tested
- [ ] 90%+ test coverage
- [ ] API documented
- [ ] Team alignment

```

---

## Using Agents

### Invoking an Agent

**Syntax:**
```

/agents {agent-name} {your-request}

```

**Example:**
```

/agents foodtrip-implementation-engineer Implement atomic stock deduction

```

### Agent Descriptions

#### 1. FoodTrip API Architect
**Specialization:** Architecture, design decisions, phase planning

**Use for:**
- Planning phases
- Designing features
- Architectural decisions
- Creating detailed checklists
- Deciding on patterns

**Example prompts:**
```

/agents foodtrip-api-architect Create Phase 4 (Auth) detailed breakdown

/agents foodtrip-api-architect Design the checkout flow with atomic stock deduction

/agents foodtrip-api-architect Create implementation checklist for Phase 8

/agents foodtrip-api-architect Should we use pessimistic locking or atomic SQL?

```

**What you get:**
- Detailed plans
- Task breakdowns
- Timeline estimates
- Dependency analysis
- Design explanations
- Architecture decisions

---

#### 2. FoodTrip Implementation Engineer
**Specialization:** Writing production code, creating implementations

**Use for:**
- Implementing features
- Writing services
- Creating migrations
- Writing controllers
- Creating repositories
- Building complete modules

**Example prompts:**
```

/agents foodtrip-implementation-engineer Implement Phase 2: Create database migrations

/agents foodtrip-implementation-engineer Implement atomic stock deduction with all tests

/agents foodtrip-implementation-engineer Create OrderService with transaction handling

/agents foodtrip-implementation-engineer Implement auth error handling for Phase 4

```

**What you get:**
- Complete code files
- Migrations
- Models
- Services
- Controllers
- Tests
- All production-ready

---

#### 3. FoodTrip Code Reviewer
**Specialization:** Code review, auditing architecture, catching bugs

**Use for:**
- Reviewing pull requests
- Auditing code against v2.1
- Checking for bugs
- Validating patterns
- Finding inconsistencies
- Security review

**Example prompts:**
```

/agents foodtrip-code-reviewer Review this PR for transaction safety

[paste code]

/agents foodtrip-code-reviewer Audit this service against v2.1 architecture

[paste code]

/agents foodtrip-code-reviewer Check this for race conditions

[paste code]

```

**What you get:**
- Detailed review
- Checklist results
- Specific issues found
- Recommendations
- Approval/changes needed

---

#### 4. FoodTrip Documentation Bot
**Specialization:** Writing documentation, API docs, Swagger specs

**Use for:**
- Generating API documentation
- Creating Swagger specs
- Writing deployment guides
- Writing README updates
- Creating architecture docs

**Example prompts:**
```

/agents foodtrip-documentation-bot Generate Swagger spec for auth endpoints

/agents foodtrip-documentation-bot Create API documentation for order service

/agents foodtrip-documentation-bot Write deployment guide for Phase 15

/agents foodtrip-documentation-bot Document error codes in markdown

```

**What you get:**
- OpenAPI/Swagger specs
- API reference docs
- Deployment guides
- Architecture documentation
- README updates

---

#### 5. FoodTrip Testing Specialist
**Specialization:** Creating test suites, concurrent testing, test coverage

**Use for:**
- Creating unit tests
- Creating integration tests
- Creating concurrent/race condition tests
- Testing error codes
- Coverage analysis
- Test strategy

**Example prompts:**
```

/agents foodtrip-testing-specialist Create concurrent race condition tests for stock deduction

/agents foodtrip-testing-specialist Create comprehensive tests for auth service

/agents foodtrip-testing-specialist Design test strategy for Phase 8

/agents foodtrip-testing-specialist Create integration tests for order endpoints

```

**What you get:**
- Complete test files
- Race condition tests
- Error code tests
- Setup & fixtures
- Coverage reports
- Test documentation

---

## Common Workflows

### Workflow 1: Implement a Complete Phase

**Timeline:** 1 week (example: Phase 4 Auth)

**Step 1: Plan the phase (Day 1)**
```

/agents foodtrip-api-architect Create Phase 4 (Auth) detailed breakdown

Provide:

- Database tasks needed
- Service tasks needed
- API endpoints needed
- Testing requirements
- Timeline

```

**Step 2: Create database migrations (Day 1)**
```

/agents foodtrip-implementation-engineer Create Phase 4 database migrations

Provide:

- Users table migration
- JWT tokens table (optional)
- All columns, indexes, constraints

```

**Step 3: Implement services (Days 2-3)**
```

/agents foodtrip-implementation-engineer Implement Phase 4 authentication service

Provide:

- AuthService with register, login, refresh methods
- Error handling with all error codes
- Bcrypt password hashing
- JWT token generation

```

**Step 4: Create endpoints (Days 3-4)**
```

/agents foodtrip-implementation-engineer Create Phase 4 auth endpoints

Provide:

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- GET /profile
- All validation and error handling

```

**Step 5: Create tests (Day 5)**
```

/agents foodtrip-testing-specialist Create comprehensive tests for Phase 4

Provide:

- Unit tests for AuthService
- Integration tests for endpoints
- All error code tests
- Success & failure paths

```

**Step 6: Create documentation (Day 5)**
```

/agents foodtrip-documentation-bot Generate API documentation for Phase 4

Provide:

- Swagger spec for all endpoints
- Request/response examples
- Error codes documented
- Implementation guide

```

**Step 7: Code review (Day 6)**
```

/agents foodtrip-code-reviewer Review Phase 4 implementation against v2.1

Provide:

- All Phase 4 files
- Check for: architecture, errors, auth, tests, docs
- Get approval or feedback

```

**Result:** Complete Phase 4 implementation in 1 week ✅

---

### Workflow 2: Fix a Bug or Issue

**Timeline:** 2-4 hours

**Step 1: Understand the bug**
```

/agents foodtrip-api-architect Help me understand this race condition in order creation

Describe:

- What's the symptom? (Overselling)
- When does it happen? (Concurrent orders)
- What's the expected behavior? (No overselling)

```

**Step 2: Get the solution**
```

/agents foodtrip-implementation-engineer Fix atomic stock deduction to prevent overselling

Provide:

- Current problematic code
- What error you're seeing
- Expected behavior

Result: Fixed DishRepository and OrderService

```

**Step 3: Create tests to verify fix**
```

/agents foodtrip-testing-specialist Create race condition tests to verify stock fix

Provide:

- Simultaneous order requests
- Verify no overselling
- Verify proper error handling

```

**Step 4: Code review**
```

/agents foodtrip-code-reviewer Review fix for transaction safety

Provide:

- Fixed code
- Verify it prevents race conditions
- Check for side effects

```

**Result:** Bug fixed with tests and review ✅

---

### Workflow 3: Code Review and Audit

**Timeline:** 1-2 hours

**Step 1: Run code review**
```

/agents foodtrip-code-reviewer Review my PR for v2.1 compliance

Provide:

- PR URL or code files
- Focus areas (transaction safety, errors, auth, tests)

Result: Detailed review with checklist

```

**Step 2: Address feedback (if needed)**
```

/agents foodtrip-implementation-engineer Fix code based on review feedback

Provide:

- Issues found in review
- Current problematic code

Result: Fixed code

```

**Step 3: Re-review (if needed)**
```

/agents foodtrip-code-reviewer Review updated code again

Result: Approval ✅

```

---

### Workflow 4: Understand v2.1 Architecture

**Timeline:** 30 minutes

**Step 1: Read instructions**
```

Open: .github/copilot-instructions.md

Read:

- 10 Core Principles
- Code Patterns section
- Anti-Patterns section

```

**Step 2: Ask agent for clarification**
```

/agents foodtrip-api-architect Explain the Controller→Service→Repository pattern for Phase 4

Result: Detailed explanation with code examples

```

**Step 3: Ask agent for example**
```

/agents foodtrip-implementation-engineer Show me a complete example of the auth service following v2.1 architecture

Result: Full, documented code example

```

---

## Example Scenarios

### Scenario 1: You're New to the Project

**Your Goal:** Understand how everything fits together

**Steps:**

1. **Read the overview** (15 min)
```

Open: README.MD (main project)
Open: Plan_v2/README-V2.1.MD (plan overview)

```

2. **Understand the framework** (15 min)
```

Open: .github/INSTRUCTIONS-AND-SKILLS.md (this guide)
Open: .github/copilot-instructions.md (principles)

```

3. **Get a phase breakdown** (20 min)
```

/agents foodtrip-api-architect Explain Phase 1 (Project Setup) for a new developer

Provide:

- What's the goal?
- What will we build?
- What are the key tasks?
- What are the dependencies?

```

4. **See an example** (20 min)
```

/agents foodtrip-implementation-engineer Show me what a complete Phase 1 looks like with code

Result: Phase 1 setup with all files

```

5. **You're ready to start!** ✅

---

### Scenario 2: Implementing Phase 8 (Critical Phase)

**Your Goal:** Implement atomic stock deduction without race conditions

**Steps:**

1. **Understand the phase** (30 min)
```

/agents foodtrip-api-architect Create detailed Phase 8 plan with emphasis on stock safety

Focus on:

- Race condition explanation
- Atomic solution
- Testing strategy

```

2. **Create database** (2 hours)
```

/agents foodtrip-implementation-engineer Create Phase 8 database migrations

Include:

- orders table
- order_items table
- All constraints and indexes

```

3. **Implement services** (4 hours)
```

/agents foodtrip-implementation-engineer Implement OrderService with atomic stock deduction

Critical:

- DishRepository.deductStockAtomically()
- OrderService.createOrder() with transactions
- All error handling
- Version column for optimistic locking

```

4. **Create endpoints** (3 hours)
```

/agents foodtrip-implementation-engineer Create order endpoints (POST, GET, PATCH)

Include:

- All validation
- All error codes
- Authorization checks

```

5. **Create tests** (4 hours)
```

/agents foodtrip-testing-specialist Create race condition tests for concurrent orders

Critical:

- Simultaneous orders exceed stock
- Verify no overselling
- Verify transaction rollback
- Concurrent request tests

```

6. **Code review** (1 hour)
```

/agents foodtrip-code-reviewer Review Phase 8 implementation

Focus on:

- Atomic stock deduction ✅
- Transaction safety ✅
- Race condition prevention ✅
- Error handling ✅

```

7. **Documentation** (2 hours)
```

/agents foodtrip-documentation-bot Generate API docs for order endpoints

Include:

- Swagger spec
- Examples
- Error codes
- Race condition explanation

```

**Total time:** ~16 hours for critical phase ✅

---

### Scenario 3: Adding a New Feature Mid-Project

**Your Goal:** Add a new feature while maintaining v2.1 standards

**Steps:**

1. **Check if it's in scope**
```

Open: Plan_v2/IMPLEMENTATION-CHECKLIST.MD

Is your feature in MVP (Phase 1-11)?

- Yes? Continue
- No? This is Phase 16+ (Post-MVP)

```

2. **Plan the feature**
```

/agents foodtrip-api-architect Design this feature following v2.1 standards

Provide:

- Feature description
- Database schema changes
- Endpoints needed
- Error codes

Result: Detailed design

```

3. **Check database impact**
```

Open: Plan_v2/DATABASE_DESIGN-V2.1.MD

Is the table/column already defined?

- Yes? Use it
- No? Need to update schema (Phase 16+)

```

4. **Implement the feature**
```

/agents foodtrip-implementation-engineer Implement this feature

Provide:

- Feature design from architect
- Any schema changes
- Error codes
- Authorization rules

Result: Complete implementation

```

5. **Review & test** (same as Workflow 2)

---

## Tips & Tricks

### Tips for Better Agent Output

1. **Be specific about phase**
```

❌ Bad: "Implement auth"
✅ Good: "Implement Phase 4: Authentication with JWT + refresh tokens"

```

2. **Provide context**
```

❌ Bad: "Create a migration"
✅ Good: "Create Phase 2 users table migration matching DATABASE_DESIGN-V2.1.MD"

```

3. **Focus the scope**
```

❌ Bad: "Review my code"
✅ Good: "Review this service for transaction safety and soft deletes"

```

4. **Ask for examples**
```

❌ Bad: "How do I use transactions?"
✅ Good: "Show me an example of OrderService using atomic stock deduction"

```

5. **Reference the plan**
```

❌ Bad: "Should I add this feature?"
✅ Good: "Is this feature in Plan_v2/IMPLEMENTATION-CHECKLIST.MD Phase 11 or later?"

```

---

### Tips for Faster Development

1. **Use phase-planning-breakdown skill first**
```

Gets you: Clear task list + timeline
Saves: Hours of planning

```

2. **Ask for complete implementations**
```

Instead of: "Create UserRepository then UserService"
Ask for: "Create UserRepository, UserService, UserController for Phase 4"

Gets you: All 3 at once

```

3. **Request tests simultaneously**
```

/agents foodtrip-implementation-engineer Create OrderService + tests

Gets you: Implementation + unit + integration tests
Saves: Testing phase time

```

4. **Group related endpoints**
```

/agents foodtrip-implementation-engineer Create all auth endpoints at once

Gets you: register, login, refresh, profile in one request
Saves: Multiple back-and-forth requests

```

---

### Tips for Consistency

1. **Always reference instructions**
```

When asking agent something, mention:
"Following .github/copilot-instructions.md..."

Ensures: Agent stays aligned

```

2. **Use skills for specific patterns**
```

For stock: Explicitly ask to use stock-management-implementation skill
For errors: Explicitly ask to use error-handling-implementation skill
For migrations: Explicitly ask to use sequelize-migration-creation skill

```

3. **Reference exact phase**
```

Always say: "Phase X: [Name]"
Not: "The next phase"

Ensures: Correct scope

```

---

## Troubleshooting

### Issue 1: Agent doesn't follow v2.1 standards

**Problem:** Agent produced code that doesn't follow architecture

**Solution:**
1. Remind agent of instructions
```

"Following .github/copilot-instructions.md,
please use Controller→Service→Repository pattern"

```

2. Reference specific principle
```

"This should use REPEATABLE_READ transaction isolation as specified
in copilot-instructions.md principle #2"

```

3. Request code review
```

/agents foodtrip-code-reviewer Review this code against v2.1 architecture

Result: Issues identified with fixes

```

---

### Issue 2: Agent doesn't know about soft deletes

**Problem:** Agent creates table without `paranoid: true`

**Solution:**
1. Reference instruction
```

"All core tables must have paranoid: true and deleted_at column
per copilot-instructions.md principle #7"

```

2. Request correction
```

/agents foodtrip-implementation-engineer Fix this migration to add soft deletes

[paste migration]

```

---

### Issue 3: Agent doesn't use atomic stock deduction

**Problem:** Agent uses SELECT then UPDATE (race condition)

**Solution:**
1. Load the skill
```

"Using stock-management-implementation skill...

    Stock deduction MUST use atomic SQL UPDATE, not SELECT then UPDATE"

```

2. Provide correct pattern
```

/agents foodtrip-implementation-engineer Fix stock deduction using atomic SQL UPDATE

Reference: .github/skills/stock-management-implementation/SKILL.md

[paste code]

```

---

### Issue 4: Not sure which agent to use

**Solution:** Reference this table

| Task | Agent |
|------|-------|
| Plan a phase | FoodTrip API Architect |
| Implement code | FoodTrip Implementation Engineer |
| Review PR | FoodTrip Code Reviewer |
| Write docs | FoodTrip Documentation Bot |
| Create tests | FoodTrip Testing Specialist |
| Design architecture | FoodTrip API Architect |
| Debug code | FoodTrip Code Reviewer |
| Understand v2.1 | FoodTrip API Architect |

---

### Issue 5: Agent output looks generic

**Problem:** Output doesn't match your project specifics

**Solution:**
1. Be more specific
```

❌ "Implement auth"
✅ "Implement Phase 4 auth for FoodTrip API v2.1 with: - JWT + refresh tokens - 5 roles (SUPER_ADMIN, RESTO_ADMIN, RESTO_STAFF, DRIVER, CUSTOMER) - Bcrypt password hashing - Rate limiting (20 req/min) - All error codes from API-ERROR-CODES.MD"

```

2. Provide context from plan
```

"Reference DATABASE_DESIGN-V2.1.MD for users table schema"
"Reference API-ERROR-CODES.MD for error codes"
"Reference STOCK-MANAGEMENT-STRATEGY.MD for atomic operations"

```

---

## Quick Reference

### File Locations
```

.github/
├── copilot-instructions.md Universal principles
├── INSTRUCTIONS-AND-SKILLS.md Framework overview
├── USER-GUIDE.md This file
├── agents/ 5 specialized agents
│ ├── foodtrip-api-architect.agent.md
│ ├── foodtrip-implementation-engineer.agent.md
│ ├── foodtrip-code-reviewer.agent.md
│ ├── foodtrip-documentation-bot.agent.md
│ └── foodtrip-testing-specialist.agent.md
└── skills/ 5 reusable skills
├── v2-1-architecture-review/
├── stock-management-implementation/
├── error-handling-implementation/
├── sequelize-migration-creation/
└── phase-planning-breakdown/

Plan_v2/
├── README-V2.1.MD Overview
├── IMPLEMENTATION-CHECKLIST.MD 15 phases
├── DATABASE_DESIGN-V2.1.MD Schema
├── API-ERROR-CODES.MD Error codes
├── STOCK-MANAGEMENT-STRATEGY.MD Race condition prevention
└── ENVIRONMENT-GUIDE.MD Configuration

```

### Agent Quick Commands
```

# Plan a phase

/agents foodtrip-api-architect Create Phase X detailed breakdown

# Implement a feature

/agents foodtrip-implementation-engineer Implement [feature] following v2.1

# Review code

/agents foodtrip-code-reviewer Review this code against v2.1

# Document API

/agents foodtrip-documentation-bot Generate Swagger spec for [endpoint]

# Create tests

/agents foodtrip-testing-specialist Create tests for [feature]

```

### Key Files to Read First
1. `README.MD` (main project)
2. `.github/copilot-instructions.md` (principles)
3. `.github/INSTRUCTIONS-AND-SKILLS.md` (framework overview)
4. `.github/USER-GUIDE.md` (this file)
5. `Plan_v2/README-V2.1.MD` (plan overview)

---

## Summary

**You now have:**
- ✅ Universal principles (instructions)
- ✅ Reusable patterns (skills)
- ✅ Specialized helpers (agents)
- ✅ Clear workflows
- ✅ Troubleshooting guide

**Next steps:**
1. Read `.github/copilot-instructions.md`
2. Try your first agent command
3. Follow a workflow from this guide
4. Build Phase 1 with agents

**Good luck! 🚀**

---

**Questions?** Refer back to this guide or ask an agent:
```

/agents foodtrip-api-architect Help me understand [something about the project]

```

```
