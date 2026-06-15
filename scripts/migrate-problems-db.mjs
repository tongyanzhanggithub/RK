// Migrate the Problem table to hold full troubleshooting content, then seed
// it from data/problems.ts. Idempotent and re-runnable.
// Run: node scripts/migrate-problems-db.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { problems } = await import(pathToFileURL(path.join(__dirname, "..", "data", "problems.ts")).href);

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS Problem (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'moderate',
    timeEstimate TEXT NOT NULL DEFAULT '',
    videoUrl TEXT,
    commonCauses TEXT NOT NULL DEFAULT '[]',
    checkSteps TEXT NOT NULL DEFAULT '[]',
    toolsNeeded TEXT NOT NULL DEFAULT '[]',
    recommendedProductSlugs TEXT NOT NULL DEFAULT '[]',
    affectedModels TEXT NOT NULL DEFAULT '[]',
    decisionTree TEXT,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add any missing columns for pre-existing minimal Problem tables.
const existing = db.prepare("PRAGMA table_info(Problem)").all().map((c) => c.name);
const adds = [
  ["difficulty", "TEXT NOT NULL DEFAULT 'moderate'"],
  ["timeEstimate", "TEXT NOT NULL DEFAULT ''"],
  ["videoUrl", "TEXT"],
  ["commonCauses", "TEXT NOT NULL DEFAULT '[]'"],
  ["checkSteps", "TEXT NOT NULL DEFAULT '[]'"],
  ["toolsNeeded", "TEXT NOT NULL DEFAULT '[]'"],
  ["recommendedProductSlugs", "TEXT NOT NULL DEFAULT '[]'"],
  ["affectedModels", "TEXT NOT NULL DEFAULT '[]'"],
  ["decisionTree", "TEXT"],
  ["status", "TEXT NOT NULL DEFAULT 'PUBLISHED'"],
  ["sortOrder", "INTEGER NOT NULL DEFAULT 0"],
  // SQLite forbids a non-constant default (CURRENT_TIMESTAMP) in ALTER ADD COLUMN.
  ["updatedAt", "DATETIME"]
];
for (const [name, def] of adds) {
  if (!existing.includes(name)) {
    db.exec(`ALTER TABLE Problem ADD COLUMN ${name} ${def}`);
    console.log(`Added Problem.${name}`);
  }
}

// Backfill any rows left with a NULL updatedAt by earlier phases.
db.exec("UPDATE Problem SET updatedAt = createdAt WHERE updatedAt IS NULL");

const now = new Date().toISOString();
// Upsert by slug so pre-existing minimal rows get the full content too.
const upsert = db.prepare(`
  INSERT INTO Problem (id, slug, title, description, difficulty, timeEstimate, videoUrl,
    commonCauses, checkSteps, toolsNeeded, recommendedProductSlugs, affectedModels,
    decisionTree, status, sortOrder, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    difficulty = excluded.difficulty,
    timeEstimate = excluded.timeEstimate,
    videoUrl = excluded.videoUrl,
    commonCauses = excluded.commonCauses,
    checkSteps = excluded.checkSteps,
    toolsNeeded = excluded.toolsNeeded,
    recommendedProductSlugs = excluded.recommendedProductSlugs,
    affectedModels = excluded.affectedModels,
    decisionTree = excluded.decisionTree,
    sortOrder = excluded.sortOrder,
    updatedAt = excluded.updatedAt
`);

let order = 0;
let seeded = 0;
for (const p of problems) {
  const id = `prob_${p.slug.replace(/[^a-z0-9]+/g, "_")}`;
  const result = upsert.run(
    id, p.slug, p.title, p.description, p.difficulty, p.timeEstimate, p.videoUrl || null,
    JSON.stringify(p.commonCauses || []),
    JSON.stringify(p.checkSteps || []),
    JSON.stringify(p.toolsNeeded || []),
    JSON.stringify(p.recommendedProductSlugs || []),
    JSON.stringify(p.affectedModels || []),
    p.decisionTree ? JSON.stringify(p.decisionTree) : null,
    order, now, now
  );
  if (result.changes > 0) seeded += 1;
  order += 10;
}

const total = db.prepare("SELECT COUNT(*) AS n FROM Problem").get().n;
console.log(`Seeded ${seeded} new problems. Total in DB: ${total}.`);
db.close();
