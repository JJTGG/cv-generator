import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Studio",
  description: "Create and export a professional CV."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}