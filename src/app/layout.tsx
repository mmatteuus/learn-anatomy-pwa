import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SkipNavLink } from "@/components/accessibility/skip-nav";
import { SiteHeader } from "@/components/navigation/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  adjustFontFallback: true,
});

const siteUrl = "https://jganatomia.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JGAnatomia",
    template: "%s | JGAnatomia",
  },
  description:
    "Plataforma PWA de anatomia humana com foco em aprendizagem ativa, modos de jogo adaptativos e integracao com Supabase.",
  applicationName: "JGAnatomia",
  keywords: [
    "anatomia",
    "educacao medica",
    "PWA",
    "Supabase",
    "Next.js",
    "revisao inteligente",
  ],
  manifest: "/manifest.webmanifest",
  authors: [{ name: "Equipe JGAnatomia" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "JGAnatomia",
    description:
      "Estude anatomia com fluxos gamificados, revisao adaptativa e conteudo plugavel.",
    siteName: "JGAnatomia",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JGAnatomia - Plataforma de Anatomia Interativa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JGAnatomia",
    description:
      "PWA de anatomia humana com progressao por fases, modos de jogo e analytics de aprendizagem.",
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B5AFE" },
    { media: "(prefers-color-scheme: dark)", color: "#5865F2" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <SkipNavLink href="#main-content">
          Pular para o conteudo principal
        </SkipNavLink>
        <AppProviders initialSession={session}>
          <SiteHeader />
          <main
            id="main-content"
            className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10"
          >
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
