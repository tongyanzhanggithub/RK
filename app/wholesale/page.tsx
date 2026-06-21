import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Factory, MessageCircle, Ship, Tags, Wallet } from "lucide-react";
import { WholesaleApplicationForm } from "@/app/wholesale/wholesale-application-form";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { getServerDict } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Wholesale & RFQ — Engine Parts Supplier",
  description: "Request a wholesale quote for small engine parts, repair kits and complete engines. Factory-direct from China, serving the Middle East, Central Asia and Southeast Asia."
};

export const dynamic = "force-dynamic";

export default function WholesalePage({ searchParams }: { searchParams?: { submitted?: string } }) {
  const submitted = searchParams?.submitted === "1";
  const dict = getServerDict();
  const t = dict.wholesale;
  const benefits = [
    [Factory, t.ben1_title, t.ben1_body],
    [Tags, t.ben2_title, t.ben2_body],
    [Ship, t.ben3_title, t.ben3_body],
    [Wallet, t.ben4_title, t.ben4_body]
  ] as const;
  const steps = [
    [t.wstep1_title, t.wstep1_body],
    [t.wstep2_title, t.wstep2_body],
    [t.wstep3_title, t.wstep3_body],
    [t.wstep4_title, t.wstep4_body]
  ] as const;

  return (
    <main>
      <section className="border-b border-line bg-ink px-4 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-black uppercase text-brand">{t.badge}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{t.heading}</h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 bg-brand px-5 font-black text-white"
              >
                <MessageCircle size={18} /> {t.quote_btn}
              </a>
              <a href="#application" className="inline-flex h-12 items-center gap-2 border border-white/40 px-5 font-black text-white hover:bg-white/10">
                {t.form_btn}
              </a>
            </div>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-white/75">{t.subtext}</p>
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map(([icon, title, copy]) => (
            <Benefit key={title} icon={icon} title={title} copy={copy} />
          ))}
        </div>
      </section>

      <section className="border-b border-line bg-panel px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map(([title, copy]) => (
              <div key={title} className="border border-line bg-white p-6">
                <strong className="block text-lg">{title}</strong>
                <p className="mt-2 text-sm leading-6 text-steel">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 border border-navy bg-white p-5">
            <span className="mt-0.5 shrink-0 bg-brand px-2 py-1 text-xs font-black uppercase text-white">{t.sample_badge}</span>
            <p className="text-sm font-bold leading-6">
              {t.sample_text}
              <a href="/products" className="text-navy underline">{t.sample_link}</a>
              {t.sample_text2}
            </p>
          </div>
        </div>
      </section>

      <section id="application" className="px-4 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[380px_1fr]">
          <aside>
            <p className="font-black uppercase text-brand">{t.form_badge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.form_heading}</h2>
            <p className="mt-4 leading-7 text-steel">{t.form_sub}</p>
            <div className="mt-8 border-y border-line py-5 text-sm leading-6 text-steel">{t.form_chat_note}</div>
            <Link href="/products" className="mt-6 inline-flex font-black text-navy">
              {t.browse_first}
            </Link>
          </aside>

          <div className="border border-line bg-white p-5 md:p-8">
            {submitted ? (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div className="max-w-xl">
                  <CheckCircle2 className="mx-auto text-green-700" size={52} />
                  <h2 className="mt-5 text-3xl font-black">{t.submitted_heading}</h2>
                  <p className="mt-4 leading-7 text-steel">{t.submitted_body}</p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link href="/products" className="inline-flex h-11 items-center bg-navy px-4 font-black text-white">{t.browse_products}</Link>
                    <Link href="/" className="inline-flex h-11 items-center border border-navy px-4 font-black text-navy">{dict.common.back_home}</Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 border-b border-line pb-5">
                  <h2 className="text-2xl font-black">{t.form_title}</h2>
                  <p className="mt-2 text-sm leading-6 text-steel">{t.form_desc}</p>
                </div>
                <WholesaleApplicationForm />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Benefit({
  icon: Icon,
  title,
  copy
}: {
  icon: typeof Factory;
  title: string;
  copy: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <Icon className="text-navy" size={26} />
      <div>
        <strong className="block">{title}</strong>
        <p className="mt-1 text-sm leading-6 text-steel">{copy}</p>
      </div>
    </div>
  );
}
