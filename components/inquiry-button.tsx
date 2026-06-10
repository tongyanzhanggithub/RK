import { MessageCircle } from "lucide-react";
import { productInquiryMessage, whatsappLink } from "@/lib/contact";

type InquiryButtonProps = {
  name: string;
  sku?: string;
  url?: string;
  className?: string;
  label?: string;
};

export function InquiryButton({ name, sku, url, className = "", label = "Get Wholesale Price" }: InquiryButtonProps) {
  return (
    <a
      href={whatsappLink(productInquiryMessage({ name, sku, url }))}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-11 items-center justify-center gap-2 bg-[#25D366] px-4 font-black text-white transition hover:brightness-95 ${className}`}
    >
      <MessageCircle size={18} /> {label}
    </a>
  );
}
