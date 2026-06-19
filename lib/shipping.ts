// 按地区分档运费(框架)。金额单位:USD 分(与商品价一致,展示/收款再换算)。
//
// ⚠️ 下面的费率、包邮门槛、时效都是【占位值】——拿到货代真实报价后，改 SHIPPING_ZONES
// 里的数字即可，逻辑不用动。计费方式:首重价 + 续重按步进加价;订单满额则包邮。

/** 兼容旧引用:其它地区(REST)首重价。 */
export const SHIPPING_CENTS = 1290;

/** 未填写重量的商品，按此克重估算(避免重量为 0 导致运费过低)。 */
export const DEFAULT_ITEM_WEIGHT_G = 500;

export type ShippingZoneId = "SEA" | "ME" | "EU_UK" | "CENTRAL_ASIA" | "REST";

type ZoneRate = {
  label: string; // 展示名
  firstWeightG: number; // 首重克数
  firstCents: number; // 首重价(USD 分)
  addWeightG: number; // 续重步进(克)
  addCents: number; // 每个续重步进加价(USD 分)
  freeOverCents: number; // 订单(小计)满此金额包邮(USD 分)
  etaMinDays: number; // 时效下限(天)
  etaMaxDays: number; // 时效上限(天)
};

// 占位费率 —— 改这里即可。
export const SHIPPING_ZONES: Record<ShippingZoneId, ZoneRate> = {
  SEA: { label: "东南亚", firstWeightG: 500, firstCents: 690, addWeightG: 500, addCents: 300, freeOverCents: 8000, etaMinDays: 5, etaMaxDays: 10 },
  ME: { label: "中东", firstWeightG: 500, firstCents: 990, addWeightG: 500, addCents: 450, freeOverCents: 12000, etaMinDays: 7, etaMaxDays: 14 },
  EU_UK: { label: "欧洲/英国", firstWeightG: 500, firstCents: 990, addWeightG: 500, addCents: 450, freeOverCents: 12000, etaMinDays: 7, etaMaxDays: 15 },
  CENTRAL_ASIA: { label: "中亚", firstWeightG: 500, firstCents: 890, addWeightG: 500, addCents: 400, freeOverCents: 12000, etaMinDays: 10, etaMaxDays: 18 },
  REST: { label: "其它地区", firstWeightG: 500, firstCents: 1290, addWeightG: 500, addCents: 500, freeOverCents: 15000, etaMinDays: 10, etaMaxDays: 20 }
};

// 国家代码 → 运费分区。未列出的国家归入 REST。
const COUNTRY_TO_ZONE: Record<string, ShippingZoneId> = {
  // 东南亚
  MY: "SEA", ID: "SEA", TH: "SEA", VN: "SEA", PH: "SEA", SG: "SEA", KH: "SEA",
  // 中东
  AE: "ME", SA: "ME", QA: "ME", KW: "ME", OM: "ME", BH: "ME", EG: "ME", JO: "ME", IQ: "ME", TR: "ME",
  // 欧洲/英国
  GB: "EU_UK", DE: "EU_UK", FR: "EU_UK", IT: "EU_UK", ES: "EU_UK", NL: "EU_UK", BE: "EU_UK",
  SE: "EU_UK", PL: "EU_UK", IE: "EU_UK", AT: "EU_UK", PT: "EU_UK", DK: "EU_UK", FI: "EU_UK", CZ: "EU_UK", RO: "EU_UK",
  // 中亚 / 高加索
  KZ: "CENTRAL_ASIA", UZ: "CENTRAL_ASIA", KG: "CENTRAL_ASIA", TJ: "CENTRAL_ASIA", TM: "CENTRAL_ASIA", AZ: "CENTRAL_ASIA", GE: "CENTRAL_ASIA"
};

export function shippingZoneForCountry(code: string | null | undefined): ShippingZoneId {
  if (!code) return "REST";
  return COUNTRY_TO_ZONE[code.toUpperCase()] || "REST";
}

/** 计算运费(USD 分)。满包邮门槛返回 0。 */
export function computeShippingCents(args: { countryCode: string | null | undefined; weightGrams: number; subtotalCents: number }): number {
  const zone = SHIPPING_ZONES[shippingZoneForCountry(args.countryCode)];
  if (args.subtotalCents >= zone.freeOverCents) return 0;
  const weight = Math.max(1, Math.round(args.weightGrams));
  const extraSteps = Math.max(0, Math.ceil((weight - zone.firstWeightG) / zone.addWeightG));
  return zone.firstCents + extraSteps * zone.addCents;
}

export type ShippingQuote = {
  cents: number;
  zoneId: ShippingZoneId;
  zoneLabel: string;
  etaMinDays: number;
  etaMaxDays: number;
  freeApplied: boolean;
  freeOverCents: number;
};

/** 运费 + 时效 + 是否包邮，供购物车/结账展示。 */
export function shippingQuote(args: { countryCode: string | null | undefined; weightGrams: number; subtotalCents: number }): ShippingQuote {
  const zoneId = shippingZoneForCountry(args.countryCode);
  const zone = SHIPPING_ZONES[zoneId];
  const cents = computeShippingCents(args);
  return {
    cents,
    zoneId,
    zoneLabel: zone.label,
    etaMinDays: zone.etaMinDays,
    etaMaxDays: zone.etaMaxDays,
    freeApplied: cents === 0,
    freeOverCents: zone.freeOverCents
  };
}
