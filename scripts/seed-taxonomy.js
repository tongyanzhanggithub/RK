// Seed Category / RepairGuide from existing data (idempotent, re-runnable)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const GUIDES = [
  { slug: "why-small-engine-wont-start", title: "Why your small engine won't start", excerpt: "Common no-start causes on 168F / GX160 engines and the parts that fix them." },
  { slug: "generator-maintenance-checklist", title: "Portable generator maintenance checklist", excerpt: "Seasonal service steps and spare parts for 2–5kW generators." },
  { slug: "replace-recoil-starter", title: "How to replace a recoil (pull) starter", excerpt: "Step-by-step recoil starter replacement for small engines." },
  { slug: "fix-leaking-water-pump", title: "Fixing a leaking gasoline water pump", excerpt: "Seal kit replacement for 2\" / 3\" pumps with leakage or weak suction." }
];

async function main() {
  // 1) Categories: distinct product.category values
  const groups = await prisma.product.groupBy({ by: ["category"] });
  const names = groups.map((g) => g.category).filter(Boolean).sort();
  let order = 0;
  for (const name of names) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name, sortOrder: order, isActive: true }
    });
    order += 10;
  }
  console.log(`Categories upserted: ${names.length}`);

  // 2) Repair guides
  for (const g of GUIDES) {
    await prisma.repairGuide.upsert({
      where: { slug: g.slug },
      update: {},
      create: { slug: g.slug, title: g.title, excerpt: g.excerpt, status: "DRAFT" }
    });
  }
  console.log(`Repair guides upserted: ${GUIDES.length}`);

  const [cCount, gCount] = await Promise.all([prisma.category.count(), prisma.repairGuide.count()]);
  console.log(`Now: ${cCount} categories, ${gCount} guides`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
