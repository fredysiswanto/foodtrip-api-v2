# Environment Configuration Guide

Complete guide for `.env` files across development, staging, and production environments.

---

# .env.example (Commit to repo)

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

# Production (MySQL) - uncomment and configure
# DB_DIALECT=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=foodtrip
# DB_PASSWORD=secure_password
# DB_NAME=foodtrip_production

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
# JWT - Generate with: openssl rand -hex 32
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Bcrypt
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# ============================================
# RATE LIMITING
# ============================================
# Window in milliseconds
RATE_LIMIT_WINDOW=900000
# Max requests per window
RATE_LIMIT_MAX_REQUESTS=100
# Max login attempts
RATE_LIMIT_AUTH_ATTEMPTS=5
RATE_LIMIT_AUTH_WINDOW=900000

# ============================================
# FILE UPLOAD & STORAGE
# ============================================
# Options: local, s3, gcs
STORAGE_TYPE=local

# Local storage
STORAGE_LOCAL_PATH=./uploads
MAX_FILE_SIZE=5242880

# AWS S3
# STORAGE_S3_BUCKET=foodtrip-dev
# STORAGE_S3_REGION=ap-southeast-1
# STORAGE_S3_ACCESS_KEY_ID=your_access_key
# STORAGE_S3_SECRET_ACCESS_KEY=your_secret_key

# Google Cloud Storage
# STORAGE_GCS_BUCKET=foodtrip-dev
# STORAGE_GCS_PROJECT_ID=your_project_id
# STORAGE_GCS_PRIVATE_KEY_ID=key_id
# STORAGE_GCS_PRIVATE_KEY=your_private_key

# Supported file types (comma-separated MIME types)
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif
UPLOAD_AVATAR_MAX_SIZE=2097152
UPLOAD_DISH_MAX_SIZE=5242880
UPLOAD_RESTAURANT_MAX_SIZE=5242880

# ============================================
# LOGGING
# ============================================
# Options: debug, info, warn, error
LOG_LEVEL=debug
LOG_FORMAT=json

# File logging (optional)
LOG_FILE_PATH=./logs/app.log
LOG_FILE_MAX_SIZE=10m
LOG_FILE_MAX_FILES=5

# ============================================
# THIRD-PARTY SERVICES (Future)
# ============================================
# Email Service
# MAIL_PROVIDER=sendgrid|mailgun|smtp
# SENDGRID_API_KEY=your_sendgrid_key
# MAILGUN_API_KEY=your_mailgun_key
# MAIL_FROM=noreply@foodtrip.com

# SMS Service
# SMS_PROVIDER=twilio|aws_sns
# TWILIO_ACCOUNT_SID=your_sid
# TWILIO_AUTH_TOKEN=your_token
# TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway
# PAYMENT_PROVIDER=midtrans|stripe|paypal
# MIDTRANS_SERVER_KEY=your_server_key
# MIDTRANS_CLIENT_KEY=your_client_key
# STRIPE_SECRET_KEY=your_secret_key
# STRIPE_PUBLISHABLE_KEY=your_publishable_key

# ============================================
# MONITORING & ANALYTICS
# ============================================
# Sentry error tracking
# SENTRY_DSN=https://key@sentry.io/project

# New Relic APM
# NEW_RELIC_LICENSE_KEY=your_license_key

# Datadog (optional)
# DATADOG_API_KEY=your_api_key

# ============================================
# REDIS (Future - Caching)
# ============================================
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# ============================================
# ADMIN & DEFAULTS
# ============================================
# Default super admin creation
DEFAULT_ADMIN_EMAIL=admin@foodtrip.local
DEFAULT_ADMIN_PASSWORD=ChangeMe123!

# System settings
SYSTEM_TIMEZONE=Asia/Jakarta
PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100

# ============================================
# FEATURE FLAGS
# ============================================
FEATURE_DELIVERY_ENABLED=false
FEATURE_PAYMENT_ENABLED=false
FEATURE_PROMO_ENABLED=false
FEATURE_REVIEWS_ENABLED=false
FEATURE_NOTIFICATIONS_ENABLED=false

# ============================================
# DEBUGGING
# ============================================
DEBUG=false
VERBOSE_LOGGING=false
```

---

# .env.development (Local Development)

```bash
NODE_ENV=development
PORT=3000
APP_NAME=FoodTrip API (Dev)
APP_URL=http://localhost:3000

# SQLite for easy setup
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Relaxed JWT for development
JWT_SECRET=dev_secret_key_does_not_need_to_be_secure
JWT_EXPIRY=30d
JWT_REFRESH_EXPIRY=90d

