// Payment provider registry — reports which gateways are usable right now so the
// checkout UI only shows buttons that will actually work.
import { airwallexConfigured } from "@/lib/payments/airwallex";
import { paypalConfigured } from "@/lib/payments/paypal";
import type { PaymentOption } from "@/lib/payments/types";

function stripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key.startsWith("sk_"));
}

export function availablePaymentOptions(): PaymentOption[] {
  const options: PaymentOption[] = [];

  // Card gateway: Airwallex is the intended primary; Stripe stays as a fallback
  // while it's the only configured one. Only one "card" button is shown.
  if (airwallexConfigured()) {
    options.push({ id: "airwallex", label: "信用卡 / 借记卡", kind: "card", endpoint: "/api/payments/airwallex" });
  } else if (stripeConfigured()) {
    options.push({ id: "stripe", label: "信用卡 / 借记卡", kind: "card", endpoint: "/api/checkout" });
  }

  if (paypalConfigured()) {
    options.push({ id: "paypal", label: "PayPal", kind: "wallet", endpoint: "/api/payments/paypal" });
  }

  return options;
}
