# Phase 2: Database & ORM Setup

**Phase:** 2 of 15  
**Status:** Ready to Implement  
**Estimated Duration:** 5-7 days  
**Depends On:** Phase 1 ✅ Complete  
**Target Start:** May 13, 2026

---

## 🎯 Phase Objectives

Phase 2 establishes the complete database layer with Sequelize ORM, migrations, and seeding infrastructure. This phase is **foundational for all data operations** in subsequent phases.

### Primary Goals

1. ✅ Initialize Sequelize CLI with proper configuration
2. ✅ Create 15 database migrations matching DATABASE_DESIGN-V2.1.MD
3. ✅ Setup SQLite for development, MySQL-ready for production
4. ✅ Implement all indexes for query performance
5. ✅ Create seeding infrastructure with sample data
6. ✅ Validate schema integrity with soft deletes and constraints

### Success Criteria

- [ ] Sequelize initialized with working connection pool
- [ ] All 15 migrations created and reversible (down functions)
- [ ] Database runs `pnpm db:migrate` without errors
- [ ] All tables have proper constraints and indexes
- [ ] Soft deletes working on paranoid models
- [ ] Sample data loads with `pnpm db:seed`
- [ ] Connection pooling configured for development
- [ ] Foreign key constraints enforced
- [ ] CHECK constraints on all status fields

---

## 📋 Task Breakdown

### 2.1: Sequelize Configuration

**Objective:** Initialize and configure Sequelize for development and production

#### 2.1.1 Install Sequelize

```bash
pnpm add sequelize-cli
```

#### 2.1.2 Initialize Sequelize

```bash
npx sequelize-cli init
```

This creates:

- `config/` directory with configuration files
- `models/` directory
- `migrations/` directory
- `seeders/` directory

#### 2.1.3 Update Sequelize Config

**File:** `config/config.json`

```json
{
  "development": {
    "dialect": "sqlite",
    "storage": "./database.sqlite",
    "logging": false,
    "define": {
      "timestamps": true,
      "paranoid": true,
      "underscored": true,
      "freezeTableName": true
    },
    "pool": {
      "min": 2,
      "max": 5,
      "acquire": 30000,
      "idle": 10000
    }
  },
  "staging": {
    "dialect": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "process.env.DB_USER",
    "password": "process.env.DB_PASSWORD",
    "database": "process.env.DB_NAME",
    "logging": false,
    "define": {
      "timestamps": true,
      "paranoid": true,
      "underscored": true,
      "freezeTableName": true
    },
    "pool": {
      "min": 2,
      "max": 10,
      "acquire": 30000,
      "idle": 10000
    }
  },
  "production": {
    "dialect": "mysql",
    "host": "process.env.DB_HOST",
    "port": "process.env.DB_PORT",
    "username": "process.env.DB_USER",
    "password": "process.env.DB_PASSWORD",
    "database": "process.env.DB_NAME",
    "logging": false,
    "define": {
      "timestamps": true,
      "paranoid": true,
      "underscored": true,
      "freezeTableName": true
    },
    "pool": {
      "min": 5,
      "max": 20,
      "acquire": 30000,
      "idle": 10000
    },
    "dialectOptions": {
      "ssl": "Amazon RDS",
      "supportBigNumbers": true,
      "bigNumberStrings": true
    }
  }
}
```

**Key Settings:**

| Setting                 | Value                      | Reason                                 |
| ----------------------- | -------------------------- | -------------------------------------- |
| `paranoid: true`        | Soft deletes               | Keep deleted records with `deleted_at` |
| `underscored: true`     | snake_case columns         | Match database conventions             |
| `freezeTableName: true` | Use table name as-is       | Prevent pluralization                  |
| `timestamps: true`      | Auto created_at/updated_at | Automatic tracking                     |
| `pool.max`              | 5 (dev), 20 (prod)         | Connection pooling                     |

#### 2.1.4 Create Sequelize Initialization File

**File:** `src/database/sequelize.ts`

