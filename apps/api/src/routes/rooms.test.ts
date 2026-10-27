import { MAX_PARTICIPANTS, ROOM_DURATION_MS } from "@thoth/shared";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "../testing/test-app.ts";

async function createRoom(app: ReturnType<typeof buildTestApp>["app"]) {
  const res = await app.inject({ method: "POST", url: "/rooms" });
  return res.json() as { slug: string; hostKey: string; expiresAt: string };
}

describe("POST /rooms", () => {
  it("cria a sala e devolve slug, chave de criador e validade do link", async () => {
    const { app } = buildTestApp();
    const res = await app.inject({ method: "POST", url: "/rooms" });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      slug: "abcdefghij",
      hostKey: "chave-1",
      expiresAt: "2026-10-27T14:00:00.000Z",
    });
  });
});

describe("GET /rooms/:slug", () => {
  it("devolve o estado da sala, aceitando o slug com hífens", async () => {
    const { app } = buildTestApp();
    await createRoom(app);
    const res = await app.inject({ method: "GET", url: "/rooms/abc-defg-hij" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      slug: "abcdefghij",
      status: "waiting",
      startedAt: null,
      expiresAt: "2026-10-27T14:00:00.000Z",
      serverNow: "2026-10-27T12:00:00.000Z",
    });
  });

  it("responde 404 ROOM_NOT_FOUND para sala inexistente", async () => {
    const { app } = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/rooms/naoexisteu" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: { code: "ROOM_NOT_FOUND", message: "Sala não encontrada ou encerrada" },
    });
  });

  it("responde 400 para slug em formato inválido", async () => {
    const { app } = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/rooms/curto" });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("VALIDATION_FAILED");
  });
});

describe("POST /rooms/:slug/token", () => {
  it("emite o token com o endereço do LiveKit e fixa o relógio da sala", async () => {
    const { app, time } = buildTestApp();
    const { hostKey } = await createRoom(app);
    time.advance(60_000);

    const res = await app.inject({
      method: "POST",
      url: "/rooms/abcdefghij/token",
      payload: { name: "  Ana  ", hostKey },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      token: "token-p_1",
      livekitUrl: "ws://livekit.test",
      identity: "p_1",
      isHost: true,
      expiresAt: new Date(Date.parse("2026-10-27T12:01:00.000Z") + ROOM_DURATION_MS).toISOString(),
      serverNow: "2026-10-27T12:01:00.000Z",
    });
    const status = await app.inject({ method: "GET", url: "/rooms/abcdefghij" });
    expect(status.json()).toMatchObject({ status: "active", startedAt: "2026-10-27T12:01:00.000Z" });
  });

  it("normaliza o nome antes de emitir o token", async () => {
    const { app, media } = buildTestApp();
    await createRoom(app);
    await app.inject({ method: "POST", url: "/rooms/abcdefghij/token", payload: { name: "  Ana   Maria " } });
    expect(media.tokens[0]?.name).toBe("Ana Maria");
  });

  it.each([{}, { name: "" }, { name: "<b>" }, { name: "a".repeat(31) }])(
    "responde 400 VALIDATION_FAILED para %j",
    async (payload) => {
      const { app } = buildTestApp();
      await createRoom(app);
      const res = await app.inject({ method: "POST", url: "/rooms/abcdefghij/token", payload });
      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe("VALIDATION_FAILED");
    },
  );

  it("responde 404 para sala inexistente", async () => {
    const { app } = buildTestApp();
    const res = await app.inject({
      method: "POST",
      url: "/rooms/naoexisteu/token",
      payload: { name: "Ana" },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("ROOM_NOT_FOUND");
  });

  it("responde 409 ROOM_FULL quando a sala tem 8 pessoas", async () => {
    const { app, media } = buildTestApp();
    await createRoom(app);
    await app.inject({ method: "POST", url: "/rooms/abcdefghij/token", payload: { name: "Ana" } });
    media.participants.set("abcdefghij", MAX_PARTICIPANTS);
    const res = await app.inject({
      method: "POST",
      url: "/rooms/abcdefghij/token",
      payload: { name: "Bia" },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: { code: "ROOM_FULL", message: "A sala está cheia" } });
  });
});
