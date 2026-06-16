// One-off migration: add passwordHash column to Customer for storefront login.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));
const columns = db.prepare("PRAGMA table_info(Customer)").all().map((c) => c.name);
if (!columns.includes("passwordHash")) {
  db.exec("ALTER TABLE Customer ADD COLUMN passwordHash TEXT");
  console.log("Added Customer.passwordHash");
}
console.log("Migration complete.");
db.close();
