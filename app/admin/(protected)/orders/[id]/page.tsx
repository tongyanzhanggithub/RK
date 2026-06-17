import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resendConfirmationEmail, resendRefundEmail, resendShippingEmail, updateOrder } from "@/app/admin/(protected)/orders/actions";
import { OrderManagementForm } from "@/app/admin/(protected)/orders/order-management-form";
import { zhLabel, ORDER_PAYMENT_STATUS, ORDER_STATUS, FULFILLMENT_STATUS } from "@/lib/admin-status";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "订单详情",
  description: "查看并更新订单履约信息。"
};

export default async function AdminOrderDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string; mail?: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });

  if (!order) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">订单</p>
          <h1 className="text-4xl font-black">{order.orderNumber}</h1>
          <p className="mt-3 text-steel">创建时间 {order.createdAt.toLocaleString("zh-CN")}</p>
        </div>
        <Link href="/admin/orders" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回订单列表
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <InfoPanel title="基本信息">
            <Info label="订单号" value={order.orderNumber} />
            <Info label="客户姓名" value={order.customerName} />
            <Info label="邮箱" value={order.customerEmail} />
            <Info label="电话" value={order.customerPhone || "-"} />
            <Info label="WhatsApp" value={order.customerWhatsapp || "-"} />
            <Info label="国家" value={order.country} />
            {order.customerId && (
              <div className="border-b border-line py-3 text-sm">
                <Link href={`/admin/customers/${order.customerId}`} className="font-black text-navy">打开客户档案</Link>
              </div>
            )}
          </InfoPanel>

          <InfoPanel title="支付信息">
            <Info label="支付方式" value={order.paymentMethod} />
            <Info label="支付状态" value={zhLabel(ORDER_PAYMENT_STATUS, order.paymentStatus)} />
            <Info label="Stripe 结账会话" value={order.stripeCheckoutSessionId || "-"} />
            <Info label="Stripe 支付意图" value={order.stripePaymentIntentId || "-"} />
            <Info label="已付金额" value={formatMoney(order.totalCents, order.currency)} />
            <Info label="已退金额" value={formatMoney(order.refundedCents, order.currency)} />
            <Info label="支付时间" value={order.paidAt ? order.paidAt.toLocaleString("zh-CN") : "-"} />
            <Info label="支付失败原因" value={order.paymentFailureMessage || "-"} />
            <Info label="最近 Stripe 事件" value={order.stripeLastEventType || "-"} />
            <Info label="最近 Stripe 事件 ID" value={order.stripeLastEventId || "-"} />
            <Info label="最近 Stripe 同步" value={order.stripeLastSyncedAt ? order.stripeLastSyncedAt.toLocaleString("zh-CN") : "-"} />
          </InfoPanel>

          <InfoPanel title="收货地址">
            <Info label="姓名" value={order.customerName} />
            <Info label="电话" value={order.customerPhone || "-"} />
            <Info label="国家" value={order.country} />
            <Info label="城市" value={order.city || "-"} />
            <Info label="地址" value={order.shippingAddress || "-"} />
            <Info label="邮编" value={order.postalCode || "-"} />
          </InfoPanel>

          <section className="overflow-x-auto border border-line bg-white">
            <div className="border-b border-line p-5">
              <h2 className="text-xl font-black">订单商品</h2>
            </div>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase text-steel">
                <tr>
                  <th className="p-3">商品</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">单价</th>
                  <th className="p-3">数量</th>
                  <th className="p-3">小计</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="p-3">
                      <Link href={`/products/${item.productSlug}`} className="font-black text-navy">{item.productName}</Link>
                    </td>
                    <td className="p-3">{item.sku}</td>
                    <td className="p-3">{formatMoney(item.unitPriceCents, order.currency)}</td>
                    <td className="p-3 font-black">{item.quantity}</td>
                    <td className="p-3 font-black">{formatMoney(item.subtotalCents, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <InfoPanel title="金额明细">
            <Info label="小计" value={formatMoney(order.subtotalCents, order.currency)} />
            <Info label="运费" value={formatMoney(order.shippingCents, order.currency)} />
            <Info label="预估税费" value={formatMoney(order.taxCents, order.currency)} />
            <Info label="优惠券" value={order.couponCode ? `${order.couponCode} / ${order.couponType || "-"}` : "-"} />
            <Info label="折扣" value={`-${formatMoney(order.discountCents, order.currency)}`} />
            <Info label="合计" value={formatMoney(order.totalCents, order.currency)} strong />
          </InfoPanel>
        </div>

        <aside className="grid h-fit gap-6">
          <OrderManagementForm order={order} action={updateOrder.bind(null, order.id)} saved={searchParams?.saved === "1"} />

          <section className="border border-line bg-white">
            <div className="border-b border-line p-5">
              <h2 className="text-xl font-black">客户邮件</h2>
            </div>
            <div className="grid gap-4 p-5 text-sm">
              {searchParams?.mail === "confirmation" && (
                <p className="border border-green-200 bg-green-50 p-3 font-bold text-green-800">确认邮件已重新发送。</p>
              )}
              {searchParams?.mail === "shipping" && (
                <p className="border border-green-200 bg-green-50 p-3 font-bold text-green-800">发货邮件已重新发送。</p>
              )}
              {searchParams?.mail === "refund" && (
                <p className="border border-green-200 bg-green-50 p-3 font-bold text-green-800">退款邮件已重新发送。</p>
              )}
              {searchParams?.mail === "nosmtp" && (
                <p className="border border-red-200 bg-red-50 p-3 font-bold text-red-800">
                  未配置 SMTP —— 请在 .env 中设置 SMTP_HOST 以启用邮件发送。
                </p>
              )}
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div>
                  <strong className="block">订单确认</strong>
                  <span className="text-xs text-steel">
                    {order.confirmationEmailSentAt
                      ? `已发送 ${order.confirmationEmailSentAt.toLocaleString("zh-CN")}`
                      : "尚未发送"}
                  </span>
                </div>
                <form action={resendConfirmationEmail.bind(null, order.id)}>
                  <button type="submit" className="font-black text-navy hover:underline" disabled={order.paymentStatus !== "PAID"}>
                    {order.paymentStatus === "PAID" ? "重新发送" : "需已支付(PAID)"}
                  </button>
                </form>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <strong className="block">发货通知</strong>
                  <span className="text-xs text-steel">
                    {order.shippingEmailSentAt
                      ? `已发送 ${order.shippingEmailSentAt.toLocaleString("zh-CN")}`
                      : "尚未发送"}
                  </span>
                </div>
                <form action={resendShippingEmail.bind(null, order.id)}>
                  <button type="submit" className="font-black text-navy hover:underline">
                    重新发送
                  </button>
                </form>
              </div>
              {order.refundedCents > 0 && (
                <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <div>
                    <strong className="block">退款通知</strong>
                    <span className="text-xs text-steel">
                      {order.refundEmailSentAt
                        ? `已发送 ${order.refundEmailSentAt.toLocaleString("zh-CN")}`
                        : "尚未发送"}
                    </span>
                  </div>
                  <form action={resendRefundEmail.bind(null, order.id)}>
                    <button type="submit" className="font-black text-navy hover:underline">
                      重新发送
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
          <InfoPanel title="物流概览">
            <Info label="订单状态" value={zhLabel(ORDER_STATUS, order.orderStatus)} />
            <Info label="履约" value={zhLabel(FULFILLMENT_STATUS, order.fulfillmentStatus)} />
            <Info label="承运商" value={order.shippingCarrier || "-"} />
            <Info label="物流单号" value={order.trackingNumber || "-"} />
            <Info label="物流链接" value={order.trackingUrl || "-"} />
            <Info label="发货时间" value={order.shippedAt ? order.shippedAt.toLocaleString("zh-CN") : "-"} />
          </InfoPanel>
        </aside>
      </section>
    </main>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <dl className="grid gap-0 p-5">{children}</dl>
    </section>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-2 border-b border-line py-3 text-sm md:grid-cols-[180px_1fr]">
      <dt className="font-bold text-steel">{label}</dt>
      <dd className={`${strong ? "text-lg font-black" : "font-bold"} break-words`}>{value}</dd>
    </div>
  );
}
