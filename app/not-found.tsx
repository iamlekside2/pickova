import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** Catches URLs that match no route at all (rendered outside the store layout). */
export default function RootNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16 text-center">
      <div>
        <Logo size="lg" tagline className="justify-center" />
        <p className="eyebrow mt-12">Error 404</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-4 max-w-md text-navy-400">The link may be broken, or the page may have moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">Shop all sneakers</Link>
          <Link href="/" className="btn-outline">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
