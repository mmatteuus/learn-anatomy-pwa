export const metadata = {
  title: "Fase Demo",
};

export default function DemoLevelPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Campanha Osteologia</p>
        <h1 className="text-3xl font-bold">Level 1 (Demo)</h1>
        <p className="text-muted-foreground">
          Versao inicial da fase demonstrativa. Aqui vamos carregar itens do
          Supabase e permitir que convidados avancem antes do login obrigatorio.
        </p>
      </header>
      <section className="rounded-3xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Placeholder de gameplay. A experiencia completa sera implementada nas
          proximas iteracoes com MCQ/Hotspot/Label, feedback imediato e
          telemetria de tentativas.
        </p>
      </section>
    </div>
  );
}
