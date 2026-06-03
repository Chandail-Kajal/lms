const { PrismaClient, UserRole } = require("../src/generated/prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@lms.com",
      mobileNumber: "9999999991",
      password: passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
    },
    {
      name: "John Instructor",
      email: "instructor@lms.com",
      mobileNumber: "9999999992",
      password: passwordHash,
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
    },
    {
      name: "Jane Student",
      email: "student1@lms.com",
      mobileNumber: "9999999993",
      password: passwordHash,
      role: UserRole.STUDENT,
      emailVerified: true,
    },
    {
      name: "Mike Student",
      email: "student2@lms.com",
      mobileNumber: "9999999994",
      password: passwordHash,
      role: UserRole.STUDENT,
      emailVerified: true,
    },
    {
      name: "Sarah Student",
      email: "student3@lms.com",
      mobileNumber: "9999999995",
      password: passwordHash,
      role: UserRole.STUDENT,
      emailVerified: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: user,
    });
  }

  console.log("✅ Users seeded successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
