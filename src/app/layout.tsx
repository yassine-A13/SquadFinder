import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import { Providers } from "@/components/shared/providers";
import Navbar from "@/components/shared/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "TeamMatch", template: "%s | TeamMatch" },
  description: "Trouve ton equipe, rassemble les bons joueurs et organise tes prochains matchs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${sora.variable}`}>
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
