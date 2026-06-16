const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "dev.db"));

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

function resetLegacyProductTable() {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Product'").get();
  if (!table) return;
  const columns = db.prepare("PRAGMA table_info(Product)").all();
  const createdAt = columns.find((column) => column.name === "createdAt");
  if (createdAt && String(createdAt.type).toUpperCase() !== "DATETIME") {
    db.exec("DROP TABLE Product;");
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      subtitle TEXT,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      brand TEXT,
      shortDescription TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      priceRange TEXT NOT NULL,
      priceCents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      compareAtPriceCents INTEGER,
      wholesalePriceCents INTEGER,
      costPriceCents INTEGER,
      allowCoupons INTEGER NOT NULL DEFAULT 1,
      stock INTEGER NOT NULL DEFAULT 0,
      lowStockThreshold INTEGER NOT NULL DEFAULT 5,
      weightGrams INTEGER,
      lengthMm INTEGER,
      widthMm INTEGER,
      heightMm INTEGER,
      wholesaleAvailable INTEGER NOT NULL DEFAULT 0,
      isFeatured INTEGER NOT NULL DEFAULT 0,
      isHotSeller INTEGER NOT NULL DEFAULT 0,
      fitmentType TEXT NOT NULL DEFAULT 'SPECIFIC',
      fitmentNote TEXT,
      tags TEXT NOT NULL,
      compatibleModels TEXT NOT NULL,
      compatibleEquipment TEXT NOT NULL,
      problemsSolved TEXT NOT NULL,
      kitIncludes TEXT NOT NULL,
      notCompatibleWith TEXT,
      specifications TEXT,
      faqs TEXT,
      images TEXT,
      image TEXT,
      seoTitle TEXT,
      seoDescription TEXT,
      seoKeywords TEXT,
      ogImage TEXT,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Testimonial (
      id TEXT PRIMARY KEY,
      authorName TEXT NOT NULL,
      company TEXT,
      country TEXT NOT NULL,
      content TEXT NOT NULL,
      contentZh TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      isPublished INTEGER NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AdminUser (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      resetTokenHash TEXT,
      resetTokenExpiresAt DATETIME,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Customer (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      whatsapp TEXT,
      country TEXT,
      city TEXT,
      address TEXT,
      postalCode TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      tags TEXT NOT NULL DEFAULT '[]',
      internalNote TEXT,
      passwordHash TEXT,
      wholesaleApprovedAt DATETIME,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS WholesaleApplication (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      companyName TEXT NOT NULL,
      contactName TEXT NOT NULL,
      country TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      businessType TEXT NOT NULL,
      productInterest TEXT NOT NULL,
      estimatedMonthlyQuantity INTEGER,
      website TEXT,
      businessAddress TEXT,
      salesChannel TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      adminNote TEXT,
      reviewedBy TEXT,
      reviewedAt DATETIME,
      notificationStatus TEXT NOT NULL DEFAULT 'NOT_SENT',
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT WholesaleApplication_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Coupon (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      minSubtotalCents INTEGER,
      usageLimit INTEGER,
      usageCount INTEGER NOT NULL DEFAULT 0,
      perCustomerLimit INTEGER,
      startsAt DATETIME,
      endsAt DATETIME,
      allowWholesaleCustomers INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY,
      orderNumber TEXT NOT NULL UNIQUE,
      customerId TEXT,
      couponId TEXT,
      couponCode TEXT,
      couponType TEXT,
      couponValue INTEGER,
      couponUsageRecorded INTEGER NOT NULL DEFAULT 0,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT,
      customerWhatsapp TEXT,
      country TEXT NOT NULL,
      city TEXT,
      shippingAddress TEXT,
      postalCode TEXT,
      currency TEXT NOT NULL DEFAULT 'usd',
      subtotalCents INTEGER NOT NULL,
      shippingCents INTEGER NOT NULL DEFAULT 0,
      taxCents INTEGER NOT NULL DEFAULT 0,
      discountCents INTEGER NOT NULL DEFAULT 0,
      refundedCents INTEGER NOT NULL DEFAULT 0,
      totalCents INTEGER NOT NULL,
      paymentMethod TEXT NOT NULL DEFAULT 'stripe',
      paymentStatus TEXT NOT NULL DEFAULT 'PENDING',
      paymentFailureMessage TEXT,
      orderStatus TEXT NOT NULL DEFAULT 'PROCESSING',
      fulfillmentStatus TEXT NOT NULL DEFAULT 'UNFULFILLED',
      stripeCheckoutSessionId TEXT,
      stripePaymentIntentId TEXT,
      stripeLastEventId TEXT,
      stripeLastEventType TEXT,
      stripeLastSyncedAt DATETIME,
      paidAt DATETIME,
      confirmationEmailSentAt DATETIME,
      shippingEmailSentAt DATETIME,
      shippingCarrier TEXT,
      trackingNumber TEXT,
      trackingUrl TEXT,
      shippedAt DATETIME,
      internalNote TEXT,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT Order_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer (id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT Order_couponId_fkey FOREIGN KEY (couponId) REFERENCES Coupon (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT,
      productName TEXT NOT NULL,
      productSlug TEXT NOT NULL,
      sku TEXT NOT NULL,
      unitPriceCents INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotalCents INTEGER NOT NULL,
      image TEXT,
      createdAt DATETIME NOT NULL,
      CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY (orderId) REFERENCES "Order" (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS InventoryAdjustment (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      type TEXT NOT NULL,
      quantityDelta INTEGER NOT NULL,
      stockBefore INTEGER NOT NULL,
      stockAfter INTEGER NOT NULL,
      reason TEXT,
      reference TEXT,
      createdBy TEXT,
      createdAt DATETIME NOT NULL,
      CONSTRAINT InventoryAdjustment_productId_fkey FOREIGN KEY (productId) REFERENCES Product (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Problem (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Equipment (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS EngineModel (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      compatibilityNote TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

function ensureProductColumns() {
  const columns = db.prepare("PRAGMA table_info(Product)").all().map((column) => column.name);
  const additions = [
    ["subtitle", "TEXT"],
    ["sku", "TEXT"],
    ["brand", "TEXT"],
    ["description", "TEXT"],
    ["status", "TEXT NOT NULL DEFAULT 'ACTIVE'"],
    ["priceCents", "INTEGER NOT NULL DEFAULT 0"],
    ["currency", "TEXT NOT NULL DEFAULT 'usd'"],
    ["compareAtPriceCents", "INTEGER"],
    ["wholesalePriceCents", "INTEGER"],
    ["costPriceCents", "INTEGER"],
    ["allowCoupons", "INTEGER NOT NULL DEFAULT 1"],
    ["stock", "INTEGER NOT NULL DEFAULT 0"],
    ["lowStockThreshold", "INTEGER NOT NULL DEFAULT 5"],
    ["weightGrams", "INTEGER"],
    ["lengthMm", "INTEGER"],
    ["widthMm", "INTEGER"],
    ["heightMm", "INTEGER"],
    ["isFeatured", "INTEGER NOT NULL DEFAULT 0"],
    ["isHotSeller", "INTEGER NOT NULL DEFAULT 0"],
    ["fitmentType", "TEXT NOT NULL DEFAULT 'SPECIFIC'"],
    ["fitmentNote", "TEXT"],
    ["images", "TEXT"],
    ["seoTitle", "TEXT"],
    ["seoDescription", "TEXT"],
    ["seoKeywords", "TEXT"],
    ["ogImage", "TEXT"]
  ];

  additions.forEach(([name, definition]) => {
    if (!columns.includes(name)) {
      db.exec(`ALTER TABLE Product ADD COLUMN ${name} ${definition};`);
    }
  });

  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS Product_sku_key ON Product(sku);");
}

function ensureOrderTables() {
  const columns = db.prepare('PRAGMA table_info("Order")').all().map((column) => column.name);
  const additions = [
    ["refundedCents", "INTEGER NOT NULL DEFAULT 0"],
    ["paymentFailureMessage", "TEXT"],
    ["stripeLastEventId", "TEXT"],
    ["stripeLastEventType", "TEXT"],
    ["stripeLastSyncedAt", "DATETIME"],
    ["customerId", "TEXT"]
  ];

  additions.forEach(([name, definition]) => {
    if (!columns.includes(name)) {
      db.exec(`ALTER TABLE "Order" ADD COLUMN ${name} ${definition};`);
    }
  });

  db.exec(`
    CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"(createdAt);
    CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"(paymentStatus);
    CREATE INDEX IF NOT EXISTS "Order_orderStatus_idx" ON "Order"(orderStatus);
    CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"(customerId);
    CREATE INDEX IF NOT EXISTS OrderItem_orderId_idx ON OrderItem(orderId);
    CREATE INDEX IF NOT EXISTS InventoryAdjustment_productId_idx ON InventoryAdjustment(productId);
    CREATE INDEX IF NOT EXISTS InventoryAdjustment_createdAt_idx ON InventoryAdjustment(createdAt);
  `);
}

function ensureWholesaleTables() {
  const customerColumns = db.prepare("PRAGMA table_info(Customer)").all().map((column) => column.name);
  const customerAdditions = [
    ["role", "TEXT NOT NULL DEFAULT 'CUSTOMER'"],
    ["wholesaleApprovedAt", "DATETIME"]
  ];

  customerAdditions.forEach(([name, definition]) => {
    if (!customerColumns.includes(name)) {
      db.exec(`ALTER TABLE Customer ADD COLUMN ${name} ${definition};`);
    }
  });

  db.exec(`
    CREATE TABLE IF NOT EXISTS WholesaleApplication (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      companyName TEXT NOT NULL,
      contactName TEXT NOT NULL,
      country TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      businessType TEXT NOT NULL,
      productInterest TEXT NOT NULL,
      estimatedMonthlyQuantity INTEGER,
      website TEXT,
      businessAddress TEXT,
      salesChannel TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      adminNote TEXT,
      reviewedBy TEXT,
      reviewedAt DATETIME,
      notificationStatus TEXT NOT NULL DEFAULT 'NOT_SENT',
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      CONSTRAINT WholesaleApplication_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer (id) ON DELETE SET NULL ON UPDATE CASCADE
    );
    CREATE INDEX IF NOT EXISTS WholesaleApplication_customerId_idx ON WholesaleApplication(customerId);
    CREATE INDEX IF NOT EXISTS WholesaleApplication_status_idx ON WholesaleApplication(status);
    CREATE INDEX IF NOT EXISTS WholesaleApplication_createdAt_idx ON WholesaleApplication(createdAt);
  `);
}

function ensureCouponTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Coupon (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      minSubtotalCents INTEGER,
      usageLimit INTEGER,
      usageCount INTEGER NOT NULL DEFAULT 0,
      perCustomerLimit INTEGER,
      startsAt DATETIME,
      endsAt DATETIME,
      allowWholesaleCustomers INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS Coupon_code_key ON Coupon(code);
    CREATE INDEX IF NOT EXISTS Coupon_code_idx ON Coupon(code);
    CREATE INDEX IF NOT EXISTS Coupon_isActive_idx ON Coupon(isActive);
    CREATE INDEX IF NOT EXISTS Coupon_startsAt_idx ON Coupon(startsAt);
    CREATE INDEX IF NOT EXISTS Coupon_endsAt_idx ON Coupon(endsAt);
  `);

  const orderColumns = db.prepare('PRAGMA table_info("Order")').all().map((column) => column.name);
  const orderAdditions = [
    ["couponId", "TEXT"],
    ["couponCode", "TEXT"],
    ["couponType", "TEXT"],
    ["couponValue", "INTEGER"],
    ["couponUsageRecorded", "INTEGER NOT NULL DEFAULT 0"]
  ];

  orderAdditions.forEach(([name, definition]) => {
    if (!orderColumns.includes(name)) {
      db.exec(`ALTER TABLE "Order" ADD COLUMN ${name} ${definition};`);
    }
  });

  db.exec('CREATE INDEX IF NOT EXISTS "Order_couponId_idx" ON "Order"(couponId);');
}

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
  resetLegacyProductTable();
  createTables();
  ensureProductColumns();
  ensureOrderTables();
  ensureWholesaleTables();
  ensureCouponTables();
  db.exec('DELETE FROM InventoryAdjustment; DELETE FROM OrderItem; DELETE FROM "Order"; DELETE FROM WholesaleApplication; DELETE FROM Customer; DELETE FROM Coupon; DELETE FROM Product; DELETE FROM Problem; DELETE FROM Equipment; DELETE FROM EngineModel;');

  const now = new Date().toISOString();
  const insertProduct = db.prepare(`
    INSERT INTO Product (
      id, slug, name, subtitle, sku, category, brand, shortDescription, description, status,
      priceRange, priceCents, currency, compareAtPriceCents, wholesalePriceCents, costPriceCents,
      allowCoupons, stock, lowStockThreshold, weightGrams, lengthMm, widthMm, heightMm, wholesaleAvailable,
      isFeatured, isHotSeller, fitmentType, fitmentNote,
      tags, compatibleModels, compatibleEquipment, problemsSolved, kitIncludes,
      notCompatibleWith, specifications, faqs, images, image,
      seoTitle, seoDescription, seoKeywords, ogImage, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach((product, index) => {
    const priceCents = product.priceCents || 0;
    insertProduct.run(
      id("product", index),
      product.slug,
      product.name,
      product.subtitle || null,
      product.sku || defaultSku(product, index),
      product.category,
      product.brand || "RepairKit Supply",
      product.shortDescription,
      product.description || product.shortDescription,
      product.status || "ACTIVE",
      product.priceRange,
      priceCents,
      product.currency || "usd",
      product.compareAtPriceCents || null,
      product.wholesalePriceCents || Math.max(0, priceCents - 400),
      product.costPriceCents || Math.max(0, Math.round(priceCents * 0.55)),
      product.allowCoupons === false ? 0 : 1,
      product.stock ?? defaultStock(index),
      product.lowStockThreshold || 6,
      product.weightGrams || null,
      product.lengthMm || null,
      product.widthMm || null,
      product.heightMm || null,
      product.wholesaleAvailable ? 1 : 0,
      index < 5 ? 1 : 0,
      product.tags.includes("Best Seller") || product.tags.includes("Main Profit Kit") ? 1 : 0,
      product.fitmentType || "SPECIFIC",
      product.fitmentNote || null,
      JSON.stringify(product.tags),
      JSON.stringify(product.compatibleModels),
      JSON.stringify(product.compatibleEquipment),
      JSON.stringify(product.problemsSolved),
      JSON.stringify(product.kitIncludes),
      product.notCompatibleWith ? JSON.stringify(product.notCompatibleWith) : null,
      product.specifications ? JSON.stringify(product.specifications) : null,
      product.faqs ? JSON.stringify(product.faqs) : null,
      product.images ? JSON.stringify(product.images) : null,
      product.image || null,
      product.seoTitle || product.name,
      product.seoDescription || product.shortDescription,
      product.seoKeywords || product.tags.join(", "),
      product.ogImage || product.image || null,
      now,
      now
    );
  });

  const inventoryProducts = db.prepare("SELECT id, stock FROM Product ORDER BY rowid ASC").all();
  const insertInventoryAdjustment = db.prepare(`
    INSERT INTO InventoryAdjustment (
      id, productId, type, quantityDelta, stockBefore, stockAfter, reason, reference, createdBy, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  inventoryProducts.forEach((product, index) => {
    insertInventoryAdjustment.run(
      id("inventory", index),
      product.id,
      "INITIAL",
      product.stock,
      0,
      product.stock,
      "Initial seed inventory",
      "SEED",
      "system",
      now
    );
  });

  const insertProblem = db.prepare("INSERT INTO Problem (id, slug, title, description, createdAt) VALUES (?, ?, ?, ?, ?)");
  problems.forEach(([slug, title, description], index) => {
    insertProblem.run(id("problem", index), slug, title, description, now);
  });

  const insertEquipment = db.prepare("INSERT INTO Equipment (id, slug, name, description, createdAt) VALUES (?, ?, ?, ?, ?)");
  equipment.forEach(([slug, name, description], index) => {
    insertEquipment.run(id("equipment", index), slug, name, description, now);
  });

  const insertModel = db.prepare("INSERT INTO EngineModel (id, slug, name, description, compatibilityNote, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
  models.forEach(([slug, name, description, compatibilityNote], index) => {
    insertModel.run(id("model", index), slug, name, description, compatibilityNote, now);
  });

  const productRows = db.prepare("SELECT id, slug, name, sku, priceCents, currency, image FROM Product ORDER BY rowid ASC LIMIT 6").all();
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
      paidAt: now,
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
      items: [
        { productIndex: 1, quantity: 1 }
      ],
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
      shippedAt: now,
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

  const insertCustomer = db.prepare(`
    INSERT INTO Customer (
      id, email, name, phone, whatsapp, country, city, address, postalCode,
      status, role, tags, internalNote, wholesaleApprovedAt, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  sampleOrders.forEach((order, orderIndex) => {
    insertCustomer.run(
      id("customer", orderIndex),
      order.customerEmail.toLowerCase(),
      order.customerName,
      order.customerPhone,
      order.customerWhatsapp,
      order.country,
      order.city,
      order.shippingAddress,
      order.postalCode,
      orderIndex === 2 ? "VIP" : "ACTIVE",
      orderIndex === 2 ? "WHOLESALE" : "CUSTOMER",
      JSON.stringify(orderIndex === 2 ? ["Wholesale", "Repair Shop"] : ["Retail"]),
      orderIndex === 2 ? "Approved wholesale customer." : null,
      orderIndex === 2 ? new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() : null,
      new Date(Date.now() - (orderIndex + 1) * 24 * 60 * 60 * 1000).toISOString(),
      now
    );
  });

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

  const insertWholesaleApplication = db.prepare(`
    INSERT INTO WholesaleApplication (
      id, customerId, companyName, contactName, country, whatsapp, email, businessType,
      productInterest, estimatedMonthlyQuantity, message, status, adminNote, reviewedBy,
      reviewedAt, notificationStatus, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  wholesaleApplications.forEach((application, applicationIndex) => {
    insertWholesaleApplication.run(
      id("wholesale", applicationIndex),
      application.customerId,
      application.companyName,
      application.contactName,
      application.country,
      application.whatsapp,
      application.email.toLowerCase(),
      application.businessType,
      JSON.stringify(application.productInterest),
      application.estimatedMonthlyQuantity,
      application.message,
      application.status,
      application.adminNote,
      application.reviewedBy,
      application.reviewedAt,
      application.notificationStatus,
      new Date(Date.now() - applicationIndex * 20 * 60 * 60 * 1000).toISOString(),
      now
    );
  });

  const coupons = [
    {
      id: "coupon_welcome10",
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      isActive: 1,
      minSubtotalCents: 0,
      usageLimit: 500,
      usageCount: 1,
      perCustomerLimit: 1,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      allowWholesaleCustomers: 0
    },
    {
      id: "coupon_freeship50",
      code: "FREESHIP50",
      type: "FREE_SHIPPING",
      value: 0,
      isActive: 1,
      minSubtotalCents: 5000,
      usageLimit: 200,
      usageCount: 0,
      perCustomerLimit: 1,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      allowWholesaleCustomers: 1
    },
    {
      id: "coupon_wholesale5",
      code: "WHOLESALE5",
      type: "PERCENTAGE",
      value: 5,
      isActive: 1,
      minSubtotalCents: 10000,
      usageLimit: null,
      usageCount: 0,
      perCustomerLimit: null,
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: null,
      allowWholesaleCustomers: 1
    }
  ];

  const insertCoupon = db.prepare(`
    INSERT INTO Coupon (
      id, code, type, value, isActive, minSubtotalCents, usageLimit, usageCount,
      perCustomerLimit, startsAt, endsAt, allowWholesaleCustomers, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  coupons.forEach((coupon) => {
    insertCoupon.run(
      coupon.id,
      coupon.code,
      coupon.type,
      coupon.value,
      coupon.isActive,
      coupon.minSubtotalCents,
      coupon.usageLimit,
      coupon.usageCount,
      coupon.perCustomerLimit,
      coupon.startsAt,
      coupon.endsAt,
      coupon.allowWholesaleCustomers,
      now,
      now
    );
  });

  const insertOrder = db.prepare(`
    INSERT INTO "Order" (
      id, orderNumber, customerId, couponId, couponCode, couponType, couponValue, couponUsageRecorded,
      customerName, customerEmail, customerPhone, customerWhatsapp,
      country, city, shippingAddress, postalCode, currency, subtotalCents, shippingCents,
      taxCents, discountCents, totalCents, paymentMethod, paymentStatus, orderStatus,
      fulfillmentStatus, stripeCheckoutSessionId, stripePaymentIntentId, paidAt,
      shippingCarrier, trackingNumber, trackingUrl, shippedAt, internalNote, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO OrderItem (
      id, orderId, productId, productName, productSlug, sku, unitPriceCents, quantity,
      subtotalCents, image, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleOrders.forEach((order, orderIndex) => {
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
    const createdAt = new Date(Date.now() - orderIndex * 18 * 60 * 60 * 1000).toISOString();

    insertOrder.run(
      orderId,
      order.orderNumber,
      id("customer", orderIndex),
      orderIndex === 0 ? "coupon_welcome10" : null,
      orderIndex === 0 ? "WELCOME10" : null,
      orderIndex === 0 ? "PERCENTAGE" : null,
      orderIndex === 0 ? 10 : null,
      orderIndex === 0 ? 1 : 0,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.customerWhatsapp,
      order.country,
      order.city,
      order.shippingAddress,
      order.postalCode,
      "usd",
      subtotalCents,
      shippingCents,
      taxCents,
      discountCents,
      totalCents,
      "stripe",
      order.paymentStatus,
      order.orderStatus,
      order.fulfillmentStatus,
      order.paymentStatus === "PENDING" ? `cs_test_seed_${orderIndex + 1}` : null,
      order.paymentStatus === "PAID" ? `pi_seed_${orderIndex + 1}` : null,
      order.paidAt || null,
      order.shippingCarrier || null,
      order.trackingNumber || null,
      order.trackingUrl || null,
      order.shippedAt || null,
      order.internalNote,
      createdAt,
      now
    );

    orderItems.forEach((item, itemIndex) => {
      insertOrderItem.run(
        id(`order_item_${orderIndex + 1}`, itemIndex),
        orderId,
        item.product.id,
        item.product.name,
        item.product.slug,
        item.product.sku,
        item.product.priceCents,
        item.quantity,
        item.subtotalCents,
        item.product.image || null,
        createdAt
      );
    });
  });
}

main()
  .then(() => {
    console.log(`Seeded ${products.length} products, 3 customers, 3 wholesale applications, 3 coupons, 3 orders, ${products.length} inventory records, ${problems.length} problems, ${equipment.length} equipment types and ${models.length} models.`);
    db.close();
  })
  .catch((error) => {
    console.error(error);
    db.close();
    process.exit(1);
  });
