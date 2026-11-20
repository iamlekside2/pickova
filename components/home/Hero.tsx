import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero artwork: one untouched studio photograph in a rounded frame. Nothing is
 * cut out of its background, so there are no trimmed edges; the photo's own
 * orange backdrop carries the brand colour. The orange speed lines from the
 * logo sit behind the frame.
 */
function HeroPhoto() {
  return (
    <div className="relative mx-auto w-full max-w-[38rem]" aria-hidden="true">
      {/* golden-orange glow */}
      <div className="absolute inset-[-8%] rounded-full bg-orange/30 blur-[80px]" />
      {/* speed lines */}
      <div className="absolute -left-[7%] top-[16%] flex w-[30%] flex-col items-end gap-2.5 sm:gap-3.5">
        <span className="h-2.5 w-[72%] rounded-full bg-gradient-to-r from-orange/0 to-orange sm:h-3.5" />
        <span className="mr-[16%] h-2.5 w-[84%] rounded-full bg-gradient-to-r from-orange/0 to-orange sm:h-3.5" />
        <span className="mr-[34%] h-2.5 w-[70%] rounded-full bg-gradient-to-r from-orange/0 to-orange sm:h-3.5" />
      </div>
      <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/15 sm:rounded-[2.25rem] lg:rotate-2">
        <Image
          src="/brand/hero-sneaker.jpg"
          alt=""
          width={1600}
          height={1080}
          priority
          sizes="(min-width: 1024px) 38rem, 92vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-800 text-white">
      {/* background: depth */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_70%_40%,#27375A_0%,#14213D_55%,#0D172D_100%)]" />
      <p className="pointer-events-none absolute right-6 top-6 -z-10 hidden select-none text-[7rem] font-bold lowercase leading-none tracking-[-0.045em] text-white/[0.05] xl:block" aria-hidden>
        pickova
      </p>

      <div className="container-page grid items-center gap-10 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pb-28 lg:pt-16">
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
        <HeroPhoto />
      </div>

      {/* soft curve into the page */}
      <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[2rem] bg-offwhite" aria-hidden />
    </section>
  );
}
