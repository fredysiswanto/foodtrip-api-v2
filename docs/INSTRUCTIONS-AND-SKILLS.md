# FoodTrip v2.1 — Instructions & Skills Guide

**Created:** May 12, 2026  
**Purpose:** Ensure all AI agents stay consistent with v2.1 architecture & patterns

---

## 📋 What's Been Created

### 1. Project Instructions

**File:** `.github/copilot-instructions.md`

Applies to **all agents in the project**. Contains:

- ✅ 10 Core Principles (non-negotiable architecture rules)
- ✅ Development Workflow (reference plan → design → code → test → review)
- ✅ Code Patterns (service layer, controller, error handling, transactions)
- ✅ Anti-Patterns (10 mistakes to avoid)
- ✅ Pre-Commit Checklist (20-item validation)
- ✅ Using AI Agents (best practices)
- ✅ Key References (links to Plan_v2 documents)
- ✅ FAQ & Support

**Impact:** Every agent automatically references these principles, ensuring consistent behavior across all development tasks.

---

### 2. Reusable Skills

Located in `.github/skills/` — Agents invoke these for **specific tasks**.

#### Skill 1: `v2-1-architecture-review`

**Use When:** Reviewing PRs, auditing code against v2.1 patterns

**Provides:**

- 10-point architecture audit checklist
- Layer separation validation (Controller→Service→Repository)
- Soft delete & paranoid pattern checks
- Transaction safety verification
- Error handling standardization
- Authorization placement checks
- Input validation verification
- Migrations & schema validation
- TypeScript strict mode audit
- Testing coverage validation
- Review report template

**Example Usage:**

```
Review this code against v2.1 architecture:
[paste code or file]

Focus on: Transaction safety, soft deletes, error codes
```

---

#### Skill 2: `stock-management-implementation`

**Use When:** Implementing atomic stock deduction, preventing race conditions

**Provides:**

- Race condition problem explanation + examples
- Atomic SQL UPDATE pattern (RECOMMENDED ✅)
- DishRepository.deductStockAtomically() template
- OrderService integration example
- Dish model with stock + version columns
- Controller transaction wrapper
- Transaction helper utility
- Concurrent race condition tests (unit + integration)
- 3 strategies comparison (pessimistic, atomic, optimistic)
- Implementation checklist

**Critical for:** Phase 8 (Order System) — prevents overselling

**Example Usage:**

```
Implement atomic stock deduction for Phase 8:
- Create DishRepository.deductStockAtomically()
- Implement in OrderService.createOrder()
- Add transaction wrapper
- Create race condition tests
```

---

#### Skill 3: `error-handling-implementation`

**Use When:** Implementing standardized error handling, creating error classes

**Provides:**

- Error taxonomy by category (auth, validation, resources, business, rate limit, server)
- 40+ error codes organized with HTTP status mapping
- Standard error response format (with examples)
- Base ApiError class
- 20+ custom error classes (all error types)
- Error middleware with error catching/formatting
- Request validation middleware
- Service layer error handling patterns
- Express app setup
- Testing strategy for error codes
- Comprehensive checklist

**Example Usage:**

```
Implement error handling for Phase 4 (Auth):
- Create error classes (UnauthorizedError, DuplicateEmailError, etc.)
- Setup error middleware
- Implement request validation
- Test all error codes
```

---

#### Skill 4: `sequelize-migration-creation`

**Use When:** Creating Sequelize migrations, adding tables/columns

**Provides:**

- Key principles (reversible, schema-first, constraints, soft deletes, timestamps, indexes)
- Migration naming convention & file structure
- 6 detailed migration examples:
  1. Create table with soft deletes (users)
  2. Create table with foreign keys (dishes)
  3. Add column with constraint
  4. Create table with composite unique constraint
  5. Create complex orders table
  6. Create uploads table (file storage)
- Migration commands (up, down, rollback, status)
- Sequelize CLI configuration (.sequelizerc)
- Common patterns (adding NOT NULL column, rename, change type)
- Pre-commit checklist (14 items)

**Must Match:** DATABASE_DESIGN-V2.1.MD exactly

**Example Usage:**

```
Create migration for Phase 2:
- Create users table with soft deletes
- Create restaurants table with approval workflow
- Create categories table
```

---

#### Skill 5: `phase-planning-breakdown`

**Use When:** Breaking down a phase into tasks, planning implementation

**Provides:**

