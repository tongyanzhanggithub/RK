const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const products = [
  {
    slug: "168f-basic-maintenance-kit",
    name: "168F Basic Maintenance Kit",
    category: "Small Engine Repair Kit",
    shortDescription: "Essential annual service parts for 168F and GX160 style engines used in generators, water pumps, tillers and sprayers.",
    priceRange: "USD 9.90-14.90",
    priceCents: 1290,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Best Seller", "For 168F & GX160", "Maintenance"],
    compatibleModels: ["168F", "GX160 style engine"],
    compatibleEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer"],
    problemsSolved: ["Hard starting", "Poor maintenance", "Dirty air filter", "Weak ignition"],
    kitIncludes: ["Spark plug", "Air filter", "Fuel hose", "Gasket set", "Stop switch"]
  },
  {
    slug: "168f-standard-repair-kit",
    name: "168F Standard Repair Kit",
    category: "Small Engine Repair Kit",
    shortDescription: "Profit-focused repair kit with carburetor, recoil starter and maintenance parts for common 168F engine failures.",
    priceRange: "USD 19.90-29.90",
    priceCents: 2490,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Main Profit Kit", "Wholesale Available", "For 168F"],
    compatibleModels: ["168F", "GX160 style engine"],
    compatibleEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer"],
    problemsSolved: ["Engine won't start", "Pull starter broken", "Poor fuel flow", "Engine runs rough"],
    kitIncludes: ["Carburetor", "Recoil starter", "Spark plug", "Air filter", "Fuel hose", "Gasket set", "Stop switch"]
  },
  {
    slug: "170f-standard-repair-kit",
    name: "170F Standard Repair Kit",
    category: "Small Engine Repair Kit",
    shortDescription: "Standard field repair kit for 170F gasoline engines used in pumps, tillers and small machinery.",
    priceRange: "USD 19.90-29.90",
    priceCents: 2490,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["For 170F", "Repair Shop Choice"],
    compatibleModels: ["170F"],
    compatibleEquipment: ["Gasoline water pump", "Tiller", "Light construction machine"],
    problemsSolved: ["Engine won't start", "Hard starting", "Pull starter broken", "Engine runs rough"],
    kitIncludes: ["Carburetor", "Recoil starter", "Spark plug", "Air filter", "Fuel hose", "Gasket set", "Stop switch"]
  },
  {
    slug: "188f-engine-maintenance-kit",
    name: "188F Engine Maintenance Kit",
    category: "Small Engine Repair Kit",
    shortDescription: "Maintenance kit for larger gasoline engines used on 5kW generators and higher-capacity pumps.",
    priceRange: "USD 24.90-39.90",
    priceCents: 3290,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["For 188F", "5kW Generator", "Larger Pump"],
    compatibleModels: ["188F"],
    compatibleEquipment: ["5kW generator", "Larger water pump", "Small gasoline engine"],
    problemsSolved: ["Hard starting", "Poor maintenance", "Dirty air filter"],
    kitIncludes: ["Spark plug", "Air filter", "Fuel hose", "Gasket set", "Pull rope"]
  },
  {
    slug: "2-inch-water-pump-seal-kit",
    name: "2 Inch Gasoline Water Pump Seal Kit",
    category: "Water Pump Repair Kit",
    shortDescription: "Seal-focused kit for 2 inch gasoline water pumps with leakage or weak suction issues.",
    priceRange: "USD 12.90-19.90",
    priceCents: 1690,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Water Pump Leaking", "2 Inch Pump", "Seal Kit"],
    compatibleModels: ["2 Inch Water Pump"],
    compatibleEquipment: ["Gasoline water pump"],
    problemsSolved: ["Water pump leaking", "Weak suction", "Pump head leakage"],
    kitIncludes: ["Mechanical seal", "O-rings", "Pump gasket", "Filter screen"]
  },
  {
    slug: "2-inch-water-pump-standard-repair-kit",
    name: "2 Inch Gasoline Water Pump Standard Repair Kit",
    category: "Water Pump Repair Kit",
    shortDescription: "Broader 2 inch pump repair kit covering pump seal, connectors and basic engine maintenance parts.",
    priceRange: "USD 19.90-34.90",
    priceCents: 2790,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["2 Inch Pump", "Repair Kit", "Optional Carburetor"],
    compatibleModels: ["2 Inch Water Pump", "168F"],
    compatibleEquipment: ["Gasoline water pump"],
    problemsSolved: ["Water pump leaking", "Water pump not suction", "Hard starting"],
    kitIncludes: ["Mechanical seal", "O-rings", "Pump gasket", "Inlet/outlet connector", "Filter screen", "Spark plug", "Air filter", "Optional carburetor"]
  },
  {
    slug: "3-inch-water-pump-seal-kit",
    name: "3 Inch Water Pump Seal Kit",
    category: "Water Pump Repair Kit",
    shortDescription: "Seal kit for 3 inch water pumps used by agricultural, drainage and rental equipment operators.",
    priceRange: "USD 14.90-24.90",
    priceCents: 1990,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["3 Inch Pump", "Seal Kit", "Agriculture"],
    compatibleModels: ["3 Inch Water Pump"],
    compatibleEquipment: ["Gasoline water pump"],
    problemsSolved: ["Water pump leaking", "Weak suction", "Pump head leakage"],
    kitIncludes: ["Mechanical seal", "O-rings", "Pump gasket", "Filter screen"]
  },
  {
    slug: "pull-start-replacement-kit",
    name: "Pull Start Replacement Kit",
    category: "Starter System Kit",
    shortDescription: "Replacement kit for broken recoil starters on small engines, pumps and generators.",
    priceRange: "USD 14.90-22.90",
    priceCents: 1890,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Recoil Starter", "Fast Repair", "Best Seller"],
    compatibleModels: ["168F", "170F", "GX160", "GX200"],
    compatibleEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer"],
    problemsSolved: ["Pull starter broken", "Hard starting"],
    kitIncludes: ["Recoil starter", "Spare pull rope", "Mounting screws", "Spark plug", "Air filter"]
  },
  {
    slug: "carburetor-troubleshooting-kit",
    name: "Carburetor Troubleshooting Kit",
    category: "Fuel System Kit",
    shortDescription: "Fuel system repair kit for engines that will not start, run rough or have poor fuel flow.",
    priceRange: "USD 15.90-25.90",
    priceCents: 2190,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Troubleshooting Card", "Fuel System", "Engine Won't Start"],
    compatibleModels: ["168F", "170F", "GX160", "GX200"],
    compatibleEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer"],
    problemsSolved: ["Engine won't start", "Engine runs rough", "Poor fuel flow"],
    kitIncludes: ["Carburetor", "Spark plug", "Air filter", "Fuel hose", "Gasket", "Carburetor cleaning needle", "Troubleshooting card"]
  },
  {
    slug: "3kw-generator-basic-maintenance-kit",
    name: "3kW Generator Basic Maintenance Kit",
    category: "Generator Repair Kit",
    shortDescription: "Basic generator service kit for 3kW gasoline generators used by repair shops and rental fleets.",
    priceRange: "USD 24.90-34.90",
    priceCents: 2990,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["3kW Generator", "Maintenance", "Repair Shop"],
    compatibleModels: ["3kW Generator", "168F", "170F"],
    compatibleEquipment: ["Portable generator"],
    problemsSolved: ["Hard starting", "Engine won't start", "Poor maintenance"],
    kitIncludes: ["Spark plug", "Air filter", "Fuel hose", "Carburetor", "Start switch"]
  },
  {
    slug: "3kw-generator-electrical-addon-kit",
    name: "3kW Generator Electrical Add-on Kit",
    category: "Generator Repair Kit",
    shortDescription: "Electrical add-on kit for 3kW generators. Buyers must confirm model and wiring before purchase.",
    priceRange: "USD 19.90-39.90",
    priceCents: 2990,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Ask Before Buying", "Generator No Voltage", "Electrical"],
    compatibleModels: ["3kW Generator"],
    compatibleEquipment: ["Portable generator"],
    problemsSolved: ["Generator no voltage", "Weak voltage output"],
    kitIncludes: ["AVR", "Carbon brush", "Voltage meter", "Switch"],
    notCompatibleWith: ["Unknown wiring layouts", "Non-matching AVR plug types"]
  },
  {
    slug: "annual-small-engine-maintenance-kit",
    name: "Annual Small Engine Maintenance Kit",
    category: "Maintenance Kit",
    shortDescription: "Annual maintenance pack for shops, dealers and personal users servicing multiple small engines.",
    priceRange: "USD 12.90-19.90",
    priceCents: 1690,
    currency: "usd",
    wholesaleAvailable: true,
    tags: ["Annual Service", "Dealer Pack", "Maintenance Checklist"],
    compatibleModels: ["168F", "170F", "GX160", "GX200"],
    compatibleEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer", "Lawn & garden machine"],
    problemsSolved: ["Poor maintenance", "Hard starting", "Dirty air filter"],
    kitIncludes: ["2 spark plugs", "2 air filters", "Fuel hose", "Gasket set", "Pull rope", "Maintenance checklist"]
  },
  {
    slug: "universal-fuel-line-clamp-kit",
    name: "Universal Fuel Line & Clamp Kit",
    category: "Universal Parts",
    shortDescription: "Universal fuel hose, inline fuel filters and spring clamps that fit nearly every small gasoline engine in the field.",
    priceRange: "USD 6.90-9.90",
    priceCents: 790,
    currency: "usd",
    wholesaleAvailable: true,
    fitmentType: "UNIVERSAL",
    fitmentNote: "Fits engines using 4.5mm or 5.5mm inner-diameter fuel line",
    tags: ["Universal", "Fuel System", "Workshop Stock"],
    compatibleModels: [],
    compatibleEquipment: ["Portable generator", "Gasoline water pump", "Tiller", "Sprayer", "Lawn & garden machine"],
    problemsSolved: ["Poor fuel flow", "Engine won't start", "Engine runs rough"],
    kitIncludes: ["1m fuel hose 4.5mm", "1m fuel hose 5.5mm", "4 inline fuel filters", "10 spring clamps"]
  }
];

