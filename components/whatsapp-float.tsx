import { MessageCircle } from "lucide-react";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp for a wholesale quote"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-black text-white shadow-soft transition hover:brightness-95"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">WhatsApp Quote</span>
    </a>
  );
}
