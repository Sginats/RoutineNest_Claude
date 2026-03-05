import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import { NavBar } from "@/components/NavBar";

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
      </head>
      <body className="antialiased">
        <Providers>
          <NavBar />
          <main className="mx-auto max-w-screen-xl px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
