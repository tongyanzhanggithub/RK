export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  sku?: string;
  category: string;
  brand?: string;
  shortDescription: string;
  description?: string;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  priceRange: string;
  priceCents: number;
  currency: "usd";
  compareAtPriceCents?: number;
  wholesalePriceCents?: number;
  costPriceCents?: number;
  allowCoupons?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  weightGrams?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wholesaleAvailable: boolean;
  isFeatured?: boolean;
  isHotSeller?: boolean;
  /** SPECIFIC parts must match compatibleModels; UNIVERSAL parts fit all small engines. */
  fitmentType?: "SPECIFIC" | "UNIVERSAL";
  /** One-line spec hint shown next to the universal badge, e.g. "Fits engines using 5.5mm fuel line". */
  fitmentNote?: string;
  tags: string[];
  compatibleModels: string[];
  compatibleEquipment: string[];
  problemsSolved: string[];
  kitIncludes: string[];
  notCompatibleWith?: string[];
  specifications?: {
    label: string;
    value: string;
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  relatedGuideSlugs?: string[];
  images?: {
    url: string;
    alt: string;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export const products: Product[] = [
  {
    id: "p-168f-basic",
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
    kitIncludes: ["Spark plug", "Air filter", "Fuel hose", "Gasket set", "Stop switch"],
    specifications: [
      { label: "Recommended use", value: "Seasonal maintenance" },
      { label: "Buyer type", value: "Personal users, repair shops and dealers" }
    ],
    faqs: [
      { question: "Is this a complete overhaul kit?", answer: "No. It is a basic service kit for routine maintenance and light repair." }
    ],
    relatedGuideSlugs: ["why-small-engine-wont-start", "generator-maintenance-checklist"]
  },
  {
    id: "p-168f-standard",
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
    kitIncludes: ["Carburetor", "Recoil starter", "Spark plug", "Air filter", "Fuel hose", "Gasket set", "Stop switch"],
    notCompatibleWith: ["Electric start only engines without recoil mount"],
    relatedGuideSlugs: ["why-small-engine-wont-start", "replace-recoil-starter"]
  },
  {
    id: "p-170f-standard",
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
    kitIncludes: ["Carburetor", "Recoil starter", "Spark plug", "Air filter", "Fuel hose", "Gasket set", "Stop switch"],
    relatedGuideSlugs: ["why-small-engine-wont-start"]
  },
  {
    id: "p-188f-maintenance",
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
    kitIncludes: ["Spark plug", "Air filter", "Fuel hose", "Gasket set", "Pull rope"],
    relatedGuideSlugs: ["generator-maintenance-checklist"]
  },
  {
    id: "p-2in-seal",
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
    kitIncludes: ["Mechanical seal", "O-rings", "Pump gasket", "Filter screen"],
    relatedGuideSlugs: ["fix-leaking-water-pump"]
  },
  {
    id: "p-2in-standard",
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
    kitIncludes: ["Mechanical seal", "O-rings", "Pump gasket", "Inlet/outlet connector", "Filter screen", "Spark plug", "Air filter", "Optional carburetor"],
    relatedGuideSlugs: ["fix-leaking-water-pump", "why-small-engine-wont-start"]
  },
  {
    id: "p-3in-seal",
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
    kitIncludes: ["Mechanical seal", "O-rings", "Pump gasket", "Filter screen"],
    relatedGuideSlugs: ["fix-leaking-water-pump"]
  },
  {
    id: "p-pull-start",
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
    kitIncludes: ["Recoil starter", "Spare pull rope", "Mounting screws", "Spark plug", "Air filter"],
    relatedGuideSlugs: ["replace-recoil-starter"]
  },
  {
    id: "p-carb-trouble",
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
    kitIncludes: ["Carburetor", "Spark plug", "Air filter", "Fuel hose", "Gasket", "Carburetor cleaning needle", "Troubleshooting card"],
    relatedGuideSlugs: ["why-small-engine-wont-start"]
  },
  {
    id: "p-3kw-basic",
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
    kitIncludes: ["Spark plug", "Air filter", "Fuel hose", "Carburetor", "Start switch"],
    relatedGuideSlugs: ["generator-maintenance-checklist"]
  },
  {
    id: "p-3kw-electrical",
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
    notCompatibleWith: ["Unknown wiring layouts", "Non-matching AVR plug types"],
    relatedGuideSlugs: ["generator-maintenance-checklist"]
  },
  {
    id: "p-annual",
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
    kitIncludes: ["2 spark plugs", "2 air filters", "Fuel hose", "Gasket set", "Pull rope", "Maintenance checklist"],
    relatedGuideSlugs: ["generator-maintenance-checklist"]
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
