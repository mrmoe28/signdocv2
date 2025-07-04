const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTempUser() {
  try {
    const hashedPassword = await bcrypt.hash("temp123", 12);

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@ekosolar.com" },
    });

    if (existingUser) {
      console.log("Admin user already exists:", existingUser.email);
      return;
    }

    // Create admin user with Prisma
    const result = await prisma.user.create({
      data: {
        id: "admin-user-123",
        email: "admin@ekosolar.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
        isVerified: true,
        company: "EKO Solar",
        firstName: "Admin",
        lastName: "User",
      },
    });

    console.log("✅ Admin user created successfully:", {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
    });
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

createTempUser();
