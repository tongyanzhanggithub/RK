const crypto = require("crypto");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

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

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

function hashPassword(rawPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(rawPassword, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

function createTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS AdminUser (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}

function id() {
  return `admin_${crypto.randomBytes(8).toString("hex")}`;
}

createTable();

const now = new Date().toISOString();
const existing = db.prepare("SELECT id FROM AdminUser WHERE email = ?").get(email.toLowerCase());

if (existing) {
  db.prepare("UPDATE AdminUser SET name = ?, passwordHash = ?, role = 'ADMIN', updatedAt = ? WHERE id = ?").run(
    name,
    hashPassword(password),
    now,
    existing.id
  );
  console.log(`Updated ADMIN user: ${email.toLowerCase()}`);
} else {
  db.prepare("INSERT INTO AdminUser (id, email, name, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'ADMIN', ?, ?)").run(
    id(),
    email.toLowerCase(),
    name,
    hashPassword(password),
    now,
    now
  );
  console.log(`Created ADMIN user: ${email.toLowerCase()}`);
}

db.close();
