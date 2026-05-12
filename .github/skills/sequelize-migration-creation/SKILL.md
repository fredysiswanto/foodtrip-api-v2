---
name: sequelize-migration-creation
user-invocable: true
description: "Use when: creating Sequelize migrations for new tables, adding columns, creating indexes, implementing soft deletes, adding constraints. Provides templates matching DATABASE_DESIGN-V2.1.MD schema with reversible up/down functions."
---

# Sequelize Migration Creation

Create database migrations following v2.1 schema standards with reversible up/down functions.

## Key Principles

1. **Always reversible** — `down()` must undo `up()` completely
2. **Schema first** — Migration must match DATABASE_DESIGN-V2.1.MD
3. **Constraints matter** — NOT NULL, UNIQUE, CHECK, FOREIGN KEY all required
4. **Soft deletes** — Core tables include `deleted_at` column
5. **Timestamps** — All tables have `created_at` and `updated_at`
6. **Indexes** — Create indexes for performance (foreign keys, frequently queried)
7. **No data** — Never include production data in migrations

---

## Migration File Structure

### Naming Convention

```
src/database/migrations/[timestamp]-[description].ts

Examples:
- 20260101120000-create-users-table.ts
- 20260101120100-create-restaurants-table.ts
- 20260101120200-add-soft-delete-to-dishes.ts
- 20260101120300-create-orders-table.ts
```

### File Structure

```typescript
module.exports = {
  async up(queryInterface, Sequelize) {
    // Forward migration (create table, add column, etc.)
  },

  async down(queryInterface, Sequelize) {
    // Reverse migration (drop table, remove column, etc.)
  },
};
```

---

## Examples

### 1. Create Table with Soft Deletes

```typescript
// src/database/migrations/20260101120000-create-users-table.ts

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "users",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: { len: [5, 255] },
        },
        password_hash: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        role: {
          type: Sequelize.ENUM(
            "SUPER_ADMIN",
            "RESTO_ADMIN",
            "RESTO_STAFF",
            "DRIVER",
            "CUSTOMER",
          ),
          allowNull: false,
          defaultValue: "CUSTOMER",
        },
        status: {
          type: Sequelize.ENUM("ACTIVE", "SUSPENDED", "DELETED"),
          allowNull: false,
          defaultValue: "ACTIVE",
        },
        // Soft delete column
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        // Timestamps
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
    );

    // Create indexes for performance
    await queryInterface.addIndex("users", ["email"]);
    await queryInterface.addIndex("users", ["phone"]);
    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["deleted_at"]);
  },

  async down(queryInterface, Sequelize) {
    // Drop table removes indexes automatically
    await queryInterface.dropTable("users");
  },
};
```

### 2. Create Table with Foreign Keys

```typescript
// src/database/migrations/20260101120100-create-dishes-table.ts

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "dishes",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "restaurants",
            key: "id",
          },
          onDelete: "CASCADE", // Delete dishes when restaurant deleted
          onUpdate: "CASCADE",
        },
        category_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "RESTRICT", // Don't allow category deletion if dishes exist
          onUpdate: "CASCADE",
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        // Optimistic locking column
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
          allowNull: false,
          defaultValue: "ACTIVE",
        },
        // Soft delete
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        // Timestamps
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
    );

    // Foreign key indexes
    await queryInterface.addIndex("dishes", ["restaurant_id"]);
    await queryInterface.addIndex("dishes", ["category_id"]);
    await queryInterface.addIndex("dishes", ["status"]);
    await queryInterface.addIndex("dishes", ["deleted_at"]);

    // Composite index for common queries
    await queryInterface.addIndex("dishes", ["restaurant_id", "status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("dishes");
  },
};
```

### 3. Add Column with Constraint

```typescript
// src/database/migrations/20260101120200-add-avatar-to-users.ts

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "avatar_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "uploads",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Add index for foreign key
    await queryInterface.addIndex("users", ["avatar_id"]);
  },

  async down(queryInterface, Sequelize) {
    // Remove index first (good practice)
    await queryInterface.removeIndex("users", ["avatar_id"]);

    // Then remove column
    await queryInterface.removeColumn("users", "avatar_id");
  },
};
```

### 4. Create Table with Composite Unique Constraint

```typescript
// src/database/migrations/20260101120300-create-restaurant-menus-table.ts

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "restaurant_menus",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "restaurants",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        category_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "RESTRICT",
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        uniqueKeys: {
          // Prevent duplicate restaurant-category mappings
          unique_restaurant_category: {
            fields: ["restaurant_id", "category_id"],
          },
        },
      },
    );

    await queryInterface.addIndex("restaurant_menus", ["restaurant_id"]);
    await queryInterface.addIndex("restaurant_menus", ["category_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("restaurant_menus");
  },
};
```

