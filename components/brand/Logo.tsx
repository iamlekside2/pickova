import clsx from "clsx";
import Link from "next/link";

/**
 * Pickova logo — Option 2 from the brand board: the sneaker icon with orange
 * speed lines and the lowercase "pickova" wordmark. The icon is a vector trace
 * of the supplied artwork; do not restyle it.
 */

type Tone = "navy" | "white";

const NAVY = "#1B2A4A";
const ORANGE = "#F28C28";

export function LogoIcon({ tone = "navy", className }: { tone?: Tone; className?: string }) {
  const body = tone === "navy" ? NAVY : "#FFFFFF";
  const detail = tone === "navy" ? "#FFFFFF" : NAVY;
  return (
    <svg viewBox="90 95 800 465" className={className} aria-hidden="true" focusable="false">
      <g fill={ORANGE}>
        <rect x="183" y="263" width="174" height="32" rx="16" />
        <rect x="134" y="319" width="164" height="32" rx="16" />
        <rect x="106" y="375" width="140" height="32" rx="16" />
      </g>
      <path
        fill={body}
        d="M249,462 C238,424 262,398 304,382 C362,358 420,298 468,230 C494,192 520,142 560,123 C590,110 613,129 622,160 C631,188 668,193 690,165 C706,139 728,112 753,116 C792,125 811,190 836,250 C851,290 873,318 866,349 C861,373 840,389 812,398 L342,536 C300,547 262,522 249,462 Z"
      />
      <path
        fill={detail}
        d="M279,472 C332,464 404,440 472,412 L826,266 C834,284 836,300 829,313 L332,501 C302,507 284,494 279,472 Z"
      />
      <g stroke={detail} strokeWidth="19" strokeLinecap="round">
        <path d="M514,216 L568,240" />
        <path d="M478,254 L530,277" />
        <path d="M444,292 L494,314" />
        <path d="M408,330 L454,351" />
      </g>
    </svg>
  );
}

type LogoProps = {
  tone?: Tone;
  /** Show the "Pick your pair." tagline under the wordmark. */
  tagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
};

const SIZES = {
  sm: { icon: "h-7", word: "text-[1.45rem]", tag: "text-[0.6rem]" },
  md: { icon: "h-9", word: "text-[1.85rem]", tag: "text-[0.7rem]" },
  lg: { icon: "h-12", word: "text-[2.5rem]", tag: "text-sm" },
};

export function Logo({ tone = "navy", tagline = false, size = "md", href = "/", className }: LogoProps) {
  const s = SIZES[size];
  const content = (
    <>
      <LogoIcon tone={tone} className={clsx(s.icon, "w-auto shrink-0")} />
      <span className="flex flex-col leading-none">
        <span className={clsx(s.word, "font-bold lowercase leading-none tracking-[-0.045em]", tone === "navy" ? "text-navy" : "text-white")}>
          pickova
        </span>
        {tagline && (
          <span className={clsx(s.tag, "mt-1 self-end font-medium tracking-wide", tone === "navy" ? "text-navy" : "text-white/90")}>
            Pick your pair.
          </span>
        )}
      </span>
    </>
  );
  const classes = clsx("inline-flex items-center gap-2", className);
  if (href === null) return <span className={classes}>{content}</span>;
  return (
    <Link href={href} className={clsx(classes, "rounded-lg")} aria-label="Pickova — home">
      {content}
    </Link>
  );
}
