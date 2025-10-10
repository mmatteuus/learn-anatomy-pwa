import type { MetadataRoute } from "next";

const SITE_NAME = "JGAnatomia";
const SITE_DESCRIPTION =
  "Plataforma PWA de anatomia com fases gamificadas, conteúdo adaptativo e integrações Supabase.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "JGAnatomia",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0B1120",
    theme_color: "#3B5AFE",
    lang: "pt-BR",
    orientation: "any",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/icons/icon-152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/icons/icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Continuar Campanha",
        url: "/play",
        description: "Retome a progressão das fases.",
      },
      {
        name: "Modo Sprint",
        url: "/modes/sprint",
        description: "Sessões rápidas com tempo cronometrado.",
      },
      {
        name: "Biblioteca de Conteúdo",
        url: "/content",
        description: "Gerencie PDFs, imagens e links de estudo.",
      },
    ],
  };
}
