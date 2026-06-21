// Rebuild the category taxonomy around part SYSTEMS (engines + all auto parts),
// with EN/ZH/AR/RU names, remap existing products, and remove the old kit-only
// categories. Idempotent — safe to re-run.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "complete-engines", name: "Complete Engines", nameZh: "整机", nameAr: "محركات كاملة", nameRu: "Двигатели в сборе" },
  { slug: "engine-parts", name: "Engine Parts", nameZh: "发动机配件", nameAr: "قطع غيار المحرك", nameRu: "Запчасти двигателя" },
  { slug: "fuel-system", name: "Fuel System", nameZh: "燃油系统", nameAr: "نظام الوقود", nameRu: "Топливная система" },
  { slug: "ignition-electrical", name: "Ignition & Electrical", nameZh: "点火/电气", nameAr: "الإشعال والكهرباء", nameRu: "Зажигание и электрика" },
  { slug: "drivetrain-clutch", name: "Drivetrain & Clutch", nameZh: "传动/离合", nameAr: "نقل الحركة والقابض", nameRu: "Трансмиссия и сцепление" },
  { slug: "cooling-water-pump", name: "Cooling & Water Pump", nameZh: "冷却/水泵", nameAr: "التبريد ومضخة الماء", nameRu: "Охлаждение и водяной насос" },
  { slug: "starter-system", name: "Starter System", nameZh: "启动系统", nameAr: "نظام التشغيل", nameRu: "Система запуска" },
  { slug: "repair-kits", name: "Repair Kits", nameZh: "维修套件", nameAr: "أطقم الإصلاح", nameRu: "Ремкомплекты" },
  { slug: "tools-consumables", name: "Tools & Consumables", nameZh: "工具耗材", nameAr: "الأدوات والمستهلكات", nameRu: "Инструменты и расходники" },
  { slug: "universal-parts", name: "Universal Parts", nameZh: "通用件", nameAr: "قطع عالمية", nameRu: "Универсальные детали" }
];

// Old category name → new canonical category name (products store category by name).
const REMAP = {
  "Fuel System Kit": "Fuel System",
  "Generator Repair Kit": "Repair Kits",
  "Maintenance Kit": "Repair Kits",
  "Small Engine Repair Kit": "Repair Kits",
  "Starter System Kit": "Starter System",
  "Water Pump Repair Kit": "Cooling & Water Pump"
  // "Universal Parts" already matches a new category — left as-is.
};

async function main() {
  // 1) Upsert the new taxonomy.
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameZh: c.nameZh, nameAr: c.nameAr, nameRu: c.nameRu, sortOrder: (i + 1) * 10, isActive: true },
      create: { slug: c.slug, name: c.name, nameZh: c.nameZh, nameAr: c.nameAr, nameRu: c.nameRu, sortOrder: (i + 1) * 10, isActive: true }
    });
  }
  console.log(`Upserted ${CATEGORIES.length} categories.`);

  // 2) Remap products from old category names to the new taxonomy.
  for (const [oldName, newName] of Object.entries(REMAP)) {
    const res = await prisma.product.updateMany({ where: { category: oldName }, data: { category: newName } });
    if (res.count) console.log(`Remapped ${res.count} product(s): "${oldName}" → "${newName}"`);
  }

  // 3) Remove old categories no longer in the taxonomy.
  const keepSlugs = CATEGORIES.map((c) => c.slug);
  const removed = await prisma.category.deleteMany({ where: { slug: { notIn: keepSlugs } } });
  if (removed.count) console.log(`Removed ${removed.count} obsolete categor(y/ies).`);

  // 4) Report any product whose category doesn't match a category name (needs attention).
  const names = new Set(CATEGORIES.map((c) => c.name));
  const orphans = await prisma.product.findMany({ where: {}, select: { name: true, category: true } });
  const bad = orphans.filter((p) => !names.has(p.category));
  if (bad.length) console.log("⚠ products with unmatched category:", bad.map((p) => `${p.name} → ${p.category}`).join("; "));
  else console.log("All products map to a category. ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
