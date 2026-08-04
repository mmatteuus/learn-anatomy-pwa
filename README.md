# JG Anatomia

PWA educacional gamificada para o estudo de anatomia humana. A aplicação combina trilhas de aprendizagem, questões interativas, acompanhamento de progresso e suporte offline.

## Destaques

- experiência liberada para visitantes na primeira fase;
- autenticação e sincronização de progresso com Supabase;
- módulos, níveis e modo Sprint cronometrado;
- biblioteca para envio de PDFs, imagens e links de estudo;
- funcionamento como PWA, com instalação e fallback offline;
- interface responsiva, acessível e preparada para toque;
- testes de fluxo com Playwright;
- banco PostgreSQL protegido por Row Level Security.

## Stack

- Next.js 15 e App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Supabase Auth, PostgreSQL, Storage e Edge Functions
- Playwright

## Executando localmente

### Requisitos

- Node.js 18+
- npm 10+
- projeto Supabase para autenticação e persistência

### Instalação

```bash
git clone https://github.com/mmatteuus/learn-anatomy-pwa.git
cd learn-anatomy-pwa
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

A chave `SUPABASE_SERVICE_ROLE_KEY` deve ser utilizada exclusivamente no servidor.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## Arquitetura resumida

```text
src/app/                 rotas e páginas
src/components/          componentes e experiência de jogo
src/components/providers sincronização e providers globais
src/stores/              estado e progresso local
supabase/migrations/     schema, políticas RLS e dados iniciais
supabase/functions/      funções executadas no backend
 tests/                  cenários E2E
```

## Funcionalidades implementadas

- cadastro, login, confirmação e encerramento de sessão;
- bloqueio de fases avançadas para visitantes;
- quiz com feedback, explicações e nível de confiança;
- persistência local e sincronização após autenticação;
- telemetria de tentativas e progresso;
- modo Sprint com pontuação, sequência e cronômetro;
- upload seguro e URLs assinadas para conteúdos de estudo;
- service worker, manifest e estratégia de cache;
- alto contraste, suporte a daltonismo, foco visível e alvos de toque acessíveis.

## Próximas evoluções

- questões interativas do tipo hotspot e identificação por imagem;
- pipeline de geração de questões a partir de conteúdos enviados;
- ranking, revisão espaçada e novos modos de jogo;
- automação de métricas Lighthouse em CI.

---

Projeto de portfólio desenvolvido por Mateus Ferreira Lopes.