import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { ClientInit } from "@/components/ClientInit";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Forge - Editorial Command Center",
  description: "AI-powered content creation platform for sports betting and gaming content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans antialiased`}>
        <ClientInit />
        {/* Outer padding creates the floating card effect against the html gradient bg */}
        <div className="min-h-screen w-full p-6 flex items-stretch">
          <div
            className="w-full max-w-[1920px] mx-auto flex overflow-hidden"
            style={{
              height: 'calc(100vh - 48px)',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)',
            }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
