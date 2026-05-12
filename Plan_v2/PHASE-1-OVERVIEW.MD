# Phase 1: Project Setup & Infrastructure

**Phase:** 1 of 15  
**Status:** Ready to Implement  
**Estimated Duration:** 3-4 days  
**Target Start:** May 13, 2026

---

## 🎯 Phase Objectives

Phase 1 establishes the foundational infrastructure for FoodTrip API v2.1. This phase is **critical path** — all subsequent phases depend on successful completion.

### Primary Goals

1. ✅ Initialize Node.js/TypeScript project with proper tooling
2. ✅ Configure development environment (file structure, path aliases, scripts)
3. ✅ Install & configure all core dependencies (Express, Sequelize, security, testing)
4. ✅ Setup code quality enforcement (ESLint, Prettier, Husky)
5. ✅ Create environment configuration system for multi-environment support
6. ✅ Establish build & runtime scripts

### Success Criteria

- [ ] Project builds without errors (`pnpm build`)
- [ ] All npm scripts work (`pnpm dev`, `pnpm test`, `pnpm lint`, etc.)
- [ ] TypeScript strict mode enabled with zero errors
- [ ] ESLint and Prettier configured and enforced via pre-commit hooks
- [ ] Environment configuration loads correctly in dev/staging/prod
- [ ] Database connection test passes (even if DB not created yet)

---

## 📋 Task Breakdown

### 1.1: Project Initialization

**Objective:** Create project structure and package configuration

| Task | Details | Depends On |
|------|---------|-----------|
| Create project directory | `foodtrip-api-v2` root folder | None |
| Initialize pnpm workspace | `pnpm init`, configure `pnpm-workspace.yaml` | Directory created |
| Create directory structure | `src/`, `tests/`, `migrations/`, `seeders/`, `dist/`, `.github/` | pnpm init |
| Configure TypeScript | Create `tsconfig.json` with strict mode, path aliases | Directory structure |
| Setup path aliases | `@src`, `@modules`, `@shared`, `@config` in tsconfig | tsconfig.json |

**Directory Structure Output:**

```
foodtrip-api-v2/
├── src/
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── restaurants/
│   │   └── ...
│   ├── shared/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── types/
│   │   └── helpers/
│   ├── database/
│   │   ├── models/
│   │   ├── migrations/
│   │   └── seeders/
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── migrations/ (Sequelize CLI)
├── seeders/   (Sequelize CLI)
├── dist/      (build output)
├── .github/   (actions, instructions)
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .env.example
├── .env.development
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
└── README.md
```

---

### 1.2: Dependencies Installation

**Objective:** Install all core, auth, validation, storage, security, and testing packages

#### Core Framework

```bash
pnpm add express@^4.18.0
```

**Packages:**
- `express` — HTTP server framework
- `dotenv` — Environment configuration loader

#### Database & ORM

```bash
pnpm add sequelize@^6.35.0 pg@^8.11.0 mysql2@^3.6.0 sqlite3@^5.1.6
```

**Packages:**
- `sequelize` — ORM for SQL databases
- `pg` — PostgreSQL driver
- `mysql2` — MySQL driver
- `sqlite3` — SQLite driver (development)

#### Authentication & Security

```bash
pnpm add jsonwebtoken@^9.1.0 bcryptjs@^2.4.3 helmet@^7.0.0 cors@^2.8.5 express-rate-limit@^7.1.0
```

**Packages:**
- `jsonwebtoken` — JWT token signing & verification
- `bcryptjs` — Password hashing
- `helmet` — HTTP security headers
- `cors` — Cross-origin resource sharing
- `express-rate-limit` — Rate limiting middleware

#### Validation & Serialization

```bash
pnpm add zod@^3.22.0
```

**Packages:**
- `zod` — TypeScript-first schema validation

#### File Upload & Processing

```bash
pnpm add multer@^1.4.5 sharp@^0.32.0 uuid@^9.0.0
```

**Packages:**
- `multer` — Multipart form data handling
- `sharp` — Image processing & resizing
- `uuid` — UUID v4 generation

#### Logging & Utilities

```bash
pnpm add winston@^3.11.0 lodash@^4.17.21
```

**Packages:**
- `winston` — Logging library
- `lodash` — Utility functions

#### Testing

```bash
pnpm add -D jest@^29.7.0 @types/jest@^29.5.0 supertest@^6.3.0 @types/node@^20.0.0
```

