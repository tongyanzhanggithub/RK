const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.");
  console.error("Example: $env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PASSWORD='ChangeMe123!'; npm run admin:create");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

function hashPassword(rawPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(rawPassword, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

async function main() {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    update: { name, passwordHash, role: "ADMIN" },
    create: { email: normalizedEmail, name, passwordHash, role: "ADMIN" }
  });

  console.log(`Upserted ADMIN user: ${user.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
