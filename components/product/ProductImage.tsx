import clsx from "clsx";
import Image from "next/image";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** `sizes` hint for responsive photos */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Product photography in a fixed 4:3 frame. Photos (local files or Cloudinary)
 * go through next/image for resizing and modern formats.
 */
export function ProductImage({ src, alt, sizes = "(min-width: 1024px) 25vw, 50vw", priority, className }: Props) {
  const frame = clsx("relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFE7]", className);
  if (!src) {
    return (
      <div className={clsx(frame, "grid place-items-center text-xs font-medium text-navy-300")} role="img" aria-label={alt}>
        Photo coming soon
      </div>
    );
  }
  return (
    <div className={frame}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
