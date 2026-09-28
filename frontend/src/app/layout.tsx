import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getBrandContext } from "@/features/brand/brand-context.resolver";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CurrencyProvider } from "@/features/currency/currency-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandContext();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
    title: {
      default: brand.name,
      template: `%s | ${brand.name}`,
    },
    description: brand.themeSettings?.heroSubtitle || "Digital product store built with Commerza.",
    icons: {
      icon: brand.faviconUrl || "/favicon.ico",
      apple: brand.faviconUrl || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = await getBrandContext();
  const themeStyles = {
    '--primary': brand.primaryColor || '#4f46e5',
    '--secondary': brand.secondaryColor || '#06b6d4',
  } as React.CSSProperties;

  return (
    <html lang="en" style={themeStyles} suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <CurrencyProvider>
          <Header brand={brand} />
          <main className="flex-1 flex flex-col bg-background text-foreground">
            {children}
          </main>
          <Footer brand={brand} />
        </CurrencyProvider>
      </body>
    </html>
  );
}
