// Test file to debug environment issues
console.log("🔍 Testing environment variables...");

// Check if environment variables are being loaded
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);

// Check where Next.js is looking for env files
console.log("Current working directory:", process.cwd());

// Try importing the env file
try {
  const { env } = await import("./env.js");
  console.log("✅ Environment validation passed!");
  console.log("Loaded NODE_ENV:", env.NODE_ENV);
} catch (error) {
  console.error("❌ Environment validation failed:");
  console.error(error.message);
  console.error(error.stack);
}
