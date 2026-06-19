// Airwallex provider — PLACEHOLDER.
//
// Airwallex is the planned primary card gateway (mainland-license friendly,
// multi-currency settlement to China, modern hosted checkout + webhooks). The
// integration is intentionally stubbed until the merchant account + sandbox API
// keys exist. When ready, implement createAirwallexCheckout() against the
// Payment Intents / Hosted Payment Page API, mirroring lib/payments/paypal.ts,
// and settle via markOrderPaid() from lib/order-settlement.
//
// Env (when implemented):
//   AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY, AIRWALLEX_ENV = "demo" | "prod"
//   AIRWALLEX_WEBHOOK_SECRET
export function airwallexConfigured() {
  return Boolean(process.env.AIRWALLEX_CLIENT_ID && process.env.AIRWALLEX_API_KEY);
}

export async function createAirwallexCheckout(): Promise<{ url: string }> {
  throw new Error("Airwallex 尚未接入：请先申请商户并配置 AIRWALLEX_* 环境变量（见 lib/payments/airwallex.ts 注释）。");
}
