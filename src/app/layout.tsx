import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import { NavBar } from "@/components/NavBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const viewport: Viewport = {
  themeColor: "#228b86",
};

export const metadata: Metadata = {
  title: "RoutineNest",
  description: "Routines + AAC communication app for children",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RoutineNest",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Nunito — rounded, kid-friendly, highly readable */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Plus Jakarta Sans — display font for parent dashboard & headers */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols Outlined — icon set */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <NavBar />
          <OfflineBanner />
          <main className="mx-auto max-w-screen-xl px-4 py-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </Providers>
      </body>
    </html>
  );
}
