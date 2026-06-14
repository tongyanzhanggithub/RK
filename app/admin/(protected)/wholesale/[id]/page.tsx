import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reviewWholesaleApplication } from "@/app/admin/(protected)/wholesale/actions";
import { WholesaleReviewForm } from "@/app/admin/(protected)/wholesale/wholesale-review-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wholesale Application Detail",
  description: "Review a wholesale application."
};

export default async function AdminWholesaleDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const application = await prisma.wholesaleApplication.findUnique({
    where: { id: params.id },
    include: { customer: true }
  });
  if (!application) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Wholesale Application</p>
          <h1 className="text-4xl font-black">{application.companyName}</h1>
          <p className="mt-3 text-steel">{application.contactName} · {application.country}</p>
        </div>
        <Link href="/admin/wholesale" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Applications
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <InfoPanel title="Business Application">
            <Info label="Status" value={application.status} />
            <Info label="Company" value={application.companyName} />
            <Info label="Contact Person" value={application.contactName} />
            <Info label="Business Type" value={application.businessType} />
            <Info label="Country" value={application.country} />
            <Info label="WhatsApp" value={application.whatsapp} />
            <Info label="Email" value={application.email} />
            <Info label="Estimated Monthly Quantity" value={String(application.estimatedMonthlyQuantity ?? "-")} />
            <Info label="Products of Interest" value={readInterests(application.productInterest).join(", ")} />
            <Info label="Message" value={application.message || "-"} />
            <Info label="Submitted" value={application.createdAt.toLocaleString("en-US")} />
          </InfoPanel>

          <InfoPanel title="Review History">
            <Info label="Reviewed By" value={application.reviewedBy || "-"} />
            <Info label="Reviewed At" value={application.reviewedAt?.toLocaleString("en-US") || "-"} />
            <Info label="Notification Status" value={application.notificationStatus} />
            <Info label="Admin Note" value={application.adminNote || "-"} />
          </InfoPanel>
        </div>

        <aside className="grid h-fit gap-6">
          <section className="border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase text-steel">Linked Customer</p>
            {application.customer ? (
              <>
                <strong className="mt-3 block text-xl">{application.customer.name}</strong>
                <p className="mt-1 text-sm text-steel">{application.customer.email}</p>
                <p className="mt-3 text-sm font-black">{application.customer.role} · {application.customer.status}</p>
                <Link href={`/admin/customers/${application.customer.id}`} className="mt-5 inline-flex font-black text-navy">View Customer</Link>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-steel">No customer is linked yet. Approval will create or link one by email.</p>
            )}
          </section>

          <WholesaleReviewForm
            application={application}
            action={reviewWholesaleApplication.bind(null, application.id)}
            saved={searchParams?.saved === "1"}
          />
        </aside>
      </section>
    </main>
  );
}

function readInterests(value: string) {
  try {
    const interests = JSON.parse(value);
    return Array.isArray(interests) ? interests.filter((item) => typeof item === "string") : [value];
  } catch {
    return [value];
  }
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="text-xl font-black">{title}</h2></div><dl className="grid gap-0 p-5">{children}</dl></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-2 border-b border-line py-3 text-sm md:grid-cols-[220px_1fr]"><dt className="font-bold text-steel">{label}</dt><dd className="whitespace-pre-wrap break-words font-bold">{value}</dd></div>;
}
