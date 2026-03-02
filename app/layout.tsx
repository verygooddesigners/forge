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
      <head>
        {/* Anti-flash: read theme from localStorage and set .dark before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var s = localStorage.getItem('forge-user-settings');
              var theme = 'dark'; // default matches DEFAULT_SETTINGS
              if (s) {
                var parsed = JSON.parse(s);
                if (parsed.theme) theme = parsed.theme;
              }
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (theme === 'system') {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              }
              // 'light': no class needed
            } catch(e) {
              // Fallback: default to dark
              document.documentElement.classList.add('dark');
            }
          })();
        ` }} />
      </head>
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans antialiased`}>
        <ClientInit />
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