const problems = [
  ["engine-wont-start", "Engine Won't Start", "Fuel, air intake or ignition issues can stop small gasoline engines from starting."],
  ["pull-starter-broken", "Pull Starter Broken", "Rope, spring or recoil housing failure after frequent field use."],
  ["water-pump-not-suction", "Water Pump Not Suction", "Weak suction caused by air leaks, seal wear, clogged screens or priming issues."],
  ["water-pump-leaking", "Water Pump Leaking", "Leakage around pump gasket, O-rings or mechanical seal."],
  ["generator-no-voltage", "Generator No Voltage", "Electrical output issues related to AVR, carbon brush, wiring or switches."],
  ["engine-runs-rough", "Engine Runs Rough", "Fuel delivery, filtration or carburetor issues causing unstable running."]
];

const equipment = [
  ["portable-generator", "Portable Generator", "Gasoline generators from 3kW to 5kW used by homes, shops and rental fleets."],
  ["gasoline-water-pump", "Gasoline Water Pump", "2 inch and 3 inch water pumps for irrigation, drainage and construction work."],
  ["small-gasoline-engine", "Small Gasoline Engine", "General purpose gasoline engines used across small equipment platforms."],
  ["tiller", "Tiller", "Small agricultural tillers using 168F, 170F and similar gasoline engines."],
  ["sprayer", "Sprayer", "Agricultural sprayers and portable machines that need seasonal service kits."],
  ["lawn-garden-machine", "Lawn & Garden Machine", "Garden machines and outdoor power equipment using small gasoline engines."],
  ["light-construction-machine", "Light Construction Machine", "Light site equipment requiring field repair kits and maintenance packs."]
];

