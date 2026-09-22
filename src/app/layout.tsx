import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNet WRC",
  description: "SmartNet Web Release Control",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
