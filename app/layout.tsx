import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { ClientInit } from "@/components/ClientInit";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

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
      <head>
        {/* Anti-flash dark mode script — disabled until Dark Mode v2 is complete.
           Also clears any previously saved dark preference so users aren't stuck. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{localStorage.removeItem('forge-theme');}catch(e){}})();` }} />
      </head>
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans antialiased`}>
        <ClientInit />
        <WebVitalsReporter />
        {/* Outer padding creates the floating card effect against the html gradient bg */}
        <div className="min-h-screen w-full p-6 flex items-stretch">
          <div className="app-container w-full max-w-[1920px] mx-auto flex overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
