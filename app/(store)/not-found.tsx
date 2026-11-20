import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-md text-navy-400">The page may have moved, or the pair may have sold out and been retired.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-primary">Shop all sneakers</Link>
        <Link href="/" className="btn-outline">Back to home</Link>
      </div>
    </div>
  );
}
