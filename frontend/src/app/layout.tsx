import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { StoreHydration } from "@/components/StoreHydration";
import { CacheManager } from "@/components/layout/CacheManager";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";

// Use Inter as a more reliable fallback font
const inter = Inter({
  variable: "--font-jakarta",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Yalla eats",
  description: "Scan QR code to view restaurant menu ",
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ConnectionStatus />
        <CacheManager />
        <StoreHydration />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