**Packages:**
- `jest` — Testing framework
- `supertest` — HTTP assertion library
- `@types/*` — TypeScript definitions

#### Development & Build Tools

```bash
pnpm add -D typescript@^5.2.0 ts-node@^10.9.0 nodemon@^3.0.0 tsconfig-paths@^4.2.0
```

**Packages:**
- `typescript` — TypeScript compiler
- `ts-node` — TypeScript execution
- `nodemon` — Auto-reload on file changes
- `tsconfig-paths` — Resolve path aliases at runtime

#### Code Quality

```bash
pnpm add -D eslint@^8.50.0 @typescript-eslint/eslint-plugin@^6.0.0 @typescript-eslint/parser@^6.0.0 prettier@^3.0.0 eslint-config-prettier@^9.0.0
```

**Packages:**
- `eslint` — Code linting
- `@typescript-eslint/*` — TypeScript linting rules
- `prettier` — Code formatting
- `eslint-config-prettier` — Disable ESLint rules that conflict with Prettier

#### Git Hooks

```bash
pnpm add -D husky@^8.0.0 lint-staged@^15.0.0
```

**Packages:**
- `husky` — Git hooks manager
- `lint-staged` — Run tasks on staged files

**Total Installation Commands:**

```bash
# Install all packages in one command
pnpm add express@^4.18.0 dotenv@^16.3.0 \
  sequelize@^6.35.0 pg@^8.11.0 mysql2@^3.6.0 sqlite3@^5.1.6 \
  jsonwebtoken@^9.1.0 bcryptjs@^2.4.3 helmet@^7.0.0 cors@^2.8.5 express-rate-limit@^7.1.0 \
  zod@^3.22.0 \
  multer@^1.4.5 sharp@^0.32.0 uuid@^9.0.0 \
  winston@^3.11.0 lodash@^4.17.21 \
  -D jest@^29.7.0 @types/jest@^29.5.0 supertest@^6.3.0 @types/node@^20.0.0 \
  typescript@^5.2.0 ts-node@^10.9.0 nodemon@^3.0.0 tsconfig-paths@^4.2.0 \
  eslint@^8.50.0 @typescript-eslint/eslint-plugin@^6.0.0 @typescript-eslint/parser@^6.0.0 \
  prettier@^3.0.0 eslint-config-prettier@^9.0.0 \
  husky@^8.0.0 lint-staged@^15.0.0
```

---

### 1.3: Configuration & Setup

**Objective:** Create configuration files for development environment

#### Environment Files

**File:** `.env.example` (commit to repo)

```bash
# ============================================
# NODE & APP
# ============================================
NODE_ENV=development
PORT=3000
APP_NAME=FoodTrip API
APP_URL=http://localhost:3000

# ============================================
# DATABASE
# ============================================
# Development (SQLite)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
BCRYPT_ROUNDS=10

# ============================================
# CORS & SECURITY
# ============================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
HELMET_ENABLED=true

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=20

# ============================================
# FILE UPLOAD
# ============================================
UPLOAD_MAX_SIZE=5242880
UPLOAD_DIR=./uploads
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
LOG_FORMAT=json

# ============================================
# API DOCUMENTATION
# ============================================
SWAGGER_ENABLED=true
SWAGGER_PATH=/api/docs
```

**File:** `.env.development` (do not commit)

```bash
NODE_ENV=development
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
JWT_SECRET=dev_super_secret_key_min_32_chars_long_here
JWT_REFRESH_SECRET=dev_refresh_secret_min_32_chars_long
BCRYPT_ROUNDS=10
LOG_LEVEL=debug
```

#### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@src/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@config/*": ["src/config/*"],
      "@db/*": ["src/database/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### ESLint Configuration

**File:** `.eslintrc.json`

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-types": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "max-len": ["warn", { "code": 120 }]
  }
}
```

#### Prettier Configuration

**File:** `.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Git Hooks Configuration

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

**File:** `.lintstagedrc.json`

```json
{
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.json": ["prettier --write"],
  "*.md": ["prettier --write"]
}
```

#### .gitignore

**File:** `.gitignore`

```
# Dependencies
node_modules/
pnpm-lock.yaml

# Environment
.env
.env.*.local
.env.production.local

# Build
dist/
build/
*.tsbuildinfo

# Database
*.sqlite
*.sqlite3
database.sqlite

# Upload directory
uploads/
tmp/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db
```

