// One-off: seed demo data to manually verify the marketing features locally.
// Safe to re-run (idempotent upserts). Not used in production.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // ① Announcement bar + ⑤ popup settings
  const settings = {
    announcement: "限时促销进行中 — 全场精选件最高直降 30%,本周内有效 🚚",
    announcement_link: "/promo/summer-sale",
    popup_enabled: "on",
    popup_title: "拿批发底价 & 到货提醒",
    popup_body: "留下邮箱,第一时间收到批发优惠与新品到货。",
    popup_delay_seconds: "3"
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  // ② Flash sale + ③ featured/hot — apply to the first few active products
  const products = await prisma.product.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" }, take: 4 });
  if (products.length === 0) {
    console.log("⚠ 没有 ACTIVE 商品,跳过促销/精选演示数据。");
  } else {
    const now = Date.now();
    const start = new Date(now - 60 * 60 * 1000); // 1h ago
    const end = new Date(now + 2 * 24 * 60 * 60 * 1000); // +2 days
    const p0 = products[0];
    await prisma.product.update({
      where: { id: p0.id },
      data: {
        salePriceCents: Math.round(p0.priceCents * 0.7),
        saleStartsAt: start,
        saleEndsAt: end,
        compareAtPriceCents: p0.compareAtPriceCents ?? p0.priceCents,
        isFeatured: true,
        isHotSeller: true
      }
    });
    console.log(`② 促销商品: ${p0.name}  ${(p0.priceCents / 100).toFixed(2)} → ${((p0.priceCents * 0.7) / 100).toFixed(2)} (至 ${end.toISOString()})`);
    for (const p of products.slice(1, 3)) {
      await prisma.product.update({ where: { id: p.id }, data: { isFeatured: true } });
      console.log(`③ 精选: ${p.name}`);
    }
  }

  // ⑥ Campaign landing page
  const slugs = products.slice(0, 3).map((p) => p.slug);
  await prisma.campaign.upsert({
    where: { slug: "summer-sale" },
    create: {
      slug: "summer-sale",
      title: "夏季限时促销",
      subtitle: "精选小型发动机维修件 — 本周直降,售完即止",
      bodyHtml: "<p>整机与维修套件同步参与。批发客户可叠加阶梯价,欢迎询盘。</p>",
      productSlugs: JSON.stringify(slugs),
      ctaLabel: "立即选购",
      ctaHref: "/products",
      isActive: true,
      seoTitle: "夏季限时促销 | Partavio",
      seoDescription: "小型发动机维修件夏季促销,最高直降 30%。"
    },
    update: { isActive: true, productSlugs: JSON.stringify(slugs) }
  });
  console.log("⑥ 活动页: /promo/summer-sale");

  // ④ One subscriber so the admin list isn't empty
  await prisma.newsletterSubscriber.upsert({
    where: { email: "demo-buyer@example.com" },
    create: { email: "demo-buyer@example.com", name: "Demo Buyer", source: "footer" },
    update: {}
  });
  console.log("④ 订阅者: demo-buyer@example.com");

  console.log("\n✅ 演示数据已就绪。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
