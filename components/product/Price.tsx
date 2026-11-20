import clsx from "clsx";
import { discountPercent, formatNaira } from "@/lib/shared";

type Props = { priceKobo: number; compareAtKobo?: number | null; size?: "md" | "lg"; className?: string };

export function Price({ priceKobo, compareAtKobo, size = "md", className }: Props) {
  const onSale = discountPercent(priceKobo, compareAtKobo) !== null;
  return (
    <p className={clsx("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={clsx("font-bold text-orange-600", size === "lg" ? "text-3xl" : "text-lg")}>
        {onSale && <span className="sr-only">Now </span>}
        {formatNaira(priceKobo)}
      </span>
      {onSale && (
        <span className={clsx("text-navy-300 line-through", size === "lg" ? "text-lg" : "text-sm")}>
          <span className="sr-only">Was </span>
          {formatNaira(compareAtKobo!)}
        </span>
      )}
    </p>
  );
}
