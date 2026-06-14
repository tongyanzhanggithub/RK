import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCustomer } from "@/app/admin/(protected)/customers/actions";
import { CustomerManagementForm } from "@/app/admin/(protected)/customers/customer-management-form";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Detail",
  description: "Review customer profile and order history."
};

export default async function AdminCustomerDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      wholesaleApplications: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!customer) notFound();

  const paidOrders = customer.orders.filter((order) => order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED");
  const netSpend = paidOrders.reduce((total, order) => total + order.totalCents - order.refundedCents, 0);

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Customers</p>
          <h1 className="text-4xl font-black">{customer.name}</h1>
          <p className="mt-3 text-steel">{customer.email}</p>
        </div>
        <Link href="/admin/customers" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Customers
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <InfoPanel title="Customer Profile">
            <Info label="Status" value={customer.status} />
            <Info label="Customer Role" value={customer.role} />
            <Info label="Wholesale Approved" value={customer.wholesaleApprovedAt?.toLocaleString("en-US") || "-"} />
            <Info label="Email" value={customer.email} />
            <Info label="Phone" value={customer.phone || "-"} />
            <Info label="WhatsApp" value={customer.whatsapp || "-"} />
            <Info label="Country" value={customer.country || "-"} />
            <Info label="City" value={customer.city || "-"} />
            <Info label="Address" value={customer.address || "-"} />
            <Info label="Postal Code" value={customer.postalCode || "-"} />
            <Info label="Customer Since" value={customer.createdAt.toLocaleString("en-US")} />
          </InfoPanel>

          {customer.wholesaleApplications.length > 0 && (
            <section className="overflow-x-auto border border-line bg-white">
              <div className="border-b border-line p-5"><h2 className="text-xl font-black">Wholesale Applications</h2></div>
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-panel text-xs uppercase text-steel">
                  <tr>
                    <th className="p-3">Company</th>
                    <th className="p-3">Business Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.wholesaleApplications.map((application) => (
                    <tr key={application.id} className="border-t border-line">
                      <td className="p-3 font-black">{application.companyName}</td>
                      <td className="p-3">{application.businessType}</td>
                      <td className="p-3 font-black">{application.status}</td>
                      <td className="p-3 text-xs text-steel">{application.createdAt.toLocaleString("en-US")}</td>
                      <td className="p-3"><Link href={`/admin/wholesale/${application.id}`} className="font-black text-navy">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="overflow-x-auto border border-line bg-white">
            <div className="border-b border-line p-5"><h2 className="text-xl font-black">Order History</h2></div>
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase text-steel">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Fulfillment</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <td className="p-3 font-black">{order.orderNumber}</td>
                    <td className="p-3 font-black">{formatMoney(order.totalCents, order.currency)}</td>
                    <td className="p-3">{order.paymentStatus}</td>
                    <td className="p-3">{order.fulfillmentStatus}</td>
                    <td className="p-3 text-xs text-steel">{order.createdAt.toLocaleString("en-US")}</td>
                    <td className="p-3"><Link href={`/admin/orders/${order.id}`} className="font-black text-navy">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="grid h-fit gap-6">
          <section className="grid grid-cols-2 gap-3">
            <Metric label="Orders" value={String(customer.orders.length)} />
            <Metric label="Paid Orders" value={String(paidOrders.length)} />
            <div className="col-span-2"><Metric label="Net Spend" value={formatMoney(netSpend, "usd")} /></div>
          </section>
          <CustomerManagementForm customer={customer} action={updateCustomer.bind(null, customer.id)} saved={searchParams?.saved === "1"} />
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-4"><p className="text-xs font-bold uppercase text-steel">{label}</p><strong className="mt-2 block text-2xl font-black">{value}</strong></div>;
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="text-xl font-black">{title}</h2></div><dl className="grid gap-0 p-5">{children}</dl></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-2 border-b border-line py-3 text-sm md:grid-cols-[180px_1fr]"><dt className="font-bold text-steel">{label}</dt><dd className="break-words font-bold">{value}</dd></div>;
}
