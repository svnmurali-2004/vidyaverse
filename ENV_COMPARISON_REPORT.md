# Environment Variables Comparison & Fixes

## 🔍 **Comparison Results**

### ❌ **Issues Found:**

| Schema Variable         | .env Variable | Status                      | Fix Applied        |
| ----------------------- | ------------- | --------------------------- | ------------------ |
| `MONGODB_URI`           | `MONGO_URI`   | ❌ Mismatch                 | ✅ Updated schema  |
| `STRIPE_SECRET_KEY`     | Missing       | ❌ Required but not present | ✅ Made optional   |
| `RAZORPAY_KEY_ID`       | Missing       | ❌ Required but not present | ✅ Made optional   |
| `RAZORPAY_KEY_SECRET`   | Missing       | ❌ Required but not present | ✅ Made optional   |
| `NEXTAUTH_SECRET`       | Present       | ❌ Missing from schema      | ✅ Added to schema |
| `GOOGLE_CLIENT_ID`      | Present       | ❌ Missing from schema      | ✅ Added to schema |
| `GOOGLE_CLIENT_SECRET`  | Present       | ❌ Missing from schema      | ✅ Added to schema |
| `GITHUB_CLIENT_ID`      | Present       | ❌ Missing from schema      | ✅ Added to schema |
| `GITHUB_CLIENT_SECRET`  | Present       | ❌ Missing from schema      | ✅ Added to schema |
| `TWILIO_*` variables    | Present       | ❌ Missing from schema      | ✅ Added to schema |
| `BLOB_READ_WRITE_TOKEN` | Present       | ❌ Missing from schema      | ✅ Added to schema |

## ✅ **Fixes Applied:**

### 1. **Updated Environment Schema** (`src/lib/env.js`)

```javascript
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database - Fixed variable name
  MONGO_URI: z.string().url(), // ✅ Changed from MONGODB_URI

  // NextAuth - Added missing variables
  NEXTAUTH_SECRET: z.string().min(1), // ✅ Added
  GOOGLE_CLIENT_ID: z.string().min(1), // ✅ Added
  GOOGLE_CLIENT_SECRET: z.string().min(1), // ✅ Added
  GITHUB_CLIENT_ID: z.string().min(1), // ✅ Added
  GITHUB_CLIENT_SECRET: z.string().min(1), // ✅ Added

  // Email configuration - Already correct
  EMAIL_PROVIDER: z.enum(["gmail", "smtp"]).optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_SECURE: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Twilio - Added from .env
  TWILIO_AUTH_TOKEN: z.string().optional(), // ✅ Added
  CRON_SECRET: z.string().optional(), // ✅ Added
  TWILIO_ACCOUNT_SID: z.string().optional(), // ✅ Added
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(), // ✅ Added

  // Vercel Blob - Added from .env
  BLOB_READ_WRITE_TOKEN: z.string().optional(), // ✅ Added

  // Payment providers - Made optional
  STRIPE_SECRET_KEY: z.string().min(10).optional(), // ✅ Made optional
  RAZORPAY_KEY_ID: z.string().optional(), // ✅ Made optional
  RAZORPAY_KEY_SECRET: z.string().optional(), // ✅ Made optional

  // Other optional variables
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});
```

### 2. **Updated Database Connection** (`src/lib/db.js`)

```javascript
// ✅ Changed from MONGODB_URI to MONGO_URI
const MONGO_URI = env.MONGO_URI;
```

## 🔧 **Current .env File Structure**

```env
# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXTAUTH_SECRET=your-nextauth-secret

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lms

# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_PASSWORD=your-app-password
EMAIL_APP_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_FROM=noreply@vidyaverse.com

# Twilio (SMS/Communication)
TWILIO_AUTH_TOKEN=your-twilio-token
CRON_SECRET=your-cron-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_MESSAGING_SERVICE_SID=your-messaging-sid

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your-blob-token
```

## 🚀 **Validation Status**

After the fixes:

- ✅ All required variables are now properly defined
- ✅ Database connection uses correct variable name
- ✅ Authentication variables are included
- ✅ Email configuration matches schema
- ✅ Optional variables won't cause validation errors

## 📝 **Recommendations**

### 1. **Security Improvements**

- 🔒 Move `.env` to project root (not in `src/`)
- 🔒 Add `.env` to `.gitignore`
- 🔒 Use different secrets for production

### 2. **Missing Variables for Full Functionality**

If you plan to use these features, add:

```env
# Payment Processing (if needed)
STRIPE_SECRET_KEY=your-stripe-key
RAZORPAY_KEY_ID=your-razorpay-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# API Base URL (if needed)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## ✅ **Verification**

The environment schema now matches your `.env` file completely. Your application should start without environment validation errors.
