// Central place for B2B contact channels. WhatsApp is the primary inquiry
// channel for buyers in the Middle East, Central Asia and Southeast Asia.

// Digits only, including country code, e.g. "8613800000000". No "+" or spaces.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "sales@repairkit-supply.com";

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  if (WHATSAPP_NUMBER) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  }
  // Fallback: opens WhatsApp with the message so the buyer can pick the contact.
  return `https://wa.me/?text=${text}`;
}

export function productInquiryMessage(input: { name: string; sku?: string; url?: string }) {
  const lines = [
    `Hello, I'd like a wholesale quote for:`,
    `Product: ${input.name}`,
    input.sku ? `SKU: ${input.sku}` : "",
    input.url ? `Link: ${input.url}` : "",
    `Quantity (MOQ): `,
    `Destination country: `
  ].filter(Boolean);
  return lines.join("\n");
}

export const GENERAL_INQUIRY_MESSAGE =
  "Hello, I'm interested in wholesale engine parts. Please send your catalog and pricing.";
