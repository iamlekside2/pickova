import { FaWhatsapp } from "react-icons/fa";
import type { Product } from "@/lib/types";
import { whatsappOrderUrl } from "@/lib/jumia";

type WhatsAppButtonProps = {
  product: Pick<Product, "name" | "price">;
  className?: string;
  label?: string;
  size?: number;
};

/** Green "Order via WhatsApp" deep-link button. */
export function WhatsAppButton({
  product,
  className = "",
  label = "Order via WhatsApp",
  size = 16,
}: WhatsAppButtonProps) {
  return (
    <a
      href={whatsappOrderUrl(product)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark ${className}`}
    >
      <FaWhatsapp size={size} />
      {label}
    </a>
  );
}
