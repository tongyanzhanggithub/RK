// One-off: replace customer-facing "Stripe" copy with provider-neutral wording.
// The Stripe *code* stays as an env-gated fallback; only user-visible strings change
// (we actually charge via Airwallex/PayPal, so naming Stripe is misleading + wrong
// in the legal pages). Phrase-level replacements keep the sentences reading naturally.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

const pairs = [
  // EN — checkout / status copy
  ["before secure Stripe checkout", "before secure checkout"],
  ["continue to secure Stripe checkout.", "continue to secure checkout."],
  ["Secure card payment via Stripe", "Secure card payment"],
  ["Stripe checkout completed successfully.", "Checkout completed successfully."],
  ["Stripe checkout was canceled.", "Checkout was canceled."],
  ["Stripe confirmed your payment and the order is ready for processing.", "Your payment was confirmed and the order is ready for processing."],
  ["Stripe could not complete this payment. Please contact us or place the order again.", "The payment could not be completed. Please contact us or place the order again."],
  ["Stripe reports that this order has been refunded.", "This order has been refunded."],
  ["Checkout is complete. Stripe payment confirmation may take a moment, and the order will update automatically.", "Checkout is complete. Payment confirmation may take a moment, and the order will update automatically."],
  ["try Stripe Checkout again.", "try checkout again."],
  ["Retail trial orders go through Stripe checkout and ship by international courier.", "Retail trial orders go through secure online checkout and ship by international courier."],
  // EN — legal pages
  ["Card payments are processed securely by Stripe — we never see or store your full card details.", "Card payments are processed securely by our payment provider — we never see or store your full card details."],
  ["Payment card data is collected directly by Stripe, not by us.", "Payment card data is collected directly by our payment provider, not by us."],
  ["Card payments are handled by Stripe under their privacy terms.", "Card payments are handled by our payment provider under their privacy terms."],
  ["(e.g. Stripe for payment, carriers for delivery)", "(e.g. our payment provider, carriers for delivery)"],
  // ZH — checkout / status copy
  ["通过 Stripe 安全结账前请确认维修套件。", "安全结账前请确认维修套件。"],
  ["Stripe 已确认您的付款，订单正在处理中。", "您的付款已确认，订单正在处理中。"],
  ["Stripe 无法完成此次付款，请联系我们或重新下单。", "本次付款未能完成，请联系我们或重新下单。"],
  ["Stripe 报告此订单已退款。", "此订单已退款。"],
  ["结账已完成。Stripe 付款确认可能需要片刻，订单将自动更新。", "结账已完成。付款确认可能需要片刻，订单将自动更新。"],
  ["未完成任何付款。您可以重新确认数量、删除商品或再次尝试 Stripe 结账。", "未完成任何付款。您可以重新确认数量、删除商品或再次尝试结账。"],
  // ZH — legal pages
  ["银行卡支付由 Stripe 安全处理 —— 我们不会看到或存储你的完整卡号。", "银行卡支付由支付服务商安全处理 —— 我们不会看到或存储你的完整卡号。"],
  ["银行卡信息由 Stripe 直接收集，我们不经手。", "银行卡信息由支付服务商直接收集，我们不经手。"],
  ["银行卡支付由 Stripe 按其隐私条款处理。", "银行卡支付由支付服务商按其隐私条款处理。"],
  ["（如 Stripe 支付、承运商配送）", "（如支付服务商、承运商配送）"]
];

const files = [
  "lib/i18n.ts",
  "app/cart/page.tsx",
  "components/trust-badges.tsx",
  "app/checkout/success/page.tsx",
  "app/checkout/cancel/page.tsx",
  "app/about/page.tsx"
];

const seen = new Set();
for (const rel of files) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [from, to] of pairs) {
    if (src.includes(from)) {
      src = src.split(from).join(to);
      n++;
      seen.add(from);
    }
  }
  if (n > 0) {
    fs.writeFileSync(file, src);
    console.log(`updated ${rel} (${n} phrases)`);
  }
}
const missed = pairs.filter(([from]) => !seen.has(from)).map(([from]) => from);
if (missed.length) console.log("NOT FOUND:", JSON.stringify(missed, null, 2));
else console.log("all phrases applied");
