import type { Metadata } from "next";
import { Building2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  COMPANY_ADDRESS,
  COMPANY_HOURS,
  COMPANY_NAME,
  COMPANY_PHONE,
  CONTACT_EMAIL,
  GENERAL_INQUIRY_MESSAGE,
  WHATSAPP_NUMBER,
  whatsappLink
} from "@/lib/contact";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach Partavio by email or WhatsApp — we reply within one business day."
};

export default function ContactPage() {
  const L = getServerDict().legal;

  const rows: { icon: typeof Mail; label: string; value: string; href?: string }[] = [
    { icon: Building2, label: L.company_l, value: COMPANY_NAME },
    { icon: Mail, label: L.email_l, value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ...(WHATSAPP_NUMBER
      ? [{ icon: MessageCircle, label: L.whatsapp_l, value: `+${WHATSAPP_NUMBER}`, href: whatsappLink(GENERAL_INQUIRY_MESSAGE) }]
      : []),
    ...(COMPANY_PHONE ? [{ icon: Phone, label: L.phone_l, value: COMPANY_PHONE, href: `tel:${COMPANY_PHONE.replace(/\s+/g, "")}` }] : []),
    ...(COMPANY_ADDRESS ? [{ icon: MapPin, label: L.address_l, value: COMPANY_ADDRESS }] : []),
    { icon: Clock, label: L.hours_l, value: COMPANY_HOURS }
  ];

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="font-black uppercase text-safety">{L.contact_title}</p>
        <h1 className="mt-1 text-4xl font-black">{L.contact_title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-steel">{L.contact_intro}</p>

        <div className="mt-8 grid gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-3 border border-line bg-white p-4">
              <row.icon className="mt-0.5 shrink-0 text-navy" size={20} />
              <div>
                <p className="text-xs font-black uppercase text-steel">{row.label}</p>
                {row.href ? (
                  <a href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-bold text-navy hover:underline">
                    {row.value}
                  </a>
                ) : (
                  <p className="font-bold text-ink">{row.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <a
          href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center gap-2 bg-safety px-6 font-black text-ink hover:bg-amber-400"
        >
          <MessageCircle size={18} /> WhatsApp
        </a>
        <p className="mt-6 text-sm text-steel">{L.updated}</p>
      </div>
    </main>
  );
}
