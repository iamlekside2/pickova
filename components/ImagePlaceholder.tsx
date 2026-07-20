import { Package } from "lucide-react";
import type { Category } from "@/lib/types";

type ImagePlaceholderProps = {
  from: string;
  to: string;
  /** Real image URL. When provided it renders over the gradient (which acts as a fallback backdrop). */
  src?: string;
  label?: string;
  category?: Category;
  className?: string;
  iconSize?: number;
  /** Larger treatment for hero banners. */
  hero?: boolean;
};

/**
 * Renders product/hero imagery. A season-tinted gradient always sits behind the
 * photo so the tile still reads cleanly while the image loads (or if it fails).
 * Photos are free stock from the Unsplash CDN.
 */
export function ImagePlaceholder({
  from,
  to,
  src,
  label,
  category,
  className = "",
  iconSize = 26,
  hero = false,
}: ImagePlaceholderProps) {
  const alt = label ?? category ?? "Product image";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      role="img"
      aria-label={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={hero ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18) 0, transparent 40%)",
            }}
          />
          {!hero && (
            <div className="relative flex flex-col items-center gap-1.5 px-3 text-center text-white/85">
              <Package size={iconSize} strokeWidth={1.75} />
              {label && <span className="text-[11px] font-medium leading-tight">{label}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
