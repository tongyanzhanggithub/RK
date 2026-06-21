// Seed one sample COMPLETE ENGINE into the "Complete Engines" category as a
// template. Idempotent (upsert by slug). Edit or delete it from the admin.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SLUG = "gx200-65hp-gasoline-engine";
const PRICE = 89.0;

const data = {
  name: "GX200 6.5HP General-Purpose Gasoline Engine",
  slug: SLUG,
  subtitle: "196cc air-cooled OHV · GX200-compatible",
  sku: "ENG-GX200-65",
  category: "Complete Engines",
  brand: "Partavio",
  shortDescription:
    "6.5 HP 196cc air-cooled OHV gasoline engine, GX200-compatible — drop-in power for generators, water pumps, tillers and pressure washers.",
  description:
    "A reliable 196cc single-cylinder 4-stroke engine built to the GX200 footprint. Horizontal 19.05mm (3/4\") keyed output shaft, recoil start (electric start optional), low-oil alert. Ideal for OEMs and repair shops re-powering generators, pumps and small machinery.",
  status: "ACTIVE",
  priceRange: `USD ${PRICE.toFixed(2)}`,
  priceCents: Math.round(PRICE * 100),
  currency: "usd",
  compareAtPriceCents: 10900,
  wholesalePriceCents: 7200,
  costPriceCents: null,
  allowCoupons: true,
  stock: 60,
  lowStockThreshold: 10,
  weightGrams: 15000,
  lengthMm: 410,
  widthMm: 330,
  heightMm: 360,
  wholesaleAvailable: true,
  isFeatured: true,
  isHotSeller: true,
  fitmentType: "UNIVERSAL",
  fitmentNote: "GX200-compatible mounting & shaft (also fits 168F-2 clones).",
  fitmentGuaranteed: false,
  tags: JSON.stringify(["6.5 HP", "196cc", "GX200-compatible", "Wholesale"]),
  kitIncludes: JSON.stringify([
    "1 × GX200 complete engine",
    "Air filter assembly",
    "Muffler & spark plug fitted",
    "User manual"
  ]),
  compatibleModels: JSON.stringify(["GX200", "168F-2"]),
  compatibleEquipment: JSON.stringify(["Generators", "Water pumps", "Tillers", "Pressure washers", "Go-karts"]),
  problemsSolved: JSON.stringify([]),
  notCompatibleWith: JSON.stringify([]),
  specifications: JSON.stringify([
    { label: "Displacement", value: "196 cc" },
    { label: "Max power", value: "6.5 HP / 4.0 kW @ 3600 rpm" },
    { label: "Engine type", value: "Single-cylinder, 4-stroke, air-cooled OHV" },
    { label: "Bore × Stroke", value: "68 × 54 mm" },
    { label: "Fuel", value: "Unleaded gasoline" },
    { label: "Fuel tank", value: "3.6 L" },
    { label: "Start", value: "Recoil (electric optional)" },
    { label: "Output shaft", value: '19.05 mm (3/4") keyed, horizontal' },
    { label: "Net weight", value: "15 kg" }
  ]),
  faqs: JSON.stringify([
    { question: "Does it fit a GX200 mounting?", answer: "Yes — bolt pattern and output shaft are GX200-compatible, and it also fits 168F-2 clones." },
    { question: "Recoil or electric start?", answer: "Standard is recoil start; an electric-start version is available on request." }
  ]),
  image: null,
  images: JSON.stringify([]),
  seoTitle: "GX200 6.5HP Gasoline Engine — Factory Direct | Partavio",
  seoDescription: "Wholesale 196cc GX200-compatible 6.5HP gasoline engine for generators, pumps and small machinery. Factory-direct from China.",
  seoKeywords: "GX200 engine, 196cc engine, 6.5hp gasoline engine, complete engine wholesale",
  ogImage: null
};

async function main() {
  const existing = await prisma.product.findUnique({ where: { slug: SLUG } });
  if (existing) {
    await prisma.product.update({ where: { slug: SLUG }, data: { ...data, updatedAt: new Date() } });
    console.log("Updated sample engine:", data.name);
    return;
  }
  const created = await prisma.product.create({ data: { ...data, createdAt: new Date(), updatedAt: new Date() } });
  await prisma.inventoryAdjustment.create({
    data: {
      productId: created.id,
      type: "INITIAL",
      quantityDelta: created.stock,
      stockBefore: 0,
      stockAfter: created.stock,
      reason: "Sample engine seed",
      reference: "SEED_SAMPLE_ENGINE",
      createdBy: "seed"
    }
  });
  console.log("Created sample engine:", data.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
