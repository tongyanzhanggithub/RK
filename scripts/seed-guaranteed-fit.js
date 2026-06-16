// Enroll verified specific parts into Guaranteed Fit (idempotent).
// Eligible = SPECIFIC fitment with at least one compatible model listed.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const products = await prisma.product.findMany({
    select: { id: true, sku: true, fitmentType: true, compatibleModels: true, fitmentGuaranteed: true }
  });
  let enrolled = 0;
  for (const p of products) {
    let models = [];
    try { models = JSON.parse(p.compatibleModels || "[]"); } catch {}
    const eligible = p.fitmentType !== "UNIVERSAL" && Array.isArray(models) && models.length > 0;
    if (eligible && !p.fitmentGuaranteed) {
      await prisma.product.update({ where: { id: p.id }, data: { fitmentGuaranteed: true } });
      enrolled += 1;
    }
  }
  const total = await prisma.product.count({ where: { fitmentGuaranteed: true } });
  console.log(`Newly enrolled: ${enrolled}. Guaranteed Fit total: ${total}.`);
  await prisma.$disconnect();
})();
