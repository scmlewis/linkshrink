import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "@fontsource/material-symbols-outlined/index.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "LinkShrink - URL Shortener",
  description: "Create, manage, and analyze shortened URLs with analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen page-gradient text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
