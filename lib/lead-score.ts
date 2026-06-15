// Heuristic qualification scoring for wholesale applications.
// Higher score = more likely a genuine business (lower sample-fraud risk).
// This is a triage aid for manual review, not an automated gate.

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "outlook.com", "live.com", "msn.com", "icloud.com",
  "aol.com", "protonmail.com", "proton.me", "gmx.com", "mail.com",
  "yandex.com", "yandex.ru", "qq.com", "163.com", "126.com", "sina.com",
  "foxmail.com", "zoho.com"
]);

// Phrases that, combined with weak signals, suggest a freebie-seeker.
const FREEBIE_PATTERNS = [
  /free sample/i, /free of charge/i, /no cost/i, /just (a |one )?sample/i,
  /免费样品/, /免费/, /白嫖/, /送我/, /gratis/i, /muestra gratis/i
];

export type LeadInput = {
  email: string;
  website?: string | null;
  businessAddress?: string | null;
  salesChannel?: string | null;
  productInterest?: string | null;
  estimatedMonthlyQuantity?: number | null;
  message?: string | null;
};

export type LeadSignal = { label: string; positive: boolean };

export type LeadScore = {
  score: number; // 0–100
  tier: "high" | "medium" | "low";
  signals: LeadSignal[];
};

function emailDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase().trim() : "";
}

export function scoreLead(input: LeadInput): LeadScore {
  const signals: LeadSignal[] = [];
  let score = 0;

  const domain = emailDomain(input.email);
  const isFreeEmail = !domain || FREE_EMAIL_DOMAINS.has(domain);
  if (!isFreeEmail) {
    score += 30;
    signals.push({ label: `企业邮箱域名 (@${domain})`, positive: true });
  } else {
    signals.push({ label: "使用免费邮箱（gmail/qq 等）", positive: false });
  }

  if (input.website && input.website.trim().length > 3) {
    score += 25;
    signals.push({ label: "提供了公司网站", positive: true });
  } else {
    signals.push({ label: "未提供公司网站", positive: false });
  }

  if (input.businessAddress && input.businessAddress.trim().length > 5) {
    score += 15;
    signals.push({ label: "提供了实体经营地址", positive: true });
  } else {
    signals.push({ label: "未提供实体地址", positive: false });
  }

  const qty = input.estimatedMonthlyQuantity ?? 0;
  if (qty >= 50) {
    score += 15;
    signals.push({ label: `预计月采购量较高 (${qty})`, positive: true });
  } else if (qty >= 10) {
    score += 8;
    signals.push({ label: `预计月采购量中等 (${qty})`, positive: true });
  } else {
    signals.push({ label: "预计采购量很低或未填", positive: false });
  }

  if (input.salesChannel && input.salesChannel.trim().length > 3) {
    score += 7;
    signals.push({ label: "说明了销售渠道/市场", positive: true });
  }

  if (input.productInterest && input.productInterest.replace(/[\[\]"]/g, "").trim().length > 15) {
    score += 8;
    signals.push({ label: "意向产品描述具体", positive: true });
  }

  // Freebie-seeker flag: begging language with no real buying signal.
  const text = `${input.message || ""} ${input.productInterest || ""}`;
  const begsForFree = FREEBIE_PATTERNS.some((re) => re.test(text));
  if (begsForFree && qty < 10 && isFreeEmail) {
    score = Math.max(0, score - 20);
    signals.push({ label: "⚠ 索要免费样品且无采购信号", positive: false });
  }

  score = Math.max(0, Math.min(100, score));
  const tier: LeadScore["tier"] = score >= 60 ? "high" : score >= 35 ? "medium" : "low";
  return { score, tier, signals };
}

export const TIER_LABEL: Record<LeadScore["tier"], string> = {
  high: "高质量",
  medium: "中等",
  low: "可疑"
};

export const TIER_CLASS: Record<LeadScore["tier"], string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800"
};
