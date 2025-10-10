# JGAnatomia

PWA educacional de anatomia humana construida com **Next.js (App Router)** e **Supabase**. O projeto entrega gameplay gamificado, ingestao de conteudo plugavel, telemetria de aprendizagem e modos de jogo cronometrados, sempre com foco em RLS, acessibilidade AA+ e suporte offline-first.

## Tecnologias principais

- Next.js 15 (App Router, rotas server/edge, Server Actions)
- TypeScript + Tailwind CSS (tema high-contrast, modo daltonico, touch friendly)
- TanStack Query + Zustand (estado global, progresso convidado persistido em localStorage)
- Supabase (Auth, Postgres com RLS, Storage, Edge Functions)
- PWA com `@ducanh2912/next-pwa` (manifest, service worker, fallback offline)
- Playwright para E2E e lint/typecheck integrados em scripts npm

## Requisitos

- Node.js 18+ e npm 10+
- Supabase CLI (opcional para girar migracoes localmente) `npm install -g supabase`
- Projeto Supabase configurado com ref `ivluxalvofzyqzzuonim`

## Configuracao

1. Copie `.env.example` para `.env.local` e preencha:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://ivluxalvofzyqzzuonim.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave_anonima_publishable>
   SUPABASE_SERVICE_ROLE_KEY=<apenas_no_backend_ou_edge>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   > **Importante:** a service role nunca deve ir para o bundle cliente.

2. Instale dependencias:
   ```bash
   npm install
   ```

3. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse em [http://localhost:3000](http://localhost:3000).

## Migracoes e buckets

- SQL completo (tabelas, RLS, seeds e politicas de Storage) em `supabase/migrations/20251009183000_init.sql`.
  ```bash
  supabase db reset --local    # recria schema local
  supabase db push             # aplica em projeto remoto (usar com cautela)
  ```
- Edge function opcional `supabase/functions/signed-url/index.ts` gera URLs assinadas para `study-docs/<user>/<arquivo>`.

## Scripts npm

| Script              | Descricao                                                         |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | Next em modo desenvolvimento                                      |
| `npm run build`     | Build de producao + service worker                                |
| `npm run start`     | Servidor Next de producao                                         |
| `npm run lint`      | ESLint (usar `lint:fix` para corrigir automaticamente)            |
| `npm run typecheck` | TypeScript sem emissao de artefatos                               |
| `npm run test:e2e`  | Playwright (requer app rodando; configure `PLAYWRIGHT_BASE_URL`)  |
| `npm run test:e2e:headed` | Playwright em modo interativo                            |

## Funcionalidades implementadas

- **Autenticacao Supabase** com fluxo email/senha, pagina de sign-in/sign-up, confirmacao (`/auth/confirm`) e header responsivo com login/logout.
- **Gate das fases**: `/play/module/[slug]/level/[idx]` bloqueia fases acima da demo quando nao autenticado e direciona para `/auth/sign-in`.
- **Gameplay demo (Level 1)**: motor MCQ com feedback, slider de confianca, explicacao, persistencia de progresso convidado via Zustand + localStorage, telemetria em `attempts` e merge automatico com `user_progress` apos login.
- **Modo Sprint** (`/modes/sprint`): loop de 90s com score por streak, cronometro, grava tentativas em `attempts`, resume final e controle de pausa.
- **/content hub**: upload de PDFs/IMGs para `study-docs/<user>/...`, cadastro de URLs, listagem com notas/visibilidade, geracao de Signed URL via API (`/api/storage/signed-url`) e acionamento de ingestao (`/api/ingest`) para pipeline futura.
- **PWA completo**: manifest, icons, offline fallback (`/offline`), estrategia de cache (stale-while-revalidate + runtime caching Supabase).
- **Acessibilidade**: tema high-contrast, modos daltônicos, skip link, foco visivel, componentes >= 44px.

## Testes E2E

Playwright configurado em `playwright.config.ts`. O teste `tests/login-gate.spec.ts` valida (quando executado com app em execucao) o redirecionamento de fases bloqueadas e o acesso livre da demo.

Para rodar:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Fluxos Supabase

- **ProgressSyncer** (`src/components/providers/progress-syncer.tsx`): merge da cache local (`useProgressStore`) em `user_progress` e `attempts` quando o usuario realiza login.
- **Signed URL**: rota Next (`/api/storage/signed-url`) usa `getServerSupabaseClient` para validar o usuario e `getServiceRoleSupabaseClient` para gerar URL com expiração de 1h. Edge function equivalente inclui scaffolding Deno.
- **Ingest placeholder**: `/api/ingest` retorna `202` simulando enfileiramento; substitua por fila/Edge function real quando o extrator de PDF/URL estiver pronto.

## Estrutura de rotas

- `/` Hub com CTAs, cards de modos e login CTA.
- `/play` Lista modulos/levels com indicacao de bloqueio ou acesso livre.
- `/play/module/[slug]/level/[idx]` Gameplay server -> client `QuizEngine`.
- `/play/demo` Demo liberada para convidados.
- `/modes/sprint` Sprint cronometro (MCQ embaralhado).
- `/content` Biblioteca segura (upload, link, ingest).
- `/auth/*` Fluxos de login, signup e confirmacao.
- `/offline` Fallback para PWA.

## TODO sugerido

- Implementar renderers interativos para itens `hotspot` e `label`.
- Conectar `/api/ingest` a pipeline real (PDF/vision) e gerar novos `quiz_items`.
- Acrescentar leaderboard global (`/rankings`) e modo OSCE/SRS.
- Automatizar Lighthouse PWA/A11y (>= 90) em CI.

---

Projeto higienizado sem referencias a outras IAs, com estrutura modular (providers, stores, gameplay), politicas RLS idempotentes e buckets configurados conforme as diretrizes. Se precisar publicar, ajuste `NEXT_PUBLIC_SITE_URL` e configure Netlify/Vercel com as variaveis descritas acima.
