import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hello Poor! - Laga gott, spara pengar",
  description:
    "Hitta recept som matchar veckans ICA-erbjudanden. V\u00E4lj din butik, se vad som \u00E4r p\u00E5 rea, och f\u00E5 receptf\u00F6rslag som sparar pengar!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