---

### 1.4: Build & Runtime Scripts

**Objective:** Configure npm scripts for development, testing, building, and database operations

**File:** `package.json` scripts section

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node --project tsconfig.json src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/ --ext .ts",
    "lint:fix": "eslint src/ --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:seed:undo": "npx sequelize-cli db:seed:undo:all",
    "prepare": "husky install"
  }
}
```

**Script Responsibilities:**

| Script | Purpose | Used By |
|--------|---------|---------|
| `pnpm dev` | Start development server with auto-reload | Developers |
| `pnpm build` | Compile TypeScript to JavaScript | CI/CD, production |
| `pnpm start` | Run compiled production build | Docker, production |
| `pnpm lint` | Check code quality issues | Pre-commit, CI |
| `pnpm lint:fix` | Auto-fix linting issues | Development |
| `pnpm format` | Auto-format code with Prettier | Development |
| `pnpm format:check` | Check if code needs formatting | CI |
| `pnpm test` | Run all tests once | CI, pre-commit |
| `pnpm test:watch` | Run tests in watch mode | Development |
| `pnpm test:coverage` | Generate coverage report | CI, metrics |
| `pnpm db:migrate` | Run pending database migrations | Deployment |
| `pnpm db:migrate:undo` | Rollback last migration | Development |
| `pnpm db:seed` | Seed database with sample data | Development setup |
| `pnpm db:seed:undo` | Clear seeded data | Development |

---

### 1.5: Configuration Loaders

**Objective:** Create runtime configuration system that loads from `.env` and validates

**File:** `src/config/index.ts`

```typescript
import dotenv from 'dotenv';
import path from 'path';

// Load .env file based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export interface AppConfig {
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  appName: string;
  appUrl: string;
}

export interface DatabaseConfig {
  dialect: 'sqlite' | 'mysql' | 'postgres';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  storage?: string;
  pool?: { min: number; max: number; acquire: number; idle: number };
}

export interface JwtConfig {
  secret: string;
  expiry: string;
  refreshSecret: string;
  refreshExpiry: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  corsOrigin: string[];
  corsCredentials: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  authMaxRequests: number;
}

