import { describe, expect, it } from "vitest";
import { buildApp } from "./app.ts";
import { loadConfig } from "./config.ts";

const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" });
const fixedClock = { now: () => new Date("2026-10-26T12:00:00.000Z") };

describe("GET /health", () => {
  it("responde ok com a hora do servidor", async () => {
    const app = buildApp(config, { clock: fixedClock });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", serverNow: "2026-10-26T12:00:00.000Z" });
  });
});

describe("rota inexistente", () => {
  it("devolve o formato padrão de erro", async () => {
    const app = buildApp(config);
    const res = await app.inject({ method: "GET", url: "/nao-existe" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: { code: "NOT_FOUND", message: "Rota não encontrada" } });
  });
});
