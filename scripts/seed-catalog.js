// Rebuild the category taxonomy around part SYSTEMS (engines + all auto parts),
// with EN/ZH/AR/RU names, short descriptions (for category landing-page SEO),
// a few example sub-categories (two-level), remap existing products, and remove
// the old kit-only categories. Idempotent — safe to re-run.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Top-level part systems.
const TOP = [
  { slug: "complete-engines", name: "Complete Engines", nameZh: "整机", nameAr: "محركات كاملة", nameRu: "Двигатели в сборе", description: "Complete small-engine and general-purpose engines, GX-series and clones — drop-in power for generators, pumps and machinery." },
  { slug: "engine-parts", name: "Engine Parts", nameZh: "发动机配件", nameAr: "قطع غيار المحرك", nameRu: "Запчасти двигателя", description: "Pistons, valves, crankshafts, gaskets and core engine components." },
  { slug: "fuel-system", name: "Fuel System", nameZh: "燃油系统", nameAr: "نظام الوقود", nameRu: "Топливная система", description: "Carburetors, fuel pumps, filters and fuel-line parts." },
  { slug: "ignition-electrical", name: "Ignition & Electrical", nameZh: "点火/电气", nameAr: "الإشعال والكهرباء", nameRu: "Зажигание и электрика", description: "Spark plugs, ignition coils, stators and electrical parts." },
  { slug: "drivetrain-clutch", name: "Drivetrain & Clutch", nameZh: "传动/离合", nameAr: "نقل الحركة والقابض", nameRu: "Трансмиссия и сцепление", description: "Clutches, pulleys, belts and power-transmission parts." },
  { slug: "cooling-water-pump", name: "Cooling & Water Pump", nameZh: "冷却/水泵", nameAr: "التبريد ومضخة الماء", nameRu: "Охлаждение и водяной насос", description: "Water-pump seals, impellers and cooling components." },
  { slug: "starter-system", name: "Starter System", nameZh: "启动系统", nameAr: "نظام التشغيل", nameRu: "Система запуска", description: "Recoil starters, electric starters and starting components." },
  { slug: "repair-kits", name: "Repair Kits", nameZh: "维修套件", nameAr: "أطقم الإصلاح", nameRu: "Ремкомплекты", description: "Curated repair and maintenance kits assembled around real field failures." },
  { slug: "tools-consumables", name: "Tools & Consumables", nameZh: "工具耗材", nameAr: "الأدوات والمستهلكات", nameRu: "Инструменты и расходники", description: "Workshop tools, lubricants and consumables." },
  { slug: "universal-parts", name: "Universal Parts", nameZh: "通用件", nameAr: "قطع عالمية", nameRu: "Универсальные детали", description: "Parts that fit nearly all small engines and machines." }
];

// Example sub-categories (two-level). Owner can add/rename/remove in the admin.
const SUB = [
  { parent: "engine-parts", slug: "pistons-rings", name: "Pistons & Rings", nameZh: "活塞与活塞环", nameAr: "المكابس والحلقات", nameRu: "Поршни и кольца" },
  { parent: "engine-parts", slug: "valves", name: "Valves", nameZh: "气门组", nameAr: "الصمامات", nameRu: "Клапаны" },
  { parent: "engine-parts", slug: "gaskets", name: "Gaskets", nameZh: "垫片", nameAr: "الحشيات", nameRu: "Прокладки" },
  { parent: "fuel-system", slug: "carburetors", name: "Carburetors", nameZh: "化油器", nameAr: "المكربنات", nameRu: "Карбюраторы" },
  { parent: "fuel-system", slug: "fuel-pumps", name: "Fuel Pumps", nameZh: "油泵", nameAr: "مضخات الوقود", nameRu: "Топливные насосы" },
  { parent: "ignition-electrical", slug: "spark-plugs", name: "Spark Plugs", nameZh: "火花塞", nameAr: "شمعات الإشعال", nameRu: "Свечи зажигания" },
  { parent: "ignition-electrical", slug: "ignition-coils", name: "Ignition Coils", nameZh: "点火线圈", nameAr: "ملفات الإشعال", nameRu: "Катушки зажигания" }
];

const REMAP = {
  "Fuel System Kit": "Fuel System",
  "Generator Repair Kit": "Repair Kits",
  "Maintenance Kit": "Repair Kits",
  "Small Engine Repair Kit": "Repair Kits",
  "Starter System Kit": "Starter System",
  "Water Pump Repair Kit": "Cooling & Water Pump"
};

async function main() {
  // 1) Top-level categories.
  const idBySlug = {};
  for (let i = 0; i < TOP.length; i++) {
    const c = TOP[i];
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameZh: c.nameZh, nameAr: c.nameAr, nameRu: c.nameRu, description: c.description, parentId: null, sortOrder: (i + 1) * 10, isActive: true },
      create: { slug: c.slug, name: c.name, nameZh: c.nameZh, nameAr: c.nameAr, nameRu: c.nameRu, description: c.description, sortOrder: (i + 1) * 10, isActive: true }
    });
    idBySlug[c.slug] = row.id;
  }
  console.log(`Upserted ${TOP.length} top-level categories.`);

  // 2) Sub-categories.
  for (let i = 0; i < SUB.length; i++) {
    const c = SUB[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameZh: c.nameZh, nameAr: c.nameAr, nameRu: c.nameRu, parentId: idBySlug[c.parent] || null, sortOrder: (i + 1) * 10, isActive: true },
      create: { slug: c.slug, name: c.name, nameZh: c.nameZh, nameAr: c.nameAr, nameRu: c.nameRu, parentId: idBySlug[c.parent] || null, sortOrder: (i + 1) * 10, isActive: true }
    });
  }
  console.log(`Upserted ${SUB.length} sub-categories.`);

  // 3) Remap products from old categories to the new taxonomy.
  for (const [oldName, newName] of Object.entries(REMAP)) {
    const res = await prisma.product.updateMany({ where: { category: oldName }, data: { category: newName } });
    if (res.count) console.log(`Remapped ${res.count} product(s): "${oldName}" → "${newName}"`);
  }

  // 4) Remove categories no longer in the taxonomy.
  const keep = [...TOP, ...SUB].map((c) => c.slug);
  const removed = await prisma.category.deleteMany({ where: { slug: { notIn: keep } } });
  if (removed.count) console.log(`Removed ${removed.count} obsolete categor(y/ies).`);

  const names = new Set([...TOP, ...SUB].map((c) => c.name));
  const bad = (await prisma.product.findMany({ select: { name: true, category: true } })).filter((p) => !names.has(p.category));
  console.log(bad.length ? "⚠ unmatched: " + bad.map((p) => `${p.name}→${p.category}`).join("; ") : "All products map to a category. ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
