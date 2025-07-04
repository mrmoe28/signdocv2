const { config } = require("dotenv");
const path = require("path");

// Load environment variables
config({ path: path.join(__dirname, ".env.local") });
config({ path: path.join(__dirname, ".env") });

console.log("Database URL:", process.env.DATABASE_URL ? "Set" : "Not set");

// Test database connection
async function testDatabase() {
  try {
    const { db } = require("./src/lib/drizzle-db.ts");
    const { users } = require("./src/lib/schema.ts");

    console.log("✅ Database modules imported successfully");

    // Test connection by querying users
    const allUsers = await db.select().from(users);
    console.log("✅ Database connection successful");
    console.log("Total users found:", allUsers.length);

    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        name: user.name || "No name",
      });
    });

    return allUsers;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return [];
  }
}

// Run the test
testDatabase()
  .then((users) => {
    console.log("\n✅ Database test completed");
    if (users.length === 0) {
      console.log("⚠️  No users found in database");
    } else {
      console.log("✅ Ready to use existing user:", users[0].id);
    }
  })
  .catch((error) => {
    console.error("❌ Test failed:", error.message);
  });