const models = [
  ["168f", "168F", "Common small gasoline engine platform used in generators, pumps, tillers and sprayers.", "Confirm air filter shape, recoil starter mounting and carburetor linkage before ordering."],
  ["170f", "170F", "Slightly larger gasoline engine platform used in pumps and agricultural equipment.", "Some parts overlap with 168F, but carburetor and gasket details may differ."],
  ["188f", "188F", "Larger engine platform often used with higher capacity generators and pumps.", "Do not assume 168F/170F parts fit 188F engines."],
  ["190f", "190F", "High output small engine platform for heavier generator and pump applications.", "Ask before buying if the carburetor or recoil housing shape is uncertain."],
  ["gx160", "GX160", "GX160 style engines share many service parts with 168F style engines.", "GX160 style does not guarantee exact Honda original compatibility."],
  ["gx200", "GX200", "GX200 style engines are common in pumps, tillers and light equipment.", "Confirm carburetor mounting and air filter size before ordering."],
  ["2-inch-water-pump", "2 Inch Water Pump", "Common gasoline pump size for irrigation and drainage.", "Pump seal dimensions and connector shape must be checked."],
  ["3-inch-water-pump", "3 Inch Water Pump", "Larger pump body used in agriculture and construction drainage.", "Confirm pump body series and seal size before ordering."],
  ["3kw-generator", "3kW Generator", "Portable generator class commonly powered by 168F or 170F style engines.", "Electrical parts require wiring and plug confirmation."],
  ["5kw-generator", "5kW Generator", "Larger portable generator class commonly paired with 188F style engines.", "Engine service kits and electrical kits must be selected separately."]
];

