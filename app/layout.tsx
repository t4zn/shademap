import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShadeMap — AI Thermal Navigation & Smart City Cooling Grid",
  description:
    "AI-driven heat-aware navigation and open smart city cooling shelter grid for last-mile gig workers across Indian cities.",
  icons: "/favicon.ico",
  keywords: [
    "AI smart cities",
    "thermal navigation",
    "solar shadow model",
    "gig workers",
    "shade routing",
    "heat relief",
    "urban heat island",
    "Swiggy",
    "Zomato",
    "rest points",
  ],
  openGraph: {
    title: "ShadeMap — AI Thermal Navigation & Smart City Cooling Grid",
    description:
      "AI-driven heat-aware navigation and open smart city cooling shelter grid for last-mile gig workers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head></head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
