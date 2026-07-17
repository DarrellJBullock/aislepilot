import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProvider } from "@/lib/store/provider";

export const metadata: Metadata = {
  title: "AislePilot — Your list. Your route. Your total.",
  description:
    "A mobile-first shopping assistant for Kroger-family supermarkets. Match your list to real products, see prices and aisles, track your total, and shop by store route.",
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
      </body>
    </html>
  );
}
