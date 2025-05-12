import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const prompt = Prompt({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["thai"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "An AI Chatbot for help you to turn your ideas into reality",
  description: "An AI Chatbot for help you to turn your ideas into reality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${prompt.className} antialiased bg-zinc-900`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