### 5. Create Orders Table (Complex)

```typescript
// src/database/migrations/20260101120400-create-orders-table.ts

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "orders",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "restaurants",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        delivery_address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        total_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        status: {
          type: Sequelize.ENUM(
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY",
            "PICKED_UP",
            "DELIVERED",
            "CANCELLED",
          ),
          allowNull: false,
          defaultValue: "PENDING",
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
    );

    // Indexes for common queries
    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["restaurant_id"]);
    await queryInterface.addIndex("orders", ["status"]);
    await queryInterface.addIndex("orders", ["created_at"]);
    await queryInterface.addIndex("orders", ["deleted_at"]);

    // Composite index for user's restaurant orders
    await queryInterface.addIndex("orders", ["user_id", "restaurant_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders");
  },
};
```

### 6. Create Uploads Table (File Storage)

```typescript
// src/database/migrations/20260101120500-create-uploads-table.ts

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "uploads",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        type: {
          type: Sequelize.ENUM(
            "AVATAR",
            "RESTAURANT_LOGO",
            "RESTAURANT_BANNER",
            "DISH_IMAGE",
            "DOCUMENT",
          ),
          allowNull: false,
        },
        file_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        file_path: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        mime_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        file_size: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        storage_type: {
          type: Sequelize.ENUM("LOCAL", "S3", "GCS"),
          allowNull: false,
          defaultValue: "LOCAL",
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
    );

    await queryInterface.addIndex("uploads", ["user_id"]);
    await queryInterface.addIndex("uploads", ["type"]);
    await queryInterface.addIndex("uploads", ["deleted_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("uploads");
  },
};
```

---

## Migration Commands

```bash
# Create new migration file
pnpm sequelize-cli migration:generate --name create-users-table

# Run all pending migrations
pnpm db:migrate
# OR
pnpm sequelize-cli db:migrate

# Rollback last migration
pnpm db:rollback
# OR
pnpm sequelize-cli db:migrate:undo

# Rollback all migrations
pnpm sequelize-cli db:migrate:undo:all

# Check migration status
pnpm sequelize-cli db:migrate:status
```

---

## Configuration File

Create `.sequelizerc` in project root:

```javascript
const path = require("path");

module.exports = {
  config: path.resolve("src/config", "database.js"),
  "models-path": path.resolve("src/modules", "models"),
  "seeders-path": path.resolve("src/database/seeders"),
  "migrations-path": path.resolve("src/database/migrations"),
};
```

Database config at `src/config/database.js`:

```javascript
module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./data/database.sqlite",
    logging: false,
  },
  staging: {
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
  },
  production: {
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    ssl: "Amazon RDS",
    dialectOptions: {
      ssl: true,
    },
  },
};
```

---

## Common Patterns

### Adding NOT NULL Column to Existing Table

```typescript
// Add with default for existing rows
async up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'phone', {
    type: Sequelize.STRING,
    allowNull: true, // First allow NULL
    defaultValue: null
  });

  // Then in separate migration: Update existing rows and make NOT NULL
  // to avoid breaking existing data
}
```

### Renaming Column

```typescript
async up(queryInterface, Sequelize) {
  await queryInterface.renameColumn('users', 'password_hash', 'password');
}

async down(queryInterface, Sequelize) {
  await queryInterface.renameColumn('users', 'password', 'password_hash');
}
```

### Changing Column Type

```typescript
async up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'role', {
    type: Sequelize.STRING,
    allowNull: false
  });
}

async down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'role', {
    type: Sequelize.ENUM('SUPER_ADMIN', 'RESTO_ADMIN', 'RESTO_STAFF', 'DRIVER', 'CUSTOMER'),
    allowNull: false
  });
}
```

---

## Checklist Before Committing Migration

- [ ] Schema matches DATABASE_DESIGN-V2.1.MD exactly
- [ ] Migration file named with timestamp
- [ ] up() function creates/modifies schema
- [ ] down() function fully reverses up()
- [ ] All foreign keys defined with CASCADE/RESTRICT
- [ ] Soft delete column exists on core tables
- [ ] Indexes created for foreign keys
- [ ] NOT NULL constraints specified correctly
- [ ] UNIQUE constraints added where needed
- [ ] ENUM values defined correctly
- [ ] Timestamps (created_at, updated_at) present
- [ ] Charset is utf8mb4 for MySQL
- [ ] Migration tested: run up() then down()
- [ ] No production data in migration
- [ ] Commented if logic is complex

---

## Usage in Chat

```
Create migration for Phase 2:
- Create users table with soft deletes
- Create restaurants table with approval status
- Create categories table
- All matching DATABASE_DESIGN-V2.1.MD
```
