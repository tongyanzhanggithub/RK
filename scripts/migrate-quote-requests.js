// One-off migration: create the QuoteRequest table.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS QuoteRequest (
    id TEXT PRIMARY KEY,
    contactName TEXT NOT NULL,
    company TEXT,
    country TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    items TEXT NOT NULL,
    itemCount INTEGER NOT NULL DEFAULT 0,
    totalQuantity INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW',
    adminNote TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS QuoteRequest_status_idx ON QuoteRequest(status);
  CREATE INDEX IF NOT EXISTS QuoteRequest_createdAt_idx ON QuoteRequest(createdAt);
`);

console.log("Ensured QuoteRequest table.");
db.close();
