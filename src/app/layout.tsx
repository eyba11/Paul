import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Outfit } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { PwaRegister } from "@/components/PwaRegister";
import { CoachProvider } from "@/lib/store";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Paul's Hybrid Coach",
  description: "Adaptive hybrid training coach for strength, running, recovery and body composition.",
  applicationName: "Paul's Hybrid Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hybrid Coach",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#070908",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased">
        <CoachProvider>
          <AppShell>{children}</AppShell>
        </CoachProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
