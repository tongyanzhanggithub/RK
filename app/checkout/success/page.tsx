import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleX, Clock3, RotateCcw } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Success",
  description: "Stripe checkout completed successfully."
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams?: { session_id?: string } }) {
  const sessionId = searchParams?.session_id || "";
  const order = sessionId
    ? await prisma.order.findFirst({ where: { stripeCheckoutSessionId: sessionId } })
    : null;
  const paid = order?.paymentStatus === "PAID";
  const failed = order?.paymentStatus === "FAILED";
  const refunded = order?.paymentStatus === "REFUNDED";
  const statusLabel = paid
    ? "Payment Confirmed"
    : failed
      ? "Payment Not Completed"
      : refunded
        ? "Payment Refunded"
        : "Confirmation In Progress";
  const statusMessage = paid
    ? "Stripe confirmed your payment and the order is ready for processing."
    : failed
      ? "Stripe could not complete this payment. Please contact us or place the order again."
      : refunded
        ? "Stripe reports that this order has been refunded."
        : "Checkout is complete. Stripe payment confirmation may take a moment, and the order will update automatically.";

  return (
    <main className="px-4 py-14">
      <ClearCartOnSuccess enabled={Boolean(sessionId)} />
      <section className="mx-auto max-w-3xl border border-line bg-white p-8 text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto text-green-700" size={56} />
        ) : failed ? (
          <CircleX className="mx-auto text-red-700" size={56} />
        ) : refunded ? (
          <RotateCcw className="mx-auto text-blue-700" size={56} />
        ) : (
          <Clock3 className="mx-auto text-amber-600" size={56} />
        )}
        <p className="mt-5 font-black uppercase text-safety">{statusLabel}</p>
        <h1 className="mt-2 text-4xl font-black">Thanks for your order</h1>
        <p className="mt-4 text-steel">{statusMessage}</p>
        {order && (
          <dl className="mx-auto mt-6 grid max-w-lg gap-3 border border-line bg-panel p-5 text-left text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-steel">Order Number</dt>
              <dd className="font-black">{order.orderNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-steel">Payment Status</dt>
              <dd className="font-black">{order.paymentStatus}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-steel">Order Total</dt>
              <dd className="font-black">{formatMoney(order.totalCents, order.currency)}</dd>
            </div>
          </dl>
        )}
        {sessionId && !order && (
          <p className="mt-5 break-all border border-line bg-panel p-3 text-sm font-bold">
            Session ID: {sessionId}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
            Continue Shopping
          </Link>
          <Link href="/" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
