import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickova.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pickova — Pick the moment. Own the season.",
    template: "%s · Pickova",
  },
  description:
    "Pickova is Nigeria's seasonal shopping platform. Curated seasonal picks — Detty December, Christmas, Valentine, Back to School, Ramadan and more — delivered fast, paid secure.",
  keywords: [
    "Pickova",
    "Nigeria online shopping",
    "seasonal deals",
    "Detty December",
    "Christmas gifts Nigeria",
    "dropshipping Nigeria",
  ],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Pickova — Pick the moment. Own the season.",
    description:
      "Curated Nigerian seasonal picks, delivered fast and paid secure with Paystack.",
    url: siteUrl,
    siteName: "Pickova",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A6640",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