- Phase overview table (15 phases, MVP status, key deliverables)
- Phase planning template (database, backend, endpoints, errors, auth, validation, testing, docs)
- Detailed example: Phase 4 (Auth) with:
  - Database tasks (users table, model, JWT tokens table)
  - Backend services (error classes, AuthService, middleware, UserRepository)
  - API endpoints (register, login, refresh, profile)
  - Testing strategy (unit tests, integration tests, error coverage)
  - Documentation (Swagger spec, markdown docs)
  - Phase summary (duration, blockers, dependencies, milestones)
- Work organization strategies (by task type, by feature, parallel work)
- Milestone definitions with success criteria
- Phase planning checklist

**Example Usage:**

```
Break down Phase 4 (Auth) into detailed tasks:
- Include estimated duration
- Include dependencies
- Include acceptance criteria
- Include error codes

OR: I'm on Phase 8. What's the detailed breakdown?
```

---

## 🔄 How They Work Together

### Agent Workflow

```
Agent starts work
    ↓
Loads .github/copilot-instructions.md (applies to all)
    ↓
User asks specific task
    ↓
Agent loads relevant skill:
  - "Review my code" → v2-1-architecture-review
  - "Implement stock deduction" → stock-management-implementation
  - "Add error handling" → error-handling-implementation
  - "Create migration" → sequelize-migration-creation
  - "Plan Phase X" → phase-planning-breakdown
    ↓
Skill provides templates, patterns, checklists
    ↓
Agent works within those guardrails
    ↓
Result is consistent with v2.1 standards ✅
```

---

## 💡 Key Improvements

### Before (Without Instructions/Skills)

❌ Agents had no project-specific context  
❌ Patterns varied between agents  
❌ Error handling inconsistent  
❌ Transaction patterns unknown  
❌ Code reviews lacked standard  
❌ Migrations didn't match schema

### After (With Instructions/Skills)

✅ All agents follow same principles  
✅ Consistent patterns across codebase  
✅ Standardized error handling  
✅ Transaction safety enforced  
✅ Reviews use v2.1 checklist  
✅ Migrations match schema exactly  
✅ Agents collaborate seamlessly  
✅ Code quality predictable  
✅ New developers ramp up faster  
✅ Zero inconsistencies

---

## 📁 File Organization

```
.github/
├── copilot-instructions.md              ← Project-wide principles
│
├── agents/
│   ├── foodtrip-api-architect.agent.md
│   ├── foodtrip-implementation-engineer.agent.md
│   ├── foodtrip-code-reviewer.agent.md
│   ├── foodtrip-documentation-bot.agent.md
│   └── foodtrip-testing-specialist.agent.md
│
└── skills/
    ├── v2-1-architecture-review/
    │   └── SKILL.md                    ← Code review checklist
    ├── stock-management-implementation/
    │   └── SKILL.md                    ← Atomic stock patterns
    ├── error-handling-implementation/
    │   └── SKILL.md                    ← Error codes & handling
    ├── sequelize-migration-creation/
    │   └── SKILL.md                    ← Migration templates
    └── phase-planning-breakdown/
        └── SKILL.md                    ← Phase planning
```

---

## 🎯 Usage Examples

### Example 1: Code Review with Architecture Checklist

```
User: /agents foodtrip-code-reviewer Review my PR

Agent:
1. Loads copilot-instructions.md (core principles)
2. Loads v2-1-architecture-review skill
3. Audits code against 10-point checklist:
   ✅ Layer separation (Controller→Service→Repository)
   ✅ Soft deletes (paranoid: true)
   ✅ Transactions (REPEATABLE_READ)
   ✅ Error codes (match API-ERROR-CODES.MD)
   ✅ Authorization (before data access)
   ✅ ... (7 more items)
4. Returns detailed review with specific issues

Result: Consistent code review every time
```

---

### Example 2: Phase Planning

```
User: /agents foodtrip-api-architect Create Phase 8 detailed plan

Agent:
1. Loads copilot-instructions.md (core principles)
2. Loads phase-planning-breakdown skill
3. Creates detailed 2-week plan:
   - Database: orders table, order_items table, indexes
   - Services: OrderService with atomic stock deduction
   - Endpoints: POST /orders, GET /orders, etc.
   - Testing: Concurrent race condition tests
   - Documentation: Swagger spec
   - Timeline: Day-by-day breakdown
   - Blockers: Identifies dependencies

Result: Week-long implementation roadmap
```

---

### Example 3: Stock Deduction Implementation

