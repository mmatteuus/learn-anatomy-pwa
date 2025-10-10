import { test, expect } from "@playwright/test";

test.describe("JGAnatomia login gate", () => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL,
    "Executar `npm run dev` e definir PLAYWRIGHT_BASE_URL antes de rodar o E2E.",
  );

  test("bloqueia acesso a level protegido sem login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Campanha" }).click();
    await page.getByRole("link", { name: /Level 2/i }).click();

    await expect(page).toHaveURL(/auth\/sign-in/);
    await expect(
      page.getByText(
        "Faça login para desbloquear fases avançadas e salvar seu progresso.",
      ),
    ).toBeVisible();
  });

  test("mostra fase demo sem exigir autenticacao", async ({ page }) => {
    await page.goto("/play/demo");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Level 1 (Demo)",
    );
  });
});
