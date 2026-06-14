export type Lang = "en" | "zh";

export const LANGS: Lang[] = ["en", "zh"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "lang";

export function normalizeLang(value: string | undefined | null): Lang {
  return value === "zh" ? "zh" : "en";
}

type Entry = Record<Lang, string>;

export const dict: Record<string, Entry> = {
  // ---- Top bar ----
  "topbar.factory": {
    en: "Factory-direct engine parts & complete engines — Chongqing, China",
    zh: "重庆工厂直供发动机配件与整机"
  },
  "topbar.serving": {
    en: "Serving the Middle East, Central Asia & Southeast Asia",
    zh: "服务中东、中亚与东南亚"
  },

  // ---- Brand ----
  "brand.tagline": { en: "Factory-direct engine parts supplier", zh: "工厂直供发动机配件供应商" },

  // ---- Search ----
  "search.placeholder": {
    en: "Search 168F, GX160, water pump seal, recoil starter...",
    zh: "搜索 168F、GX160、水泵密封、启动器…"
  },
  "search.button": { en: "Search", zh: "搜索" },

  // ---- Header / global CTA ----
  "cta.getQuote": { en: "Get a Quote", zh: "获取报价" },

  // ---- Nav ----
  "nav.home": { en: "Home", zh: "首页" },
  "nav.products": { en: "Products", zh: "产品" },
  "nav.wholesale": { en: "Wholesale / RFQ", zh: "批发 / 询价" },
  "nav.cart": { en: "Cart", zh: "购物车" },

  // ---- WhatsApp float ----
  "whatsapp.quote": { en: "WhatsApp Quote", zh: "WhatsApp 询价" },

  // ---- Language ----
  "lang.label": { en: "Language", zh: "语言" },

  // ---- Footer ----
  "footer.desc": {
    en: "Factory-direct supplier of small engine parts, repair kits and complete engines from the Chongqing manufacturing cluster. Wholesale and OEM for the Middle East, Central Asia and Southeast Asia.",
    zh: "来自重庆制造集群的小型发动机配件、维修套件与整机工厂直供供应商。面向中东、中亚与东南亚提供批发与 OEM 服务。"
  },
  "footer.logistics": {
    en: "Logistics: sea LCL/FCL and China–Central Asia rail · full export documents · T/T payment terms.",
    zh: "物流：海运拼箱/整柜，中国–中亚铁路 · 全套出口单证 · 支持 T/T 付款。"
  },
  "footer.navigate": { en: "Navigate", zh: "导航" },
  "footer.getQuote": { en: "Get a quote", zh: "获取报价" },
  "footer.cart": { en: "Cart (trial orders)", zh: "购物车（试订单）" },

  // ---- Product card ----
  "card.models": { en: "Models:", zh: "适配机型：" },
  "card.solves": { en: "Solves:", zh: "解决问题：" },
  "card.wholesaleAvailable": { en: "Wholesale available", zh: "支持批发" },
  "card.wholesaleByVolume": { en: "Wholesale by volume", zh: "按量批发" },
  "card.viewDetails": { en: "View Details", zh: "查看详情" },
  "cart.add": { en: "Add to Cart", zh: "加入购物车" },
  "cart.added": { en: "Added", zh: "已加入" },

  // ---- Home: hero ----
  "home.hero.badge": { en: "Factory-direct B2B supplier", zh: "工厂直供 B2B 供应商" },
  "home.hero.title": {
    en: "Wholesale Small Engine Parts & Complete Engines — Direct From China",
    zh: "小型发动机配件与整机批发 — 中国工厂直供"
  },
  "home.hero.subtitle": {
    en: "Repair kits, spare parts and complete 168F / GX160-style engines for repair shops, distributors and dealers across the Middle East, Central Asia and Southeast Asia. Factory pricing, low MOQ, OEM welcome.",
    zh: "面向中东、中亚与东南亚的维修店、分销商与经销商，提供维修套件、配件及 168F / GX160 型整机。工厂价、低起订量、欢迎 OEM。"
  },
  "home.hero.getQuote": { en: "Get Wholesale Quote", zh: "获取批发报价" },
  "home.hero.becomeDistributor": { en: "Become a Distributor", zh: "成为分销商" },
  "home.hero.browseCatalog": { en: "Browse Catalog", zh: "浏览目录" },
  "home.hero.whyTitle": { en: "Why buyers source from us", zh: "买家为何选择我们" },
  "home.hero.why1": { en: "Factory-direct pricing — no middleman markup", zh: "工厂直供价 — 无中间商加价" },
  "home.hero.why2": { en: "Low MOQ and mixed-carton trial orders", zh: "低起订量、可混箱试订" },
  "home.hero.why3": { en: "OEM / private-label packaging available", zh: "支持 OEM / 贴牌包装" },
  "home.hero.why4": { en: "Sea & rail freight + T/T payment terms", zh: "海运 / 铁运 + T/T 付款方式" },

  // ---- Home: region strip ----
  "home.region.me": { en: "Middle East", zh: "中东" },
  "home.region.ca": { en: "Central Asia", zh: "中亚" },
  "home.region.sea": { en: "Southeast Asia", zh: "东南亚" },
  "home.region.tagline": {
    en: "Complete engines · Spare parts · Repair kits · OEM",
    zh: "整机 · 配件 · 维修套件 · OEM"
  },

  // ---- Home: supply advantage ----
  "home.adv.eyebrow": { en: "The supply-chain advantage", zh: "供应链优势" },
  "home.adv.title": { en: "A real factory network behind every order", zh: "每一单背后都有真实的工厂网络" },
  "home.adv.1.title": { en: "Factory-direct from Chongqing", zh: "重庆工厂直供" },
  "home.adv.1.copy": {
    en: "Sourced from China's largest motorcycle and small-engine parts cluster — the same ecosystem behind Loncin, Zongshen and Lifan engines.",
    zh: "采购自中国最大的摩托车与小型发动机配件集群 — 隆鑫、宗申、力帆同源的产业生态。"
  },
  "home.adv.2.title": { en: "Full range, one supplier", zh: "全系列，一站采购" },
  "home.adv.2.copy": {
    en: "Complete engines, spare parts and repair kits in a single order. Consolidate your sourcing and cut freight per unit.",
    zh: "整机、配件与维修套件可一单采购。集中采购，降低单位运费。"
  },
  "home.adv.3.title": { en: "OEM / ODM & custom kitting", zh: "OEM / ODM 与定制套装" },
  "home.adv.3.copy": {
    en: "Private-label packaging and custom carton mixes built for your local market and brand.",
    zh: "为你的本地市场与品牌定制贴牌包装与混装方案。"
  },
  "home.adv.4.title": { en: "Export-ready logistics", zh: "出口物流就绪" },
  "home.adv.4.copy": {
    en: "Sea LCL/FCL and China–Central Asia rail. Full export documentation, T/T payment terms for reviewed buyers.",
    zh: "海运拼箱/整柜及中国–中亚铁路。全套出口单证，审核买家可享 T/T 付款。"
  },

  // ---- Home: categories ----
  "home.cat.eyebrow": { en: "Product range", zh: "产品范围" },
  "home.cat.title": { en: "Source by category", zh: "按品类采购" },
  "home.cat.1.title": { en: "Small Engine Repair Kits", zh: "小型发动机维修套件" },
  "home.cat.1.copy": { en: "For 168F, 170F, GX160 and GX200 style engines", zh: "适配 168F、170F、GX160、GX200 型发动机" },
  "home.cat.2.title": { en: "Water Pump Repair Kits", zh: "水泵维修套件" },
  "home.cat.2.copy": { en: "Seal kits, O-rings, gaskets and pump connectors", zh: "密封套件、O 形圈、垫片与水泵接头" },
  "home.cat.3.title": { en: "Generator Maintenance Kits", zh: "发电机保养套件" },
  "home.cat.3.copy": { en: "Maintenance kits for portable generator service", zh: "便携发电机保养维修套件" },
  "home.cat.4.title": { en: "Pull Starter Replacement Kits", zh: "启动器更换套件" },
  "home.cat.4.copy": { en: "Recoil starter, rope and quick service parts", zh: "手拉启动器、启动绳与快修件" },
  "home.cat.5.title": { en: "Carburetor Troubleshooting Kits", zh: "化油器排障套件" },
  "home.cat.5.copy": { en: "Fuel system repair kits for no-start issues", zh: "针对无法启动的燃油系统维修套件" },

  // ---- Home: best sellers ----
  "home.best.eyebrow": { en: "Fast-moving SKUs", zh: "畅销 SKU" },
  "home.best.title": { en: "High-demand parts for resale", zh: "高需求转售配件" },
  "home.best.viewAll": { en: "View full catalog", zh: "查看完整目录" },

  // ---- Home: bottom CTA ----
  "home.cta.eyebrow": { en: "Ready to order?", zh: "准备下单？" },
  "home.cta.title": {
    en: "Send us your model list and quantities for a same-day quote",
    zh: "把型号清单和数量发给我们，当天报价"
  },
  "home.cta.copy": {
    en: "Tell us the engine models or part numbers you need. We reply with wholesale pricing, MOQ, carton plan and freight options by WhatsApp.",
    zh: "告诉我们你需要的发动机型号或零件号，我们会通过 WhatsApp 回复批发价、起订量、装箱方案与运费选项。"
  },
  "home.cta.whatsapp": { en: "WhatsApp Us", zh: "WhatsApp 联系我们" },
  "home.cta.apply": { en: "Apply for Wholesale", zh: "申请批发" }
};

export function translate(lang: Lang, key: string): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}
