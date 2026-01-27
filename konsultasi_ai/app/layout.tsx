import type { Metadata } from "next";

import "./globals.css";

export const metadata:Metadata = {
  title: "HealthCareAI",
  description: "Tes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
