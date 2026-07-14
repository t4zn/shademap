import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShadeMap — Shade for Every Rider, Everywhere",
  description:
    "Find the nearest verified shade, water, and rest point during extreme heat — regardless of which delivery platform you ride for.",
  keywords: [
    "gig workers",
    "shade",
    "heat relief",
    "delivery riders",
    "Swiggy",
    "Zomato",
    "rest points",
  ],
  openGraph: {
    title: "ShadeMap — Shade for Every Rider, Everywhere",
    description:
      "No login. No brand. Just shade — for every rider, everywhere.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
