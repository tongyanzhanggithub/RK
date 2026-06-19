// One-off migration: add fitmentType/fitmentNote columns and seed the demo
// universal product without wiping existing orders/customers.
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "..", "prisma", "dev.db"));

const columns = db.prepare("PRAGMA table_info(Product)").all().map((column) => column.name);
if (!columns.includes("fitmentType")) {
  db.exec("ALTER TABLE Product ADD COLUMN fitmentType TEXT NOT NULL DEFAULT 'SPECIFIC';");
  console.log("Added column fitmentType");
}
if (!columns.includes("fitmentNote")) {
  db.exec("ALTER TABLE Product ADD COLUMN fitmentNote TEXT;");
  console.log("Added column fitmentNote");
}

const existing = db.prepare("SELECT id FROM Product WHERE slug = ?").get("universal-fuel-line-clamp-kit");
if (!existing) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO Product (
      id, slug, name, sku, category, brand, shortDescription, description, status,
      priceRange, priceCents, currency, wholesalePriceCents, costPriceCents,
      allowCoupons, stock, lowStockThreshold, wholesaleAvailable, isFeatured, isHotSeller,
      fitmentType, fitmentNote,
      tags, compatibleModels, compatibleEquipment, problemsSolved, kitIncludes,
      seoTitle, seoDescription, seoKeywords, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `product_${crypto.randomBytes(8).toString("hex")}`,
    "universal-fuel-line-clamp-kit",
    "Universal Fuel Line & Clamp Kit",
    "RK-UNI-FUEL-01",
    "Universal Parts",
    "Partavio",
    "Universal fuel hose, inline fuel filters and spring clamps that fit nearly every small gasoline engine in the field.",
    "Universal fuel hose, inline fuel filters and spring clamps that fit nearly every small gasoline engine in the field.",
    "ACTIVE",
    "USD 6.90-9.90",
    790,
    "usd",
    490,
    430,
    1,
    120,
    10,
    1,
    0,
    0,
    "UNIVERSAL",
    "Fits engines using 4.5mm or 5.5mm inner-diameter fuel line",
    JSON.stringify(["Universal", "Fuel System", "Workshop Stock"]),
    JSON.stringify([]),
    JSON.stringify(["Portable generator", "Gasoline water pump", "Tiller", "Sprayer", "Lawn & garden machine"]),
    JSON.stringify(["Poor fuel flow", "Engine won't start", "Engine runs rough"]),
    JSON.stringify(["1m fuel hose 4.5mm", "1m fuel hose 5.5mm", "4 inline fuel filters", "10 spring clamps"]),
    "Universal Fuel Line & Clamp Kit",
    "Universal fuel hose, filters and clamps for all small gasoline engines.",
    "universal fuel line, fuel filter, spring clamp",
    now,
    now
  );
  console.log("Inserted universal-fuel-line-clamp-kit");
} else {
  console.log("universal-fuel-line-clamp-kit already exists");
}

console.log("Migration done.");
