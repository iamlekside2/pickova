import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Hero artwork: a real sneaker photo (background removed) with the brand's speed lines and golden glow. */
function HeroSneaker() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[36rem]" aria-hidden="true">
      {/* golden-orange glow */}
      <div className="absolute left-1/2 top-[46%] size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/40 blur-[70px]" />
      <div className="absolute left-1/2 top-[46%] size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/50 blur-[40px]" />
      {/* speed lines */}
      <div className="absolute left-[2%] top-[30%] flex w-[38%] -rotate-[14deg] flex-col items-end gap-[0.9vw] lg:gap-3.5">
        <span className="h-3 w-[70%] rounded-full bg-gradient-to-r from-orange/0 via-orange to-orange-300 shadow-glow sm:h-4" />
        <span className="mr-[14%] h-3 w-[78%] rounded-full bg-gradient-to-r from-orange/0 via-orange to-orange-300 shadow-glow sm:h-4" />
        <span className="mr-[30%] h-3 w-[66%] rounded-full bg-gradient-to-r from-orange/0 via-orange to-orange-300 shadow-glow sm:h-4" />
      </div>
      {/* pedestal */}
      <div className="absolute bottom-[4%] left-1/2 h-[20%] w-[86%] -translate-x-1/2">
        <div className="absolute inset-x-0 top-0 h-[55%] rounded-[50%] bg-gradient-to-b from-navy-500 to-navy-700 ring-1 ring-white/10" />
        <div className="absolute inset-x-0 bottom-0 top-[27%] rounded-b-[45%] bg-gradient-to-b from-navy-800 to-navy-900" />
        <div className="absolute inset-x-0 top-0 h-[55%] rounded-[50%] bg-gradient-to-b from-orange/25 to-transparent" />
      </div>
      <Image
        src="/brand/hero-sneaker.webp"
        alt=""
        width={1100}
        height={534}
        priority
        sizes="(min-width: 1024px) 36rem, 92vw"
        className="absolute inset-x-[2%] top-[14%] h-auto w-[96%] animate-float drop-shadow-[0_24px_30px_rgba(242,140,40,0.5)]"
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-800 text-white">
      {/* background: depth + brand curve */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_70%_40%,#27375A_0%,#14213D_55%,#0D172D_100%)]" />
      <div className="absolute -bottom-36 -right-28 -z-10 size-[20rem] rounded-full bg-orange sm:-bottom-40 sm:-right-32 sm:size-[30rem] lg:-bottom-56 lg:-right-40 lg:size-[38rem]" aria-hidden />
      <p className="pointer-events-none absolute right-6 top-10 -z-10 hidden select-none text-[7rem] font-bold lowercase leading-none tracking-[-0.045em] text-white/[0.05] xl:block" aria-hidden>
        pickova
      </p>

      <div className="container-page grid items-center gap-6 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28 lg:pt-16">
        <div className="animate-fade-up">
          <p className="inline-flex items-center rounded-full bg-orange px-4 py-1.5 text-sm font-semibold text-white shadow-glow">
            Pick your pair.
          </p>
          <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.02] text-white sm:text-6xl lg:text-[4.5rem]">
            Step Up <br className="hidden sm:block" />
            Your <span className="bg-gradient-to-r from-orange to-[#FFB23F] bg-clip-text text-transparent">Style</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Discover everyday sneakers and casual shoes that bring comfort, confidence and style together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary h-[3.25rem] px-8 text-base">
              Shop Now <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link href="#collections" className="btn-ghost-light h-[3.25rem] px-8 text-base">
              Explore Collections
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/60">Real shoes. Real photos. Fast delivery across Nigeria.</p>
        </div>
        <HeroSneaker />
      </div>

      {/* soft curve into the page */}
      <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[2rem] bg-offwhite" aria-hidden />
    </section>
  );
}
