// Shared payment-layer types.
export type PaymentProviderId = "stripe" | "paypal" | "airwallex";

export type PaymentOption = {
  id: PaymentProviderId;
  label: string; // shown on the checkout button
  kind: "card" | "wallet"; // card = credit/debit gateway, wallet = PayPal etc.
  endpoint: string; // POST here with { items, couponCode } → { url }
};
