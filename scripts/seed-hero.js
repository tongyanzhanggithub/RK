// 把首页现有的 3 张默认轮播导入 HeroSlide 表(幂等:仅当表为空时插入)。
// 线上首次启用后台编辑 hero 时,在服务器跑一次:node scripts/seed-hero.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const slides = [
  {
    badge: "Factory-direct B2B supplier",
    title: "Wholesale Auto Parts & Complete Engines — Direct From China",
    subtitle:
      "Auto parts, engine spares, repair kits and complete 168F / GX160-style engines for repair shops, distributors and dealers across the Middle East, Central Asia and Southeast Asia. Factory pricing, low MOQ, OEM welcome.",
    primaryLabel: "Get Wholesale Quote",
    primaryHref: "/wholesale",
    primaryWhatsapp: true,
    secondaryLabel: "Browse Catalog",
    secondaryHref: "/products",
    panelTitle: "Why buyers source from us",
    bullets: [
      "Factory-direct pricing — no middleman markup",
      "Low MOQ and mixed-carton trial orders",
      "OEM / private-label packaging available",
      "Sea & rail freight + T/T payment terms"
    ]
  },
  {
    badge: "Shop by your engine",
    title: "Find the exact part that fits — 168F, GX160, water pumps",
    subtitle: "Pick your engine and see only confirmed-fit parts. No more guesswork or wrong orders.",
    primaryLabel: "Find my parts",
    primaryHref: "/products",
    secondaryLabel: "All engine models",
    secondaryHref: "/engines",
    panelTitle: "Fitment you can trust",
    bullets: ["Confirmed-fit badge on every part", "Save your machines in My Garage", "Free fitment check on WhatsApp"]
  },
  {
    badge: "OEM & private label",
    title: "Your brand, our factory — custom packaging & kitting",
    subtitle: "Private-label boxes, custom carton mixes and OEM production built for your local market.",
    primaryLabel: "Become a Distributor",
    primaryHref: "/wholesale",
    secondaryLabel: "Browse Catalog",
    secondaryHref: "/products",
    panelTitle: "Built for distributors",
    bullets: ["Low MOQ, mixed-carton trial orders", "Sea & rail freight + T/T payment terms", "Full export documentation"]
  }
];

async function main() {
  const existing = await prisma.heroSlide.count();
  if (existing > 0) {
    console.log(`HeroSlide 已有 ${existing} 条,跳过(不覆盖你的编辑)。`);
    return;
  }
  await prisma.heroSlide.createMany({
    data: slides.map((s, i) => ({
      badge: s.badge,
      title: s.title,
      subtitle: s.subtitle,
      primaryLabel: s.primaryLabel,
      primaryHref: s.primaryHref,
      primaryExternal: false,
      primaryWhatsapp: Boolean(s.primaryWhatsapp),
      secondaryLabel: s.secondaryLabel || null,
      secondaryHref: s.secondaryHref || null,
      panelTitle: s.panelTitle,
      bullets: JSON.stringify(s.bullets),
      sortOrder: i,
      isActive: true
    }))
  });
  console.log(`已导入 ${slides.length} 张默认 hero 幻灯片。`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
