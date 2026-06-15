// One-off migration: add qualification columns to WholesaleApplication.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

const columns = db.prepare("PRAGMA table_info(WholesaleApplication)").all().map((c) => c.name);
const adds = [
  ["website", "TEXT"],
  ["businessAddress", "TEXT"],
  ["salesChannel", "TEXT"]
];

for (const [name, def] of adds) {
  if (!columns.includes(name)) {
    db.exec(`ALTER TABLE WholesaleApplication ADD COLUMN ${name} ${def}`);
    console.log(`Added WholesaleApplication.${name}`);
  }
}

console.log("Migration complete.");
db.close();
