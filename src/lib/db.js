import mongoose from "mongoose";
import { env } from "@/lib/env";

const MONGO_URI = env.MONGO_URI; // Changed to match .env file

if (!MONGO_URI) {
  throw new Error("❌ MongoDB URI not set in .env");
}
// Global caching to avoid re-opening connections in dev
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: "lms",
      bufferCommands: false,
    });
  }

    cached.conn = await cached.promise;
    console.log("✅ Connected to MongoDB");
  return cached.conn;
}