export interface FileUploadConfig {
  maxSize: number;
  uploadDir: string;
  allowedMimeTypes: string[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
}

/**
 * Configuration loader with validation
 * Throws error if required env vars missing
 */
function validateConfig(): void {
  const required = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_DIALECT',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateConfig();

export const appConfig: AppConfig = {
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME || 'FoodTrip API',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

export const databaseConfig: DatabaseConfig = {
  dialect: (process.env.DB_DIALECT as any) || 'sqlite',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  storage: process.env.DB_STORAGE,
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
};

export const jwtConfig: JwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiry: process.env.JWT_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export const securityConfig: SecurityConfig = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  corsCredentials: process.env.CORS_CREDENTIALS !== 'false',
};

export const rateLimitConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20', 10),
};

export const fileUploadConfig: FileUploadConfig = {
  maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(','),
};

export const loggingConfig: LoggingConfig = {
  level: (process.env.LOG_LEVEL as any) || 'debug',
  format: (process.env.LOG_FORMAT as any) || 'json',
};

export default {
  app: appConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  security: securityConfig,
  rateLimit: rateLimitConfig,
  fileUpload: fileUploadConfig,
  logging: loggingConfig,
};
```

---

### 1.6: Logging Service

**Objective:** Create centralized logging system using Winston

**File:** `src/shared/utils/logger.ts`

```typescript
import winston from 'winston';
import { loggingConfig } from '@config/index';

const logger = winston.createLogger({
  level: loggingConfig.level,
  format:
    loggingConfig.format === 'json'
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          })
        ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

---

### 1.7: Initialize Git & Version Control

**Objective:** Setup git repository with proper history

**Commands:**

```bash
# Initialize git repo
git init

# Setup Husky for pre-commit hooks
pnpm prepare

# Make initial commit
git add .
git commit -m "chore: initial project setup for FoodTrip API v2.1"
```

---

## 🔗 Dependencies Between Tasks

```
1.1 Project Init
  ↓
1.2 Install Dependencies
  ↓
1.3 Configuration Files (parallel with 1.4 & 1.5)
1.4 Build Scripts
1.5 Config Loaders
1.6 Logging Service
  ↓
1.7 Git Setup
  ↓
Phase 1 Complete → Phase 2 (Database Setup)
```

---

## ✅ Acceptance Criteria

Before moving to Phase 2, verify:

### Build & Runtime

- [ ] `pnpm build` compiles TypeScript without errors
- [ ] `pnpm dev` starts development server (port 3000)
- [ ] `pnpm lint` reports no errors
- [ ] `pnpm format` runs without issues
- [ ] `pnpm test` (even empty test suite) runs successfully
- [ ] `pnpm start` would run compiled code (if built)

### TypeScript

- [ ] `tsconfig.json` has `strict: true`
- [ ] All path aliases work (`@src`, `@modules`, `@shared`, `@config`)
- [ ] Zero TypeScript errors in IDE
- [ ] No `any` types in code

### Configuration

- [ ] `.env.example` committed to repo
- [ ] `.env.development` created locally (not committed)
- [ ] All required env vars documented
- [ ] Config loader validates on startup
- [ ] Logging works in development mode

### Code Quality

- [ ] ESLint configured for TypeScript
- [ ] Prettier configured
- [ ] Pre-commit hooks (Husky) enabled
- [ ] `pnpm lint:fix` works
- [ ] `pnpm format` works

### Documentation

- [ ] `README.md` updated with setup instructions
- [ ] `.env.example` includes all config options
- [ ] All npm scripts documented in README

---

## ⚠️ Known Risks & Considerations

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| TypeScript strict mode prevents development velocity | Low | Use `// @ts-ignore` sparingly; breaks are acceptable during setup |
| Database dialect not installed | Medium | Ensure all drivers installed: sqlite3, pg, mysql2 |
| Path aliases not resolving at runtime | Medium | Install `tsconfig-paths` and load in entry point |
| Environment variables missing | High | Validate on startup; provide clear error messages |
| Husky/pre-commit hooks slow down commits | Low | Setup is one-time; can be bypassed with `--no-verify` if needed |

---

## 📦 Deliverables

Upon Phase 1 completion:

1. ✅ Full project directory structure
2. ✅ TypeScript configured with strict mode
3. ✅ All dependencies installed (35+ packages)
4. ✅ Development scripts working (`pnpm dev`, `pnpm test`, `pnpm lint`)
5. ✅ Configuration system (loads from `.env` with validation)
6. ✅ Logging service configured
7. ✅ Code quality tooling (ESLint, Prettier, Husky)
8. ✅ Git repository initialized
9. ✅ Documentation updated

---

## 🔄 Next Phase Dependencies

Phase 2 (Database & ORM Setup) requires:

- ✅ Project initialized with Node.js structure
- ✅ TypeScript strict mode enabled
- ✅ `pnpm` scripts working
- ✅ Configuration system loaded
- ✅ All dev dependencies installed (jest, ts-node, nodemon)

**Phase 2 will:**

- Initialize Sequelize CLI
- Create database migrations for all 23 tables
- Configure connection pooling
- Setup database seeders

---

## 📝 Implementation Notes

### Working with TypeScript

- Use `interface` for external types, `type` for unions/aliases
- Avoid `any` — use generics or proper types
- Enable strict mode from day 1 — don't defer to later
- Use JSDoc comments for public APIs

### npm Scripts Best Practice

- Never run build artifacts directly; always use `npm start` / `pnpm start`
- Use `pnpm dev` for local development only
- Add `--exit` flag to Jest if tests hang

### Environment Variables

- Never commit `.env` (only `.env.example`)
- Add new env var → update `.env.example` → test locally → document in README
- Validate all env vars on startup, fail fast if missing

### Pre-commit Hooks with Husky

- Lint-staged only runs on changed files (faster than linting whole repo)
- Can bypass with `git commit --no-verify` if absolutely necessary (not recommended)
- First-time setup: `pnpm prepare` to install hooks

---

## 📚 Related Documents

- [IMPLEMENTATION-CHECKLIST.MD](./IMPLEMENTATION-CHECKLIST.MD) — Full 15-phase roadmap
- [ENVIRONMENT-GUIDE.MD](./ENVIRONMENT-GUIDE.MD) — Detailed env var documentation
- [DATABASE_DESIGN-V2.1.MD](./DATABASE_DESIGN-V2.1.MD) — Schema for Phase 2
- [API-ERROR-CODES.MD](./API-ERROR-CODES.MD) — Error handling for Phase 3

---

**Ready to implement? → Start with Task 1.1 "Project Initialization"**
