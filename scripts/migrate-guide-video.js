// One-off migration: add videoUrl column to RepairGuide.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

const columns = db.prepare("PRAGMA table_info(RepairGuide)").all().map((c) => c.name);
if (!columns.includes("videoUrl")) {
  db.exec("ALTER TABLE RepairGuide ADD COLUMN videoUrl TEXT");
  console.log("Added RepairGuide.videoUrl");
}

console.log("Migration complete.");
db.close();