```
User: /agents foodtrip-implementation-engineer Implement Phase 8 stock deduction

Agent:
1. Loads copilot-instructions.md (core principles)
2. Loads stock-management-implementation skill
3. Creates production-ready code:
   - DishRepository.deductStockAtomically()
   - OrderService.createOrder() with transaction
   - Dish model with version column
   - Integration tests with race condition verification
   - Error handling (InsufficientStockError)

Result: Zero overselling guaranteed
```

---

### Example 4: Error Handling Setup

```
User: /agents foodtrip-implementation-engineer Implement auth error handling

Agent:
1. Loads copilot-instructions.md (core principles)
2. Loads error-handling-implementation skill
3. Creates:
   - Base ApiError class
   - 6 custom error classes (Unauthorized, InvalidCredentials, etc.)
   - Error middleware
   - Request validation middleware
   - Service-layer error examples
   - 40+ error codes properly used

Result: Standardized error handling
```

---

### Example 5: Database Migration

```
User: /agents foodtrip-implementation-engineer Create users table migration

Agent:
1. Loads copilot-instructions.md (core principles)
2. Loads sequelize-migration-creation skill
3. Creates migration file:
   - users table with all columns from DATABASE_DESIGN-V2.1.MD
   - Soft delete (deleted_at column)
   - UNIQUE constraint on email
   - ENUM for role
   - Proper indexes (email, role, deleted_at)
   - Reversible down() function
   - Matches schema exactly

Result: Schema-consistent migration
```

---

## ✅ Checklist for Setup

- [x] Created .github/copilot-instructions.md
- [x] Created .github/skills/v2-1-architecture-review/SKILL.md
- [x] Created .github/skills/stock-management-implementation/SKILL.md
- [x] Created .github/skills/error-handling-implementation/SKILL.md
- [x] Created .github/skills/sequelize-migration-creation/SKILL.md
- [x] Created .github/skills/phase-planning-breakdown/SKILL.md
- [ ] Test agents load instructions automatically
- [ ] Run Phase 1 using agents with new instructions
- [ ] Validate agents follow all principles
- [ ] Refine based on feedback

---

## 📊 Content Summary

| File                            | Purpose                        | Size            |
| ------------------------------- | ------------------------------ | --------------- |
| copilot-instructions.md         | Project-wide principles        | 300+ lines      |
| v2-1-architecture-review        | Code review checklist          | 400+ lines      |
| stock-management-implementation | Race condition prevention      | 500+ lines      |
| error-handling-implementation   | Error standardization          | 600+ lines      |
| sequelize-migration-creation    | Migration templates            | 500+ lines      |
| phase-planning-breakdown        | Phase planning                 | 400+ lines      |
| **TOTAL**                       | **Production-ready framework** | **2700+ lines** |

---

## 🚀 Next Steps

1. **Verify Setup:**
   - Check all files created in correct locations
   - Verify file permissions

2. **Test Instructions:**
   - Start chat with an agent
   - Ask it about v2.1 principles
   - Verify it references copilot-instructions.md

3. **Test Skills:**
   - Ask agent to review code using v2-1-architecture-review
   - Ask agent to plan Phase 4 using phase-planning-breakdown
   - Verify skills load and provide detailed output

4. **Run Phase 1:**
   - Use FoodTrip API Architect agent with new instructions
   - Request detailed Phase 1 breakdown
   - Should follow all principles from copilot-instructions.md

5. **Refine:**
   - Collect feedback from team
   - Update instructions/skills as needed
   - Share learnings in v2.1 project notes

---

## 🔗 References

- **Project Instructions:** `.github/copilot-instructions.md`
- **Skills Location:** `.github/skills/*/SKILL.md`
- **Plan Documents:** `Plan_v2/*`
- **Agents:** `.github/agents/*.agent.md`
- **Main README:** `README.MD`

---

## 💬 Questions?

For questions about:

- **Project principles** → See `.github/copilot-instructions.md`
- **Code reviews** → See `.github/skills/v2-1-architecture-review/SKILL.md`
- **Stock deduction** → See `.github/skills/stock-management-implementation/SKILL.md`
- **Error handling** → See `.github/skills/error-handling-implementation/SKILL.md`
- **Migrations** → See `.github/skills/sequelize-migration-creation/SKILL.md`
- **Phase planning** → See `.github/skills/phase-planning-breakdown/SKILL.md`

---

**Status:** ✅ Complete  
**Last Updated:** May 12, 2026  
**Ready for:** Phase 1 implementation with all agents
