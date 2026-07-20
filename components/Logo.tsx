import Link from "next/link";

type LogoMarkProps = {
  size?: number;
  /** "badge" = rounded green square (header); "plain" = mark only, no box (footer on green). */
  variant?: "badge" | "plain";
  className?: string;
};

/**
 * Pickova mark — a shopping bag with a gold checkmark ("the pick, made visible").
 * SVG path data reproduced from the design handoff logo system.
 */
export function LogoMark({ size = 34, variant = "badge", className }: LogoMarkProps) {
  const bagColor = variant === "badge" ? "#FFFFFF" : "#FFFFFF";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={{ flex: "0 0 auto" }}
      aria-hidden="true"
      focusable="false"
    >
      {variant === "badge" && <rect width="64" height="64" rx="14" fill="#0A6640" />}
      <path
        d="M24,24 C24,15 40,15 40,24"
        fill="none"
        stroke={bagColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20,24 L44,24 L48,50 Q48,52 46,52 L18,52 Q16,52 16,50 Z"
        fill={bagColor}
      />
      <path
        d="M22,38 L29,46 L44,28"
        fill="none"
        stroke="#FFB300"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LogoProps = {
  size?: number;
  wordmarkSize?: number;
  variant?: "badge" | "plain";
  color?: string;
  href?: string;
};

/** Full logo lockup: mark + "Pickova" wordmark, linking home by default. */
export function Logo({
  size = 34,
  wordmarkSize = 24,
  variant = "badge",
  color = "#0A6640",
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 no-underline"
      aria-label="Pickova home"
    >
      <LogoMark size={size} variant={variant} />
      <span
        className="font-display font-extrabold"
        style={{ fontSize: wordmarkSize, letterSpacing: "-0.5px", color }}
      >
        Pickova
      </span>
    </Link>
  );
}
