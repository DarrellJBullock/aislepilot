import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProvider } from "@/lib/store/provider";
import { ServiceWorkerRegister } from "@/components/app/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "AislePilot — Your list. Your route. Your total.",
  description:
    "A mobile-first shopping assistant for Kroger-family supermarkets. Match your list to real products, see prices and aisles, track your total, and shop by store route.",
  applicationName: "AislePilot",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AislePilot",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#18b365",
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
      <body className="min-h-screen bg-[var(--background)] text-ink antialiased">
        <AppProvider>{children}</AppProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
