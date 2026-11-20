/** Navy title band used by the information pages. */
export function PageHeader({ title, intro, eyebrow }: { title: string; intro?: string; eyebrow?: string }) {
  return (
    <header className="relative isolate overflow-hidden bg-navy text-white">
      <div className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-orange/40 blur-3xl" aria-hidden />
      <div className="container-page py-12 sm:py-16">
        {eyebrow && <p className="eyebrow !text-orange-300">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-3xl text-white sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl leading-relaxed text-white/80 sm:text-lg">{intro}</p>}
      </div>
    </header>
  );
}

/** Shown on policy pages until the owner has reviewed the wording. */
export function DraftNotice() {
  return (
    <p className="mb-8 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-navy">
      <strong className="font-semibold">Draft for review.</strong> This page is a starting template. Pickova must confirm the details
      (timelines, fees, contact details and legal wording) before launch.
    </p>
  );
}
