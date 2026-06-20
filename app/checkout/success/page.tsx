import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleX, Clock3, MessageCircle, RotateCcw } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Success",
  description: "Stripe checkout completed successfully."
};

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams?: { session_id?: string; order?: string };
}) {
  const dict = getServerDict();
  const ck = dict.checkout;
  const sessionId = searchParams?.session_id || "";
  const orderId = searchParams?.order || "";
  // Stripe returns ?session_id=...; PayPal/Airwallex redirect with ?order=<our id>.
  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : sessionId
      ? await prisma.order.findFirst({ where: { stripeCheckoutSessionId: sessionId } })
      : null;
  const paid = order?.paymentStatus === "PAID";
  const failed = order?.paymentStatus === "FAILED";
  const refunded = order?.paymentStatus === "REFUNDED";
  const statusLabel = paid ? ck.confirmed : failed ? ck.not_completed : refunded ? ck.refunded : ck.in_progress;
  const statusMessage = paid ? ck.msg_paid : failed ? ck.msg_failed : refunded ? ck.msg_refunded : ck.msg_pending;

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
        <p className="mt-5 font-black uppercase text-brand">{statusLabel}</p>
        <h1 className="mt-2 text-4xl font-black">{ck.thanks}</h1>
        <p className="mt-4 text-steel">{statusMessage}</p>
        {order && (
          <dl className="mx-auto mt-6 grid max-w-lg gap-3 border border-line bg-panel p-5 text-left text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-steel">{ck.order_number}</dt>
              <dd className="font-black">{order.orderNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-steel">{ck.payment_status}</dt>
              <dd className="font-black">{order.paymentStatus}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-steel">{ck.order_total}</dt>
              <dd className="font-black">{formatMoney(order.totalCents, order.currency)}</dd>
            </div>
          </dl>
        )}
        {sessionId && !order && (
          <p className="mt-5 break-all border border-line bg-panel p-3 text-sm font-bold">
            Session ID: {sessionId}
          </p>
        )}
        {paid && order && (
          <div className="mt-6 border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-sm font-bold text-green-800">{ck.whatsapp_note}</p>
            <a
              href={whatsappLink(`Hello, I just placed order ${order.orderNumber}. Please confirm shipping details.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-10 items-center gap-2 bg-green-700 px-4 text-sm font-black text-white hover:bg-green-800"
            >
              <MessageCircle size={16} /> {ck.whatsapp_btn}
            </a>
          </div>
        )}
        {!paid && (
          <div className="mt-6 border border-line bg-panel p-4 text-center text-sm text-steel">
            {ck.questions}{" "}
            <a href={whatsappLink(GENERAL_INQUIRY_MESSAGE)} target="_blank" rel="noopener noreferrer" className="font-bold text-navy underline-offset-2 hover:underline">
              {ck.whatsapp_link}
            </a>
            .
          </div>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
            {dict.common.continue_shopping}
          </Link>
          <Link href="/" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
            {dict.common.back_home}
          </Link>
        </div>
      </section>
    </main>
  );
}
