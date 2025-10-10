import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";

type FeatureCard = {
  title: string;
  description: string;
  href: Route;
  icon: LucideIcon;
};

const featureCards: FeatureCard[] = [
  {
    title: "Campanhas por Sistemas",
    description:
      "Progrida por modulos de anatomia com fases que desbloqueiam desafios e chefes clinicos.",
    href: "/play",
    icon: Sparkles,
  },
  {
    title: "Modo Sprint",
    description:
      "Sessoes de 90 segundos com ranking e multiplicador por streak para revisar rapidamente.",
    href: "/modes/sprint",
    icon: Timer,
  },
  {
    title: "Conteudo Plugavel",
    description:
      "Transforme PDFs, imagens e URLs em quizzes interativos e playlists personalizadas.",
    href: "/content",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:py-20">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex h-10 items-center rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary">
            PWA + Supabase + Acessibilidade AA+
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Domine a anatomia com progressao inteligente e experiencia offline.
          </h1>
          <p className="text-lg text-muted-foreground">
            JGAnatomia reune fases guiadas, modos de jogo clinicos e ingestao de
            conteudo para construir uma jornada personalizada de estudos, mesmo
            sem conexao.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/play/demo"
              className="touch-target inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Jogar fase demo
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/modes"
              className="touch-target inline-flex items-center justify-center rounded-full border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Explorar modos
            </Link>
          </div>
        </div>
        <ul className="grid gap-4 rounded-3xl border border-border bg-gradient-to-br from-background to-muted/40 p-6 shadow-lg backdrop-blur lg:p-8">
          <li className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary-foreground">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Seguranca em primeiro lugar</p>
              <p className="text-sm text-primary-foreground/80">
                RLS e storage privados com Signed URLs gerados no edge.
              </p>
            </div>
          </li>
          <li className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Timer className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Revisao inteligente</p>
              <p className="text-sm text-muted-foreground">
                Telemetria de tentativas, confianca e tempo para sugerir
                prioridades diarias.
              </p>
            </div>
          </li>
          <li className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Acessibilidade avancada</p>
              <p className="text-sm text-muted-foreground">
                Contraste alto, modo daltonico e navegacao por teclado em todas
                as telas.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section aria-label="Principais recursos" className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Comece pelo seu objetivo</h2>
          <p className="text-muted-foreground">
            Escolha um modo de estudo para hoje ou continue de onde parou na
            campanha principal.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map(({ title, description, href, icon: Icon }) => (
            <article
              key={title}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
            >
              <div className="space-y-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Link
                href={href}
                className="mt-6 inline-flex items-center font-semibold text-primary underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Abrir modo
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
