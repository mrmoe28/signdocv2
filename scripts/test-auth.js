const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log("🔧 Testing authentication system...");

    // Check if we can connect to the database
    console.log("📊 Checking database connection...");
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Total users: ${userCount}`);

    // Check if we can create a test user
    console.log("👤 Creating test user...");
    const testUser = await prisma.user.create({
      data: {
        id: nanoid(),
        email: "test@example.com",
        name: "Test User",
        password: "", // Stack Auth handles passwords
        role: "user",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Test user created: ${testUser.email} (ID: ${testUser.id})`);

    // Test customer creation for the user
    console.log("🏢 Testing customer creation...");
    const testCustomer = await prisma.customer.create({
      data: {
        id: nanoid(),
        name: "Test Customer",
        email: "customer@example.com",
        phone: "555-1234",
        company: "Test Company",
        customerType: "residential",
        notifyByEmail: true,
        notifyBySmsText: false,
        userId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(
      `✅ Test customer created: ${testCustomer.email} (ID: ${testCustomer.id})`
    );

    // Clean up test data
    console.log("🧹 Cleaning up test data...");
    await prisma.customer.delete({ where: { id: testCustomer.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("✅ Test data cleaned up");

    console.log("🎉 Authentication system test completed successfully!");
  } catch (error) {
    console.error("❌ Authentication test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
