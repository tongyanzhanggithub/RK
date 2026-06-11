// One-off migration: Order.shippingEmailSentAt + Testimonial table.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

const orderColumns = db.prepare("PRAGMA table_info('Order')").all().map((column) => column.name);
if (!orderColumns.includes("shippingEmailSentAt")) {
  db.exec("ALTER TABLE 'Order' ADD COLUMN shippingEmailSentAt DATETIME");
  console.log("Added Order.shippingEmailSentAt");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS Testimonial (
    id TEXT PRIMARY KEY,
    authorName TEXT NOT NULL,
    company TEXT,
    country TEXT NOT NULL,
    content TEXT NOT NULL,
    contentZh TEXT,
    rating INTEGER NOT NULL DEFAULT 5,
    isPublished INTEGER NOT NULL DEFAULT 0,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
  );
`);
console.log("Ensured Testimonial table");

console.log("Migration complete.");
db.close();
