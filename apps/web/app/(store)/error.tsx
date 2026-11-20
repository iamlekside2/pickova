"use client";

import { useEffect } from "react";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <h1 className="text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-navy-400">We couldn&apos;t load this page. Please try again in a moment.</p>
      <button type="button" onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
