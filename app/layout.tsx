import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./providers/QueryProvider";
import localFont from "next/font/local";
import {getLocale} from 'next-intl/server';
import { NextIntlClientProvider } from "next-intl";

const MyFont = localFont({
  src: [
    {
      path: "../public/font/Prompt/Prompt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/Prompt/Prompt-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/Prompt/Prompt-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/font/Prompt/Prompt-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/font/Prompt/Prompt-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/font/Prompt/Prompt-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-prompt",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "DocAider - Your AI Document Assistant",
    template: "%s | DocAider",
  },
  description: "AI-Powered Document & Data Platform",
  keywords:
    "document analysis, AI assistant, text analysis, data visualization, document processing, AI-powered document analysis, AI-powered data visualization, AI-powered document processing",
  authors: [
    {
      name: "Pasupol Bunsaen",
      url: "https://pasupolworks.com",
    },
  ],
  creator: "Pasupol Bunsaen",
  publisher: "DocAider",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DocAider - Your AI Document Assistant",
    description: "AI-Powered Document & Data Platform",
    url: "https://docaider.com",
    siteName: "DocAider",
    images: [
      {
        url: "https://docaider.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocAider Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocAider - Your AI Document Assistant",
    description: "AI-Powered Document & Data Platform",
    images: ["https://docaider.com/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE",
    yandex: "YOUR_YANDEX_VERIFICATION_CODE",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Load messages for the current locale
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${MyFont.className} antialiased bg-zinc-900`}>
        <QueryProvider>
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
