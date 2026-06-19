// PayPal REST client (Orders API v2). Works against Sandbox or Live by env.
//
// Env:
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET   — REST app credentials
//   PAYPAL_ENV = "sandbox" | "live"   — defaults to "sandbox"
//   PAYPAL_WEBHOOK_ID                 — for webhook signature verification
const PAYPAL_BASE = () =>
  (process.env.PAYPAL_ENV || "sandbox") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);
}

async function accessToken() {
  const id = process.env.PAYPAL_CLIENT_ID || "";
  const secret = process.env.PAYPAL_SECRET || "";
  const res = await fetch(`${PAYPAL_BASE()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials",
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`PayPal auth failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

type CreateArgs = {
  orderId: string;
  orderNumber: string;
  amountValue: string; // e.g. "59.90"
  currency: string; // upper-case, e.g. "GBP"
  returnUrl: string;
  cancelUrl: string;
};

// Creates a PayPal order and returns its id + the buyer approval URL.
export async function createPayPalOrder(args: CreateArgs): Promise<{ id: string; approveUrl: string }> {
  const token = await accessToken();
  const res = await fetch(`${PAYPAL_BASE()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: args.orderId,
          custom_id: args.orderId, // our order id — read back on capture/webhook
          invoice_id: args.orderNumber,
          amount: { currency_code: args.currency, value: args.amountValue }
        }
      ],
      application_context: {
        brand_name: "Partavio",
        user_action: "PAY_NOW",
        shipping_preference: "GET_FROM_FILE",
        return_url: args.returnUrl,
        cancel_url: args.cancelUrl
      }
    }),
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`PayPal create order failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { id: string; links?: { rel: string; href: string }[] };
  const approve = data.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("PayPal did not return an approval URL.");
  return { id: data.id, approveUrl: approve };
}

export type PayPalCapture = {
  status: string; // COMPLETED, etc.
  orderId: string | null; // our order id (custom_id)
  captureId: string | null;
  payer: {
    name: string | null;
    email: string | null;
    country: string | null;
    city: string | null;
    address: string | null;
    postalCode: string | null;
  };
};

// Captures an approved PayPal order. Idempotent on PayPal's side: capturing an
// already-captured order returns the existing capture.
export async function capturePayPalOrder(paypalOrderId: string): Promise<PayPalCapture> {
  const token = await accessToken();
  const res = await fetch(`${PAYPAL_BASE()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`PayPal capture failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as any;
  const unit = data.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const shipping = unit?.shipping;
  const payerName = [data.payer?.name?.given_name, data.payer?.name?.surname].filter(Boolean).join(" ") || null;
  const addr = shipping?.address;
  return {
    status: data.status || capture?.status || "UNKNOWN",
    orderId: unit?.custom_id || unit?.reference_id || null,
    captureId: capture?.id || null,
    payer: {
      name: shipping?.name?.full_name || payerName,
      email: data.payer?.email_address || null,
      country: addr?.country_code || null,
      city: addr?.admin_area_2 || null,
      address: [addr?.address_line_1, addr?.address_line_2].filter(Boolean).join(", ") || null,
      postalCode: addr?.postal_code || null
    }
  };
}

// Verifies a webhook payload against PayPal so a forged POST can't mark orders
// paid. Requires PAYPAL_WEBHOOK_ID. Returns false if not configured.
export async function verifyPayPalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const token = await accessToken();
  const res = await fetch(`${PAYPAL_BASE()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody)
    }),
    cache: "no-store"
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
