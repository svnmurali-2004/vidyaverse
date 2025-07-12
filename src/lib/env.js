// lib/env.js
import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  MONGO_URI: z.string().min(1), // Relaxed validation for now

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  // Email configuration
  EMAIL_PROVIDER: z.enum(["gmail", "smtp"]).optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_SECURE: z.string().optional(),
  EMAIL_USER: z.string().optional(), // Relaxed email validation
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(), // Relaxed email validation

  // Twilio
  TWILIO_AUTH_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

  // Vercel Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1),

  // Razorpay Configuration
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_SECRET: z.string().optional(),

  // Optional variables
  NEXT_PUBLIC_API_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

// Validate and export
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));

  // In development, log more details
  if (process.env.NODE_ENV === "development") {
    console.error("Current environment variables:");
    console.error({
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI: process.env.MONGO_URI ? "✅ Set" : "❌ Missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
      EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing",
      RAZORPAY_SECRET: process.env.RAZORPAY_SECRET ? "✅ Set" : "❌ Missing",
    });
  }

  throw new Error("Invalid environment variables - check console for details");
}

export const env = parsed.data;