```typescript
import { Sequelize } from 'sequelize';
import path from 'path';
import { databaseConfig } from '@config/index';
import logger from '@shared/utils/logger';

let sequelize: Sequelize;

/**
 * Initialize Sequelize connection based on environment
 */
export function initializeSequelize(): Sequelize {
  if (sequelize) {
    return sequelize;
  }

  const env = process.env.NODE_ENV || 'development';
  const config = databaseConfig;

  logger.info(`Initializing Sequelize for ${env} environment`, {
    dialect: config.dialect,
    database: config.database || config.storage,
  });

  if (config.dialect === 'sqlite') {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: config.storage,
      logging: false,
      define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
      },
    });
  } else {
    sequelize = new Sequelize(config.database || '', config.username || '', config.password || '', {
      host: config.host,
      port: config.port || 3306,
      dialect: config.dialect as any,
      logging: false,
      define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
      },
      pool: config.pool,
    });
  }

  return sequelize;
}

/**
 * Get singleton Sequelize instance
 */
export function getSequelize(): Sequelize {
  if (!sequelize) {
    throw new Error('Sequelize not initialized. Call initializeSequelize() first.');
  }
  return sequelize;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const instance = initializeSequelize();
    await instance.authenticate();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}
```

---

### 2.2: Migrations Infrastructure

**Objective:** Setup migration system for version control of database schema

#### 2.2.1 Create Migration Template Helper

**File:** `src/database/migrations/.sequelizerc.js`

This allows Sequelize CLI to find migrations in correct location.

#### 2.2.2 Migration Naming Convention

All migrations follow timestamp pattern:

```
YYYYMMDDHHMMSS-<description>.js
```

Example:

```
20260512110000-create-roles.js
20260512110100-create-users.js
20260512110200-create-refresh-tokens.js
```

#### 2.2.3 Migration Template Structure

```typescript
// File: migrations/YYYYMMDDHHMMSS-create-<table>.js

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create table or add column
    await queryInterface.createTable('table_name', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      // ... columns
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('table_name', ['column_name']);
  },

  async down(queryInterface, Sequelize) {
    // Drop table (reversible)
    await queryInterface.dropTable('table_name');
  },
};
```

---

### 2.3: Database Schema (15 Migrations)

**Objective:** Create all tables from DATABASE_DESIGN-V2.1.MD

#### Migration Order

Migrations must follow **dependency order** to respect foreign keys:

```
1. 20260512110000-create-roles.js
2. 20260512110100-create-uploads.js          (independent)
3. 20260512110200-create-users.js            (FK: roles, uploads)
4. 20260512110300-create-refresh-tokens.js   (FK: users)
5. 20260512110400-create-restaurants.js      (FK: users, uploads)
6. 20260512110500-create-restaurant-images.js (FK: restaurants, uploads)
7. 20260512110600-create-categories.js       (FK: restaurants)
8. 20260512110700-create-dishes.js           (FK: restaurants, categories)
9. 20260512110800-create-dish-images.js      (FK: dishes, uploads)
10. 20260512110900-create-carts.js           (FK: users, restaurants)
11. 20260512111000-create-cart-items.js      (FK: carts, dishes)
12. 20260512111100-create-orders.js          (FK: users, restaurants, carts)
13. 20260512111200-create-order-items.js     (FK: orders, dishes)
14. 20260512111300-create-deliveries.js      (FK: orders, users)
15. 20260512111400-create-audit-logs.js      (no FK)
```

#### Table Details

##### 1. **roles** (Foundation)

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

Values: SUPER_ADMIN, RESTO_ADMIN, RESTO_STAFF, DRIVER, CUSTOMER
```

##### 2. **uploads** (File Management)

```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  type ENUM('AVATAR', 'LOGO', 'BANNER', 'DISH_IMAGE', 'OTHER'),
  folder VARCHAR(100),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

Index: type, folder, created_at
```

##### 3. **users** (Authentication)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL FK roles,
  restaurant_id UUID FK restaurants,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password VARCHAR(255) NOT NULL,
  avatar_id UUID FK uploads,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL,

  CHECK (role_specific_constraints)
);

Indexes:
  - email (UNIQUE)
  - role_id
  - restaurant_id
  - deleted_at
```

##### 4. **refresh_tokens** (JWT Management)

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL FK users,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

