import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoutineNest",
  description: "Routines + AAC communication app for children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="sticky top-0 z-50 border-b bg-background">
          <div className="mx-auto flex h-14 max-w-screen-xl items-center px-4">
            <span className="text-lg font-bold tracking-tight">
              RoutineNest
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-screen-xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
