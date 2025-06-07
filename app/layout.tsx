import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./providers/QueryProvider";
const prompt = Prompt({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["thai"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${prompt.className} antialiased bg-zinc-900`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
