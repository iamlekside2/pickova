import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Brand typeface: Poppins — Bold headings, Medium nav/buttons, Regular body.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3009";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Pickova — Pick your pair.", template: "%s · Pickova" },
  description:
    "Everyday sneakers and casual shoes in Nigeria. Real product photos, honest prices, secure payments and fast delivery nationwide. Pick your pair.",
  applicationName: "Pickova",
  keywords: ["Pickova", "sneakers Nigeria", "buy sneakers online Nigeria", "casual shoes", "men's sneakers", "women's sneakers", "kids shoes"],
  openGraph: {
    type: "website",
    siteName: "Pickova",
    locale: "en_NG",
    url: siteUrl,
    title: "Pickova — Pick your pair.",
    description: "Everyday sneakers and casual shoes. Real photos, honest prices and fast delivery across Nigeria.",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
