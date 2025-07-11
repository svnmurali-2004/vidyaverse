// lib/env.js
import dotenv from "dotenv";
import { z } from "zod";

// Load .env file
// Define your schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  MONGODB_URI: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(), // optional public var
  STRIPE_SECRET_KEY: z.string().min(10),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
});

// Validate and export
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
