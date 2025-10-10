export const runtime = "edge";

export default function OfflineFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <h1 className="text-3xl font-semibold">Você está offline</h1>
      <p className="max-w-xl text-muted-foreground">
        Continue explorando os conteúdos já sincronizados. Quando a conexão
        retornar, dados de progresso e novos materiais serão atualizados
        automaticamente.
      </p>
      <p className="text-sm text-muted-foreground">
        Dica: modos Sprint e Revisão SRS funcionam em cache, mas uploads e
        analytics exigem conexão.
      </p>
    </main>
  );
}
