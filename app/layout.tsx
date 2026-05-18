import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "THU Yoklama ve Değerlendirme Formu",
  description:
    "Tepebaşı Belediyesi Gençlik ve Spor Hizmetleri Müdürlüğü - Sosyal Sorumluluk Programları Sonuç Raporu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
