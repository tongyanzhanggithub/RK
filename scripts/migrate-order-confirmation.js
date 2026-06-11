// One-off migration: add confirmation-email tracking column to Order.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

const columns = db.prepare("PRAGMA table_info('Order')").all().map((column) => column.name);

if (!columns.includes("confirmationEmailSentAt")) {
  db.exec("ALTER TABLE 'Order' ADD COLUMN confirmationEmailSentAt DATETIME");
  console.log("Added Order.confirmationEmailSentAt");
}

console.log("Migration complete.");
db.close();