function id(prefix, index) {
  return `${prefix}_${String(index + 1).padStart(3, "0")}`;
}

function defaultSku(product, index) {
  const categoryPrefix = product.category
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
  return `${categoryPrefix}-${String(index + 1).padStart(4, "0")}`;
}

function defaultStock(index) {
  return [24, 12, 8, 16, 5, 18, 4, 21, 11, 9, 3, 30][index] || 10;
}

async function main() {
  const now = new Date();

  // 清空(子表先删；带 onDelete:Cascade 的关系会自动级联删除 OrderEvent/Shipment/ReturnRequest/OrderItem/CustomerAddress)
  await prisma.orderItem.deleteMany();
  await prisma.inventoryAdjustment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wholesaleApplication.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.engineModel.deleteMany();

  // ---- Products ----
  const productRecords = products.map((product, index) => {
    const priceCents = product.priceCents || 0;
    return {
      id: id("product", index),
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle || null,
      sku: product.sku || defaultSku(product, index),
      category: product.category,
      brand: product.brand || "RepairKit Supply",
      shortDescription: product.shortDescription,
      description: product.description || product.shortDescription,
      status: product.status || "ACTIVE",
      priceRange: product.priceRange,
      priceCents,
      currency: product.currency || "usd",
      compareAtPriceCents: product.compareAtPriceCents || null,
      wholesalePriceCents: product.wholesalePriceCents || Math.max(0, priceCents - 400),
      costPriceCents: product.costPriceCents || Math.max(0, Math.round(priceCents * 0.55)),
      allowCoupons: product.allowCoupons !== false,
      stock: product.stock ?? defaultStock(index),
      lowStockThreshold: product.lowStockThreshold || 6,
      weightGrams: product.weightGrams || null,
      lengthMm: product.lengthMm || null,
      widthMm: product.widthMm || null,
      heightMm: product.heightMm || null,
      wholesaleAvailable: Boolean(product.wholesaleAvailable),
      isFeatured: index < 5,
      isHotSeller: product.tags.includes("Best Seller") || product.tags.includes("Main Profit Kit"),
      fitmentType: product.fitmentType || "SPECIFIC",
      fitmentNote: product.fitmentNote || null,
      tags: JSON.stringify(product.tags),
      compatibleModels: JSON.stringify(product.compatibleModels),
      compatibleEquipment: JSON.stringify(product.compatibleEquipment),
      problemsSolved: JSON.stringify(product.problemsSolved),
      kitIncludes: JSON.stringify(product.kitIncludes),
      notCompatibleWith: product.notCompatibleWith ? JSON.stringify(product.notCompatibleWith) : null,
      specifications: product.specifications ? JSON.stringify(product.specifications) : null,
      faqs: product.faqs ? JSON.stringify(product.faqs) : null,
      images: product.images ? JSON.stringify(product.images) : null,
      image: product.image || null,
      seoTitle: product.seoTitle || product.name,
      seoDescription: product.seoDescription || product.shortDescription,
      seoKeywords: product.seoKeywords || product.tags.join(", "),
      ogImage: product.ogImage || product.image || null,
      createdAt: now,
      updatedAt: now
    };
  });
  await prisma.product.createMany({ data: productRecords });

  // ---- Initial inventory adjustments ----
  await prisma.inventoryAdjustment.createMany({
    data: productRecords.map((product, index) => ({
      id: id("inventory", index),
      productId: product.id,
      type: "INITIAL",
      quantityDelta: product.stock,
      stockBefore: 0,
      stockAfter: product.stock,
      reason: "Initial seed inventory",
      reference: "SEED",
      createdBy: "system",
      createdAt: now
    }))
  });

  // ---- Reference data: problems / equipment / engine models ----
  await prisma.problem.createMany({
    data: problems.map(([slug, title, description], index) => ({
      id: id("problem", index),
      slug,
      title,
      description,
      createdAt: now
    }))
  });
  await prisma.equipment.createMany({
    data: equipment.map(([slug, name, description], index) => ({
      id: id("equipment", index),
      slug,
      name,
      description,
      createdAt: now
    }))
  });
  await prisma.engineModel.createMany({
    data: models.map(([slug, name, description, compatibilityNote], index) => ({
      id: id("model", index),
      slug,
      name,
      description,
      compatibilityNote,
      createdAt: now
    }))
  });

  const productRows = productRecords.slice(0, 6);

  // ---- Sample customers + orders (demo data) ----
  const sampleOrders = [
    {
      orderNumber: "RK-20260604-1001",
      customerName: "Ahmad Rahman",
      customerEmail: "ahmad.rahman@example.com",
      customerPhone: "+60 12 555 0198",
      customerWhatsapp: "+60 12 555 0198",
      country: "Malaysia",
      city: "Kuala Lumpur",
      shippingAddress: "Jalan Tun Razak 88",
      postalCode: "50400",
      paymentStatus: "PAID",
      orderStatus: "PROCESSING",
      fulfillmentStatus: "UNFULFILLED",
      paidAt: now.toISOString(),
      items: [
        { productIndex: 0, quantity: 2 },
        { productIndex: 4, quantity: 1 }
      ],
      internalNote: "Repair shop buyer. Confirm pump seal size before shipping."
    },
    {
      orderNumber: "RK-20260604-1002",
      customerName: "Siti Nur",
      customerEmail: "siti.nur@example.com",
      customerPhone: "+62 812 1234 5678",
      customerWhatsapp: "+62 812 1234 5678",
      country: "Indonesia",
      city: "Jakarta",
      shippingAddress: "Jl. Industri No. 19",
      postalCode: "14430",
      paymentStatus: "PENDING",
      orderStatus: "PROCESSING",
      fulfillmentStatus: "UNFULFILLED",
      items: [{ productIndex: 1, quantity: 1 }],
      internalNote: "Waiting for Stripe payment confirmation."
    },
    {
      orderNumber: "RK-20260603-1003",
      customerName: "Khalid Motors",
      customerEmail: "parts@khalidmotors.example",
      customerPhone: "+971 50 123 4567",
      customerWhatsapp: "+971 50 123 4567",
      country: "United Arab Emirates",
      city: "Dubai",
      shippingAddress: "Al Quoz Industrial Area",
      postalCode: "00000",
      paymentStatus: "PAID",
      orderStatus: "SHIPPED",
      fulfillmentStatus: "SHIPPED",
      paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      shippedAt: now.toISOString(),
      shippingCarrier: "DHL",
      trackingNumber: "DHL-RK-778899",
      trackingUrl: "https://www.dhl.com/",
      items: [
        { productIndex: 2, quantity: 3 },
        { productIndex: 5, quantity: 2 }
      ],
      internalNote: "Wholesale prospect. Follow up after delivery."
    }
  ];

  await prisma.customer.createMany({
    data: sampleOrders.map((order, orderIndex) => ({
      id: id("customer", orderIndex),
      email: order.customerEmail.toLowerCase(),
      name: order.customerName,
      phone: order.customerPhone,
      whatsapp: order.customerWhatsapp,
      country: order.country,
      city: order.city,
      address: order.shippingAddress,
      postalCode: order.postalCode,
      status: orderIndex === 2 ? "VIP" : "ACTIVE",
      role: orderIndex === 2 ? "WHOLESALE" : "CUSTOMER",
      tags: JSON.stringify(orderIndex === 2 ? ["Wholesale", "Repair Shop"] : ["Retail"]),
      internalNote: orderIndex === 2 ? "Approved wholesale customer." : null,
      wholesaleApprovedAt: orderIndex === 2 ? new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date(Date.now() - (orderIndex + 1) * 24 * 60 * 60 * 1000),
      updatedAt: now
    }))
  });

  // ---- Wholesale applications ----
  const wholesaleApplications = [
    {
      customerId: null,
      companyName: "Borneo Engine Service",
      contactName: "Daniel Lim",
      country: "Malaysia",
      whatsapp: "+60 16 880 4521",
      email: "daniel@borneoengine.example",
      businessType: "Repair Shop",
      productInterest: ["168F repair kits", "Water pump seal kits"],
      estimatedMonthlyQuantity: 120,
      message: "We service agricultural pumps and generators across Sabah and need mixed cartons.",
      status: "PENDING",
      adminNote: null,
      reviewedBy: null,
      reviewedAt: null,
      notificationStatus: "NOT_SENT"
    },
    {
      customerId: id("customer", 2),
      companyName: "Khalid Motors",
      contactName: "Khalid Motors",
      country: "United Arab Emirates",
      whatsapp: "+971 50 123 4567",
      email: "parts@khalidmotors.example",
      businessType: "Distributor",
      productInterest: ["170F repair kits", "Generator maintenance kits"],
      estimatedMonthlyQuantity: 250,
      message: "Looking for repeat supply and private label packaging.",
      status: "APPROVED",
      adminNote: "Approved after sample order and business verification.",
      reviewedBy: "admin@example.com",
      reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      notificationStatus: "PENDING_EMAIL_SETUP"
    },
    {
      customerId: null,
      companyName: "Rapid Parts Marketplace",
      contactName: "Marketplace Buyer",
      country: "Indonesia",
      whatsapp: "+62 811 0000 4455",
      email: "buyer@rapidparts.example",
      businessType: "Online Seller",
      productInterest: ["Electrical generator parts"],
      estimatedMonthlyQuantity: 5,
      message: "Requesting exclusive distribution without an initial sample order.",
      status: "REJECTED",
      adminNote: "Requested quantity is below the current wholesale minimum.",
      reviewedBy: "admin@example.com",
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notificationStatus: "PENDING_EMAIL_SETUP"
    }
  ];

  await prisma.wholesaleApplication.createMany({
    data: wholesaleApplications.map((application, applicationIndex) => ({
      id: id("wholesale", applicationIndex),
      customerId: application.customerId,
      companyName: application.companyName,
      contactName: application.contactName,
      country: application.country,
      whatsapp: application.whatsapp,
      email: application.email.toLowerCase(),
      businessType: application.businessType,
      productInterest: JSON.stringify(application.productInterest),
      estimatedMonthlyQuantity: application.estimatedMonthlyQuantity,
      message: application.message,
      status: application.status,
      adminNote: application.adminNote,
      reviewedBy: application.reviewedBy,
      reviewedAt: application.reviewedAt ? new Date(application.reviewedAt) : null,
      notificationStatus: application.notificationStatus,
      createdAt: new Date(Date.now() - applicationIndex * 20 * 60 * 60 * 1000),
      updatedAt: now
    }))
  });

  // ---- Coupons ----
  const coupons = [
    {
      id: "coupon_welcome10",
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      isActive: true,
      minSubtotalCents: 0,
      usageLimit: 500,
      usageCount: 1,
      perCustomerLimit: 1,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      allowWholesaleCustomers: false
    },
    {
      id: "coupon_freeship50",
      code: "FREESHIP50",
      type: "FREE_SHIPPING",
      value: 0,
      isActive: true,
      minSubtotalCents: 5000,
      usageLimit: 200,
      usageCount: 0,
      perCustomerLimit: 1,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      allowWholesaleCustomers: true
    },
    {
      id: "coupon_wholesale5",
      code: "WHOLESALE5",
      type: "PERCENTAGE",
      value: 5,
      isActive: true,
      minSubtotalCents: 10000,
      usageLimit: null,
      usageCount: 0,
      perCustomerLimit: null,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: null,
      allowWholesaleCustomers: true
    }
  ];
  await prisma.coupon.createMany({ data: coupons });

  // ---- Orders + order items ----
  for (let orderIndex = 0; orderIndex < sampleOrders.length; orderIndex++) {
    const order = sampleOrders[orderIndex];
    const orderItems = order.items.map((item) => {
      const product = productRows[item.productIndex] || productRows[0];
      return {
        product,
        quantity: item.quantity,
        subtotalCents: product.priceCents * item.quantity
      };
    });
    const subtotalCents = orderItems.reduce((total, item) => total + item.subtotalCents, 0);
    const shippingCents = 1990;
    const taxCents = 0;
    const discountCents = orderIndex === 0 ? Math.round(subtotalCents * 0.1) : 0;
    const totalCents = subtotalCents + shippingCents + taxCents - discountCents;
    const orderId = id("order", orderIndex);
    const createdAt = new Date(Date.now() - orderIndex * 18 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        id: orderId,
        orderNumber: order.orderNumber,
        customerId: id("customer", orderIndex),
        couponId: orderIndex === 0 ? "coupon_welcome10" : null,
        couponCode: orderIndex === 0 ? "WELCOME10" : null,
        couponType: orderIndex === 0 ? "PERCENTAGE" : null,
        couponValue: orderIndex === 0 ? 10 : null,
        couponUsageRecorded: orderIndex === 0,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerWhatsapp: order.customerWhatsapp,
        country: order.country,
        city: order.city,
        shippingAddress: order.shippingAddress,
        postalCode: order.postalCode,
        currency: "usd",
        subtotalCents,
        shippingCents,
        taxCents,
        discountCents,
        totalCents,
        paymentMethod: "stripe",
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        stripeCheckoutSessionId: order.paymentStatus === "PENDING" ? `cs_test_seed_${orderIndex + 1}` : null,
        stripePaymentIntentId: order.paymentStatus === "PAID" ? `pi_seed_${orderIndex + 1}` : null,
        paidAt: order.paidAt ? new Date(order.paidAt) : null,
        shippingCarrier: order.shippingCarrier || null,
        trackingNumber: order.trackingNumber || null,
        trackingUrl: order.trackingUrl || null,
        shippedAt: order.shippedAt ? new Date(order.shippedAt) : null,
        internalNote: order.internalNote,
        createdAt,
        updatedAt: now,
        items: {
          create: orderItems.map((item, itemIndex) => ({
            id: id(`order_item_${orderIndex + 1}`, itemIndex),
            productId: item.product.id,
            productName: item.product.name,
            productSlug: item.product.slug,
            sku: item.product.sku,
            unitPriceCents: item.product.priceCents,
            quantity: item.quantity,
            subtotalCents: item.subtotalCents,
            image: item.product.image || null,
            createdAt
          }))
        }
      }
    });
  }
}

main()
  .then(() => {
    console.log(
      `Seeded ${products.length} products, 3 customers, 3 wholesale applications, 3 coupons, 3 orders, ` +
        `${products.length} inventory records, ${problems.length} problems, ${equipment.length} equipment types and ${models.length} models.`
    );
    return prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
