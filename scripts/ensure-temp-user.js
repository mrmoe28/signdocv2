const { config } = require("dotenv");
const path = require("path");

// Load environment variables
config({ path: path.join(__dirname, "..", ".env.local") });
config({ path: path.join(__dirname, "..", ".env") });

// Import after loading env vars
const { db } = require("../src/lib/drizzle-db.ts");
const { users } = require("../src/lib/schema.ts");
const { eq } = require("drizzle-orm");

async function ensureTempUser() {
  try {
    console.log("🔍 Checking for existing temp user...");

    // First, try to find existing temp user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, "temp-user-123"))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ Temp user already exists:", existingUser[0].email);
      return existingUser[0];
    }

    console.log("🔍 Checking for admin user...");

    // Try to find admin user
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@ekosolar.com"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("✅ Admin user found, will use as fallback");
      return existingAdmin[0];
    }

    console.log("🔍 Checking for any existing user...");

    // Try to find any existing user
    const anyUser = await db.select().from(users).limit(1);

    if (anyUser.length > 0) {
      console.log(
        "✅ Found existing user, will use as fallback:",
        anyUser[0].email
      );
      return anyUser[0];
    }

    console.log("🆕 Creating new temp user...");

    // Create temp user with specific ID for backwards compatibility
    const newUser = await db
      .insert(users)
      .values({
        id: "temp-user-123", // Use specific ID for temp user
        email: "temp@localhost.dev",
        name: "Temporary User",
        firstName: "Temp",
        lastName: "User",
        company: "Dev Environment",
        phone: "(555) 000-0000",
        address: "123 Dev Street",
        city: "Development",
        state: "CA",
        zipCode: "00000",
      })
      .returning();

    console.log("✅ Temporary user created successfully:", newUser[0].email);
    return newUser[0];
  } catch (error) {
    console.error("❌ Error ensuring temp user:", error.message);

    // If there's a unique constraint error, try to find any existing user
    try {
      const anyUser = await db.select().from(users).limit(1);

      if (anyUser.length > 0) {
        console.log("✅ Found existing user, will use as fallback");
        return anyUser[0];
      }
    } catch (findError) {
      console.error("❌ Error finding existing users:", findError.message);
    }

    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  ensureTempUser()
    .then(() => {
      console.log("✅ User setup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ User setup failed:", error.message);
      process.exit(1);
    });
}

module.exports = { ensureTempUser };
