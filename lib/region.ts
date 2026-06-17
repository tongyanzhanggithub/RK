// Region / currency DISPLAY layer. Prices are stored and CHARGED in USD via Stripe;
// here we only convert for an approximate local-currency display, plus region VAT/
// shipping notes. FX rates are approximate and static — refresh from a real source
// periodically (they only affect the "≈ local" hint, never the amount charged).

export const REGION_COOKIE = "rk-country";

// rate = local units per 1 USD. `chargeable` = we create the Stripe Checkout
// session in this currency (real local charge); others fall back to USD charging
// with an "≈ local" display. Only 2-decimal, widely-supported currencies are
// marked chargeable to avoid minor-unit / settlement pitfalls.
type CurrencyInfo = { symbol: string; rate: number; decimals: number; chargeable?: boolean };

const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { symbol: "$", rate: 1, decimals: 2, chargeable: true },
  GBP: { symbol: "£", rate: 0.79, decimals: 2, chargeable: true },
  EUR: { symbol: "€", rate: 0.92, decimals: 2, chargeable: true },
  AED: { symbol: "AED ", rate: 3.67, decimals: 2, chargeable: true },
  SAR: { symbol: "SAR ", rate: 3.75, decimals: 2, chargeable: true },
  QAR: { symbol: "QAR ", rate: 3.64, decimals: 2 },
  KWD: { symbol: "KWD ", rate: 0.31, decimals: 3 },
  CNY: { symbol: "¥", rate: 7.2, decimals: 2 },
  KZT: { symbol: "₸", rate: 480, decimals: 0 },
  UZS: { symbol: "soʻm ", rate: 12600, decimals: 0 },
  MYR: { symbol: "RM", rate: 4.7, decimals: 2 },
  IDR: { symbol: "Rp", rate: 16300, decimals: 0 },
  THB: { symbol: "฿", rate: 36, decimals: 2 },
  VND: { symbol: "₫", rate: 25400, decimals: 0 },
  PHP: { symbol: "₱", rate: 58, decimals: 2 },
  SGD: { symbol: "S$", rate: 1.35, decimals: 2, chargeable: true },
  INR: { symbol: "₹", rate: 83, decimals: 2 },
  PKR: { symbol: "₨", rate: 278, decimals: 0 }
};

export type Country = { code: string; name: string; currency: string; vat?: string };

// Curated list covering the store's target markets + majors. Anything not listed
// falls back to International (USD). `vat` is a short display note only.
export const COUNTRIES: Country[] = [
  { code: "INTL", name: "International (USD)", currency: "USD" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP", vat: "Prices exclude 20% UK VAT" },
  // Middle East
  { code: "AE", name: "United Arab Emirates", currency: "AED", vat: "Prices exclude 5% VAT" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", vat: "Prices exclude 15% VAT" },
  { code: "QA", name: "Qatar", currency: "QAR" },
  { code: "KW", name: "Kuwait", currency: "KWD" },
  { code: "OM", name: "Oman", currency: "USD" },
  { code: "BH", name: "Bahrain", currency: "USD" },
  { code: "EG", name: "Egypt", currency: "USD" },
  { code: "JO", name: "Jordan", currency: "USD" },
  { code: "IQ", name: "Iraq", currency: "USD" },
  // Central Asia
  { code: "KZ", name: "Kazakhstan", currency: "KZT" },
  { code: "UZ", name: "Uzbekistan", currency: "UZS" },
  { code: "KG", name: "Kyrgyzstan", currency: "USD" },
  { code: "TJ", name: "Tajikistan", currency: "USD" },
  // Southeast Asia
  { code: "MY", name: "Malaysia", currency: "MYR", vat: "Prices exclude SST" },
  { code: "ID", name: "Indonesia", currency: "IDR", vat: "Prices exclude 11% PPN" },
  { code: "TH", name: "Thailand", currency: "THB", vat: "Prices exclude 7% VAT" },
  { code: "VN", name: "Vietnam", currency: "VND", vat: "Prices exclude VAT" },
  { code: "PH", name: "Philippines", currency: "PHP", vat: "Prices exclude 12% VAT" },
  { code: "SG", name: "Singapore", currency: "SGD", vat: "Prices exclude 9% GST" },
  // South Asia
  { code: "IN", name: "India", currency: "INR", vat: "Prices exclude GST" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  // Europe (euro)
  { code: "DE", name: "Germany", currency: "EUR", vat: "Prices exclude VAT" },
  { code: "FR", name: "France", currency: "EUR", vat: "Prices exclude VAT" },
  { code: "CN", name: "China", currency: "CNY" }
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function resolveCountry(code: string | undefined | null): Country {
  if (!code) return DEFAULT_COUNTRY;
  return BY_CODE.get(code.toUpperCase()) || DEFAULT_COUNTRY;
}

/** Approximate local amount (major units) for a USD cents value. */
export function convertUsd(cents: number, currency: string): number {
  const info = CURRENCIES[currency] || CURRENCIES.USD;
  return (cents / 100) * info.rate;
}

/** Format a USD cents value in the country's display currency, e.g. "AED 91" or "$24.90". */
export function formatLocal(cents: number, country: Country): string {
  const code = country.currency;
  const info = CURRENCIES[code] || CURRENCIES.USD;
  const amount = convertUsd(cents, code);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: info.decimals,
      minimumFractionDigits: info.decimals === 0 ? 0 : 2
    }).format(amount);
  } catch {
    return `${info.symbol}${amount.toFixed(info.decimals)}`;
  }
}

export function isUsd(country: Country): boolean {
  return country.currency === "USD";
}

/** Whether we create the Stripe session directly in this currency (real local charge). */
export function isChargeableCurrency(currency: string): boolean {
  return CURRENCIES[currency]?.chargeable === true;
}

/** The currency a country is actually charged in: its own if chargeable, else USD. */
export function chargeCurrency(country: Country): string {
  return isChargeableCurrency(country.currency) ? country.currency : "USD";
}

/**
 * Integer minor units in the CHARGE currency for a USD cents value — what we hand
 * to Stripe. Chargeable currencies are all 2-decimal, so minor units = ×100.
 */
export function localChargeMinor(usdCents: number, currency: string): number {
  if (currency === "USD") return usdCents;
  const info = CURRENCIES[currency] || CURRENCIES.USD;
  return Math.round((usdCents / 100) * info.rate * 100);
}
