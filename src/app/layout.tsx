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
        {children}
      </body>
    </html>
  );
}