Index: user_id, expires_at
```

##### 5. **restaurants** (Business Entities)

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  admin_id UUID NOT NULL FK users,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  logo_id UUID FK uploads,
  banner_id UUID FK uploads,
  phone VARCHAR(30),
  email VARCHAR(150),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status ENUM('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED'),
  rejected_reason TEXT,
  is_open BOOLEAN DEFAULT FALSE,
  opening_time TIME,
  closing_time TIME,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

Indexes:
  - admin_id
  - slug (UNIQUE)
  - status
  - deleted_at
```

##### 6-15. **Other Tables**

Restaurant Images, Categories, Dishes, Dish Images, Carts, Cart Items, Orders, Order Items, Deliveries, Audit Logs

(Full SQL for each provided in DATABASE_DESIGN-V2.1.MD)

---

### 2.4: Indexes

**Objective:** Add performance indexes based on query patterns

#### Index Strategy

| Table       | Index                         | Purpose                  |
| ----------- | ----------------------------- | ------------------------ |
| users       | (email)                       | Login queries            |
| users       | (role_id)                     | Role-based filtering     |
| users       | (restaurant_id)               | Restaurant staff queries |
| restaurants | (slug)                        | URL-friendly lookup      |
| restaurants | (status)                      | Approval workflow        |
| dishes      | (restaurant_id, is_available) | Menu listing             |
| orders      | (user_id, created_at)         | User order history       |
| orders      | (restaurant_id, status)       | Order tracking           |
| cart_items  | (cart_id)                     | Cart operations          |
| deliveries  | (status)                      | Driver assignment        |

#### Implementation

Each migration includes index creation:

```typescript
async up(queryInterface, Sequelize) {
  // Create table
  await queryInterface.createTable('dishes', { ... });

  // Add indexes
  await queryInterface.addIndex('dishes', ['restaurant_id']);
  await queryInterface.addIndex('dishes', ['restaurant_id', 'is_available']);
  await queryInterface.addIndex('dishes', ['created_at']);
}
```

---

### 2.5: Seeding Infrastructure

**Objective:** Create seeders for development data

#### Seeder Files

```
seeders/
├── 20260512120000-seed-roles.js
├── 20260512120100-seed-users.js
├── 20260512120200-seed-restaurants.js
├── 20260512120300-seed-categories.js
├── 20260512120400-seed-dishes.js
└── README.md
```

#### Seeder Template

**File:** `seeders/YYYYMMDDHHMMSS-seed-<entity>.js`

```typescript
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert sample data
    await queryInterface.bulkInsert('roles', [
      {
        id: uuid(),
        name: 'SUPER_ADMIN',
        description: 'System administrator',
        created_at: new Date(),
        updated_at: new Date(),
      },
      // ... more roles
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Delete seeded data
    await queryInterface.bulkDelete('roles', null, {});
  },
};
```

#### Sample Data

**Roles:**

```
SUPER_ADMIN  — Full system access
RESTO_ADMIN  — Own restaurant management
RESTO_STAFF  — Operational staff
DRIVER       — Delivery operations
CUSTOMER     — End user
```

**Sample Users:**

- 1 Super Admin (admin@foodtrip.local)
- 2 Restaurant Admins (resto1@, resto2@)
- 3 Staff members
- 3 Drivers
- 5 Customers

**Sample Data:**

- 2 Restaurants with complete info
- 4 Categories per restaurant
- 8-12 Dishes per category

---

## 🔗 Dependencies Between Tasks

```
2.1 Sequelize Init
  ↓
2.1.2 Initialize Sequelize CLI
  ↓
2.1.3 Update Config + 2.1.4 Create sequelize.ts
  ↓
2.2 Migration Infrastructure
  ↓
2.3 Create Migrations (in order)
  ↓
2.4 Add Indexes
  ↓
2.5 Create Seeders
  ↓
Phase 2 Complete → Phase 3 (Shared Infrastructure)
```

---

## ✅ Acceptance Criteria

Before moving to Phase 3, verify:

### Sequelize Setup

- [ ] Sequelize installed and initialized
- [ ] `src/database/sequelize.ts` creates connection
- [ ] Connection pooling configured
- [ ] Test database connection successful

### Migrations

- [ ] All 15 migrations created
- [ ] Migrations run in correct order
- [ ] `pnpm db:migrate` completes without errors
- [ ] All tables created in database
- [ ] `pnpm db:migrate:undo` works (reversible)

### Schema Integrity

