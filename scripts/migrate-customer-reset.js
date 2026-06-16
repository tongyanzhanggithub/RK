// One-off migration: add password-reset token columns to Customer.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));
const columns = db.prepare("PRAGMA table_info(Customer)").all().map((c) => c.name);

if (!columns.includes("resetTokenHash")) {
  db.exec("ALTER TABLE Customer ADD COLUMN resetTokenHash TEXT");
  console.log("Added Customer.resetTokenHash");
}
if (!columns.includes("resetTokenExpiresAt")) {
  db.exec("ALTER TABLE Customer ADD COLUMN resetTokenExpiresAt DATETIME");
  console.log("Added Customer.resetTokenExpiresAt");
}
console.log("Migration complete.");
db.close();
