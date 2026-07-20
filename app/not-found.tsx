import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-narrow flex-col items-center justify-center px-6 text-center">
      <LogoMark size={56} />
      <h1 className="mt-6 font-display text-3xl font-extrabold text-brand-green">
        This pick don comot
      </h1>
      <p className="mt-2 max-w-md text-brand-muted">
        The page you dey find no dey here again — maybe the season change. Make we take you
        back to the drops.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover"
      >
        Back to Pickova
      </Link>
    </div>
  );
}