- [ ] All foreign key constraints present
- [ ] All CHECK constraints enforced
- [ ] All UNIQUE constraints active
- [ ] Soft deletes working (paranoid: true)
- [ ] Default values applied

### Indexes

- [ ] All performance indexes created
- [ ] Query performance acceptable
- [ ] No duplicate indexes

### Seeding

- [ ] All seeders created
- [ ] `pnpm db:seed` loads sample data
- [ ] `pnpm db:seed:undo` clears data
- [ ] Sample data valid for testing

### Testing

- [ ] Run migrations clean from scratch
- [ ] Rollback and re-run migrations
- [ ] Verify schema consistency
- [ ] Test foreign key constraints

---

## ⚠️ Known Risks & Considerations

| Risk                          | Probability | Mitigation                             |
| ----------------------------- | ----------- | -------------------------------------- |
| Migration order dependencies  | Medium      | Follow dependency order strictly       |
| Foreign key constraint errors | Medium      | Create tables in correct order         |
| SQLite limitations            | Low         | Use MySQL for production testing       |
| Soft delete scoping           | Medium      | Always use `paranoid: true`            |
| Connection pooling issues     | Low         | Test with multiple concurrent requests |
| Index performance             | Low         | Profile queries after creation         |
| Seeder data conflicts         | Low         | Use unique values in seeders           |

---

## 📦 Deliverables

Upon Phase 2 completion:

1. ✅ Sequelize initialized and configured
2. ✅ 15 migrations created and tested
3. ✅ All tables with proper constraints
4. ✅ Performance indexes in place
5. ✅ Seeders for development data
6. ✅ Connection pooling operational
7. ✅ Soft delete support enabled
8. ✅ Database schema documented

---

## 🔄 Next Phase Dependencies

Phase 3 (Shared Infrastructure) requires:

- ✅ Database initialized and functional
- ✅ All tables created with proper structure
- ✅ Foreign key relationships working
- ✅ Soft deletes operational
- ✅ Sample data available for testing

**Phase 3 will:**

- Create error handling classes
- Implement response helpers
- Setup middleware (auth, validation)
- Create application constants

---

## 📝 Implementation Notes

### Creating Migrations

Use Sequelize CLI to generate migration skeletons:

```bash
npx sequelize-cli migration:generate --name create-roles
```

Then fill in the `up` and `down` functions.

### Testing Migrations

```bash
# Run all pending migrations
pnpm db:migrate

# Rollback last batch
pnpm db:migrate:undo

# Rollback all
pnpm db:migrate:undo:all

# Migrate to specific version
pnpm db:migrate --name 20260512110000-create-roles
```

### Working with Soft Deletes

With `paranoid: true`, queries automatically exclude deleted records:

```typescript
// Automatically excludes deleted_at IS NOT NULL
await User.findAll();

// Include deleted records
await User.findAll({ paranoid: false });

// Only deleted records
await User.findAll({
  paranoid: false,
  where: Sequelize.where(Sequelize.col('deleted_at'), Op.not, null),
});
```

### Connection Pooling

In development: min 2, max 5  
In production: min 5, max 20

Tuning based on:

- Number of concurrent database operations
- API endpoint load
- Worker process count

---

## 📚 Related Documents

- [DATABASE_DESIGN-V2.1.MD](./DATABASE_DESIGN-V2.1.MD) — Full schema with SQL
- [IMPLEMENTATION-CHECKLIST.MD](./IMPLEMENTATION-CHECKLIST.MD) — Complete phase list
- [PHASE-1-OVERVIEW.MD](./PHASE-1-OVERVIEW.MD) — Project setup details
- [ENVIRONMENT-GUIDE.MD](./ENVIRONMENT-GUIDE.MD) — Database env variables

---

## 📊 Estimated Timeline

| Task                            | Duration     |
| ------------------------------- | ------------ |
| Sequelize setup (2.1)           | 1-2 hours    |
| Migrations infrastructure (2.2) | 30 min       |
| Schema migrations (2.3)         | 3-4 hours    |
| Indexes (2.4)                   | 1 hour       |
| Seeders (2.5)                   | 1-2 hours    |
| Testing & validation            | 1-2 hours    |
| **Total**                       | **5-7 days** |

---

**Ready to implement Phase 2? → Start with task 2.1 "Sequelize Configuration"**
