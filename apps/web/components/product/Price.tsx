import clsx from "clsx";
import { discountPercent, formatNaira } from "@pickova/shared";

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

export function Stars({ average, count, className }: { average: number; count: number; className?: string }) {
  return (
    <p className={clsx("flex items-center gap-1.5 text-sm text-navy-500", className)}>
      <svg viewBox="0 0 20 20" className="size-4 fill-orange" aria-hidden="true">
        <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" />
      </svg>
      <span className="font-medium text-navy">{average.toFixed(1)}</span>
      <span>
        ({count}
        <span className="sr-only"> reviews</span>)
      </span>
    </p>
  );
}
