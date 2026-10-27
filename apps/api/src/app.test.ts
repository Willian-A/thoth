import { describe, expect, it } from "vitest";
import { buildTestApp } from "./testing/test-app.ts";

describe("GET /health", () => {
  it("responde ok com a hora do servidor", async () => {
    const { app } = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", serverNow: "2026-10-27T12:00:00.000Z" });
  });
});

describe("rota inexistente", () => {
  it("devolve o formato padrão de erro", async () => {
    const { app } = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/nao-existe" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: { code: "NOT_FOUND", message: "Rota não encontrada" } });
  });
});
