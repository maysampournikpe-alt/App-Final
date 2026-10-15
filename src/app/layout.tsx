import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { BRAND } from "@/config/brand";
import { PREFS_BOOT_SCRIPT } from "@/lib/prefs-boot";
import { RegisterSW } from "@/components/RegisterSW";
import { AccountSync } from "@/components/AccountSync";

export const metadata: Metadata = {
  title: { default: `${BRAND.name}: find your next step`, template: `%s · ${BRAND.name}` },
  description:
    "Opportunities, study tools and plans for middle and high school students in the Rio Grande Valley. English and Spanish.",
  applicationName: BRAND.name,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece3d0" },
    { media: "(prefers-color-scheme: dark)", color: "#111a2b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <RegisterSW />
        <AccountSync />
      </body>
    </html>
  );
}