BCRYPT_ROUNDS=5  # Faster for development

CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173
CORS_CREDENTIALS=true

# Relaxed rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_AUTH_ATTEMPTS=100

# Local file storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./uploads
MAX_FILE_SIZE=52428800  # 50MB for testing

UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif

LOG_LEVEL=debug
LOG_FORMAT=pretty  # Readable format
DEBUG=true
VERBOSE_LOGGING=true

# All features enabled for development
FEATURE_DELIVERY_ENABLED=true
FEATURE_PAYMENT_ENABLED=false  # Enable when implementing
FEATURE_PROMO_ENABLED=false
FEATURE_REVIEWS_ENABLED=false
FEATURE_NOTIFICATIONS_ENABLED=false

DEFAULT_ADMIN_EMAIL=admin@foodtrip.local
DEFAULT_ADMIN_PASSWORD=admin123
```

---

# .env.staging (Staging Environment)

```bash
NODE_ENV=staging
PORT=3000
APP_NAME=FoodTrip API (Staging)
APP_URL=https://api-staging.foodtrip.example.com

# MySQL
DB_DIALECT=mysql
DB_HOST=staging-db.internal.example.com
DB_PORT=3306
DB_USER=foodtrip_staging
DB_PASSWORD=${DB_PASSWORD_STAGING}  # Use vault/secrets manager
DB_NAME=foodtrip_staging

# Secure JWT
JWT_SECRET=${JWT_SECRET_STAGING}  # Min 32 chars, from secrets manager
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

BCRYPT_ROUNDS=10

CORS_ORIGIN=https://staging.foodtrip.example.com,https://admin-staging.foodtrip.example.com
CORS_CREDENTIALS=true

# Standard rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_ATTEMPTS=5

# S3 Storage
STORAGE_TYPE=s3
STORAGE_S3_BUCKET=foodtrip-staging
STORAGE_S3_REGION=ap-southeast-1
STORAGE_S3_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID_STAGING}
STORAGE_S3_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY_STAGING}

MAX_FILE_SIZE=5242880  # 5MB

LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/foodtrip/app.log

# Enable delivery for testing
FEATURE_DELIVERY_ENABLED=true
FEATURE_PAYMENT_ENABLED=true  # Test payments
FEATURE_PROMO_ENABLED=false
FEATURE_REVIEWS_ENABLED=false
FEATURE_NOTIFICATIONS_ENABLED=true

# Monitoring
SENTRY_DSN=${SENTRY_DSN_STAGING}
NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_STAGING}

DEFAULT_ADMIN_EMAIL=admin@foodtrip.staging
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD_STAGING}
```

---

# .env.production (Production Environment)

```bash
NODE_ENV=production
PORT=3000
APP_NAME=FoodTrip API
APP_URL=https://api.foodtrip.example.com

# MySQL High Availability
DB_DIALECT=mysql
DB_HOST=db-master.prod.internal.example.com
DB_PORT=3306
DB_USER=foodtrip_prod
DB_PASSWORD=${DB_PASSWORD_PRODUCTION}  # AWS Secrets Manager
DB_NAME=foodtrip_production
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_CONNECTION_TIMEOUT=10000
DB_IDLE_TIMEOUT=30000

# Strong JWT (from AWS Secrets Manager)
JWT_SECRET=${JWT_SECRET_PRODUCTION}
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

BCRYPT_ROUNDS=12  # Strong hashing

CORS_ORIGIN=https://foodtrip.example.com,https://admin.foodtrip.example.com
CORS_CREDENTIALS=true

# Strict rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_ATTEMPTS=3

# S3 Storage with CloudFront
STORAGE_TYPE=s3
STORAGE_S3_BUCKET=foodtrip-prod
STORAGE_S3_REGION=ap-southeast-1
STORAGE_S3_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID_PROD}
STORAGE_S3_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY_PROD}
STORAGE_S3_CLOUDFRONT_URL=https://cdn.foodtrip.example.com

MAX_FILE_SIZE=5242880

LOG_LEVEL=warn
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/foodtrip/app.log
LOG_FILE_MAX_SIZE=100m
LOG_FILE_MAX_FILES=30

# All features enabled
FEATURE_DELIVERY_ENABLED=true
FEATURE_PAYMENT_ENABLED=true
FEATURE_PROMO_ENABLED=true
FEATURE_REVIEWS_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true

# Production services
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=${SENDGRID_API_KEY_PROD}
MAIL_FROM=noreply@foodtrip.com

SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID_PROD}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN_PROD}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER_PROD}

