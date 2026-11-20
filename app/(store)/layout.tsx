import { STORE } from "@/data/store";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { Toaster } from "@/components/ui/Toaster";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white">
        Skip to content
      </a>
      {STORE.sampleCatalogue && (
        <p className="bg-orange-100 px-4 py-1.5 text-center text-xs font-medium text-navy">
          Preview store — listings, prices and photos shown are samples, not live Pickova stock.
        </p>
      )}
      <AnnouncementBar />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <Toaster />
      <StoreHydrator />
    </>
  );
}
