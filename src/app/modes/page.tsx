export const metadata = {
  title: "Modos de jogo",
};

export default function ModesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Modos de jogo</h1>
        <p className="text-muted-foreground">
          Explore o sprint cronometrado ou acompanhe as novidades sobre OSCE,
          revisao SRS e o explorador 3D. Cada modo ganha telemetria e regras
          proprias conforme evoluimos o roadmap.
        </p>
      </header>
      <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>
          O modo Sprint ja esta disponivel com pontuacao e streak. OSCE,
          Revisao SRS e Explorar 3D receberao atualizacoes nas etapas
          seguintes.
        </p>
      </div>
    </div>
  );
}