PAYMENT_PROVIDER=midtrans
MIDTRANS_SERVER_KEY=${MIDTRANS_SERVER_KEY_PROD}
MIDTRANS_CLIENT_KEY=${MIDTRANS_CLIENT_KEY_PROD}

# Monitoring & APM
SENTRY_DSN=${SENTRY_DSN_PROD}
NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_PROD}
DATADOG_API_KEY=${DATADOG_API_KEY_PROD}

# Redis Caching
REDIS_HOST=redis-prod.internal.example.com
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD_PROD}
REDIS_DB=0
REDIS_TLS=true

# Admin
DEFAULT_ADMIN_EMAIL=admin@foodtrip.com
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD_PROD}

# Timezone
SYSTEM_TIMEZONE=Asia/Jakarta
```

---

# Secrets Management Strategy

## Development

- Store in `.env` file locally
- Git ignore: `.env` (committed: `.env.example`)
- Rotate during onboarding

## Staging & Production

- **DO NOT commit secrets**
- Use secrets management service:
  - **AWS:** Secrets Manager / Parameter Store
  - **GCP:** Secret Manager
  - **Azure:** Key Vault
  - **Self-hosted:** HashiCorp Vault

### Loading Secrets in Production

```typescript
// config/env.ts
import aws from "aws-sdk";

async function loadSecretsFromAWS() {
  const secretsManager = new aws.SecretsManager();
  const secret = await secretsManager
    .getSecretValue({
      SecretId: "foodtrip/production",
    })
    .promise();

  return JSON.parse(secret.SecretString);
}

async function getEnv() {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const secrets = await loadSecretsFromAWS();
    return { ...process.env, ...secrets };
  }

  // Development: load from .env
  return process.env;
}
```

---

# Database Connection Strings

## Development (SQLite)

```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

## MySQL Connection

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=foodtrip_dev

# Optional: SSL for remote connections
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

## Connection String Format

```
mysql://user:password@host:port/database?ssl=true
```

---

# Feature Flags

Use environment variables to enable/disable features:

```typescript
// config/features.ts
export const features = {
  DELIVERY_ENABLED: process.env.FEATURE_DELIVERY_ENABLED === "true",
  PAYMENT_ENABLED: process.env.FEATURE_PAYMENT_ENABLED === "true",
  PROMO_ENABLED: process.env.FEATURE_PROMO_ENABLED === "true",
  REVIEWS_ENABLED: process.env.FEATURE_REVIEWS_ENABLED === "true",
  NOTIFICATIONS_ENABLED: process.env.FEATURE_NOTIFICATIONS_ENABLED === "true",
};

// Usage in routes
if (features.DELIVERY_ENABLED) {
  app.use("/api/v1/deliveries", deliveryRoutes);
}
```

---

# Validation

```typescript
// config/env.ts - Validate on startup
const requiredVars = [
  "NODE_ENV",
  "PORT",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "DB_DIALECT",
  "STORAGE_TYPE",
];

function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  // Validate formats
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  if (
    !["development", "staging", "production"].includes(process.env.NODE_ENV)
  ) {
    throw new Error("NODE_ENV must be development, staging, or production");
  }

  console.log("✓ Environment validation passed");
}

validateEnv();
```

---

# Checklist for Deployment

- [ ] All required vars set in `.env`
- [ ] Secrets stored in external vault (not in code)
- [ ] Database connection tested
- [ ] JWT secrets are cryptographically random
- [ ] File storage configured (S3, GCS, etc.)
- [ ] Log level set to `warn` or `error`
- [ ] Rate limits configured appropriately
- [ ] Monitoring services integrated
- [ ] CORS origins restricted
- [ ] NODE_ENV set to `production`

---

# Troubleshooting

| Issue                    | Cause                           | Solution                                      |
| ------------------------ | ------------------------------- | --------------------------------------------- |
| "DATABASE_UNAVAILABLE"   | DB connection fails             | Check DB_HOST, DB_PORT, credentials           |
| "INVALID_JWT_SECRET"     | JWT_SECRET too short            | Use `openssl rand -hex 32`                    |
| 403 CORS errors          | Wrong CORS_ORIGIN               | Add client URL to CORS_ORIGIN                 |
| Uploads fail             | Wrong STORAGE_TYPE config       | Verify AWS/GCS credentials                    |
| Rate limiting too strict | RATE_LIMIT_MAX_REQUESTS too low | Increase for staging                          |
| "INVALID_NODE_ENV"       | NODE_ENV misspelled             | Use exactly: development, staging, production |
