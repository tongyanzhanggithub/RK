// One-off migration: add password-reset token columns to AdminUser.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

const columns = db.prepare("PRAGMA table_info(AdminUser)").all().map((column) => column.name);

if (!columns.includes("resetTokenHash")) {
  db.exec("ALTER TABLE AdminUser ADD COLUMN resetTokenHash TEXT");
  console.log("Added AdminUser.resetTokenHash");
}
if (!columns.includes("resetTokenExpiresAt")) {
  db.exec("ALTER TABLE AdminUser ADD COLUMN resetTokenExpiresAt DATETIME");
  console.log("Added AdminUser.resetTokenExpiresAt");
}

console.log("Migration complete.");
db.close();
