import { expect, test } from "@playwright/test";

test("página inicial abre e encontra a API", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Compartilhe sua tela em segundos" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Servidor online");
});

test("rota desconhecida mostra página não encontrada", async ({ page }) => {
  await page.goto("/qualquer-coisa");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
