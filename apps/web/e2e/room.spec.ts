import { type Browser, expect, type Page, test } from "@playwright/test";

// Precisa do LiveKit de verdade: no CI ele sobe antes dos testes; localmente, pelo docker compose.

async function join(page: Page, name: string) {
  await page.getByLabel("Seu nome").fill(name);
  await page.getByRole("button", { name: "Entrar" }).click();
  return page.getByRole("list", { name: "Participantes" });
}

async function newPage(browser: Browser) {
  const context = await browser.newContext();
  return context.newPage();
}

test("criar sala e entrar com duas pessoas", async ({ browser }) => {
  const host = await newPage(browser);
  await host.goto("/");
  await host.getByRole("button", { name: "Criar sala" }).click();
  await expect(host).toHaveURL(/\/r\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/);

  const hostList = await join(host, "Ana");
  const ana = hostList.getByRole("listitem").filter({ hasText: "Ana" });
  await expect(ana).toContainText("você");
  await expect(ana).toContainText("criador");

  const guest = await newPage(browser);
  await guest.goto(host.url());
  const guestList = await join(guest, "Bia");

  await expect(guestList.getByRole("listitem")).toHaveCount(2);
  await expect(guestList.getByRole("listitem").filter({ hasText: "Ana" })).toContainText("criador");
  const bia = guestList.getByRole("listitem").filter({ hasText: "Bia" });
  await expect(bia).toContainText("você");
  await expect(bia).not.toContainText("criador");

  await expect(hostList.getByRole("listitem")).toHaveCount(2);

  await guest.getByRole("button", { name: "Sair" }).click();
  await expect(guest.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expect(hostList.getByRole("listitem")).toHaveCount(1);
});

test("link inexistente mostra sala não encontrada", async ({ page }) => {
  await page.goto("/r/aaa-aaaa-aaa");
  await expect(page.getByRole("heading", { name: "Sala não encontrada ou encerrada" })).toBeVisible();
});
