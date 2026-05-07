import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
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
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=optional"
        />
      </head>
      <body className="min-h-screen page-gradient text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
