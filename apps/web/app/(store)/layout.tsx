import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { Toaster } from "@/components/ui/Toaster";
import { getBanners, getSettings } from "@/lib/catalog";

// Every storefront page reads live data from the API, so pages are rendered on
// request (API responses are still cached for 30s — see lib/catalog.ts). This
// also means the site builds without the API needing to be reachable.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [banners, settings] = await Promise.all([getBanners(), getSettings()]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white">
        Skip to content
      </a>
      {settings.sampleCatalogue && (
        <p className="bg-orange-100 px-4 py-1.5 text-center text-xs font-medium text-navy">
          Preview store — listings, prices and stock shown are samples, not live Pickova inventory.
        </p>
      )}
      <AnnouncementBar announcements={banners.filter((b) => b.placement === "ANNOUNCEMENT")} />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} />
      <Toaster />
      <StoreHydrator />
    </>
  );
}
