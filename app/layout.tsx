import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PasswordResetHandler } from "@/components/PasswordResetHandler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RotoWrite - AI-Powered Content Creation",
  description: "Create high-quality, SEO-optimized content with AI-powered writer models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <PasswordResetHandler />
        {children}
      </body>
    </html>
  );
}
