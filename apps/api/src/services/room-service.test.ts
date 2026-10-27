import { MAX_PARTICIPANTS, ROOM_DURATION_MS, ROOM_WAITING_TTL_MS } from "@thoth/shared";
import { describe, expect, it } from "vitest";
import { createManualClock } from "../testing/manual-clock.ts";
import { createMemoryMediaGateway } from "../testing/memory-media-gateway.ts";
import { createMemoryRoomStore } from "../testing/memory-room-store.ts";
import { createSequentialRandomSource } from "../testing/sequential-random-source.ts";
import { createRoomService } from "./room-service.ts";

function setup(slugs?: string[]) {
  const time = createManualClock();
  const store = createMemoryRoomStore(time.clock);
  const media = createMemoryMediaGateway();
  const service = createRoomService({
    store,
    media: media.gateway,
    clock: time.clock,
    random: createSequentialRandomSource(slugs),
  });
  return { time, store, media, service };
}

const start = new Date("2026-10-27T12:00:00.000Z").getTime();

describe("RoomService.create", () => {
  it("cria a sala aguardando, com link válido por 2 h, e guarda só o hash da chave", async () => {
    const { service, store } = setup();
    const { room, hostKey } = await service.create();
    expect(hostKey).toBe("chave-1");
    expect(room).toMatchObject({ slug: "abcdefghij", status: "waiting", startedAt: null });
    expect(room.expiresAt.getTime()).toBe(start + ROOM_WAITING_TTL_MS);
    const stored = store.rooms.get("abcdefghij");
    expect(stored?.hostKeyHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.hostKeyHash).not.toContain(hostKey);
  });

  it("tenta outro slug se o sorteado já existe", async () => {
    const { service } = setup(["abcdefghij", "abcdefghij", "klmnopqrst"]);
    await service.create();
    const { room } = await service.create();
    expect(room.slug).toBe("klmnopqrst");
  });
});

describe("RoomService.get", () => {
  it("devolve ROOM_NOT_FOUND para sala inexistente", async () => {
    const { service } = setup();
    await expect(service.get("naoexisteu")).rejects.toMatchObject({
      code: "ROOM_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("devolve ROOM_NOT_FOUND quando o link de 2 h vence sem ninguém entrar", async () => {
    const { service, time } = setup();
    await service.create();
    time.advance(ROOM_WAITING_TTL_MS);
    await expect(service.get("abcdefghij")).rejects.toMatchObject({ code: "ROOM_NOT_FOUND" });
  });
});

describe("RoomService.join", () => {
  it("na primeira entrada fixa o relógio de 20 min, cria a sala no LiveKit e emite o token", async () => {
    const { service, media, time } = setup();
    await service.create();
    time.advance(5 * 60 * 1000);

    const result = await service.join("abcdefghij", { name: "Ana" });

    const startedAt = start + 5 * 60 * 1000;
    expect(result.room.status).toBe("active");
    expect(result.room.startedAt?.getTime()).toBe(startedAt);
    expect(result.room.expiresAt.getTime()).toBe(startedAt + ROOM_DURATION_MS);
    expect(result).toMatchObject({ token: "token-p_1", identity: "p_1", isHost: false });
    expect(media.rooms.has("abcdefghij")).toBe(true);
    expect(media.tokens[0]).toEqual({
      slug: "abcdefghij",
      identity: "p_1",
      name: "Ana",
      isHost: false,
      ttlSeconds: ROOM_DURATION_MS / 1000,
    });
  });

  it("a segunda entrada não mexe no relógio e o token vale só até o fim da sala", async () => {
    const { service, media, time } = setup();
    await service.create();
    const first = await service.join("abcdefghij", { name: "Ana" });
    time.advance(60_000);

    const second = await service.join("abcdefghij", { name: "Bia" });

    expect(second.room.startedAt).toEqual(first.room.startedAt);
    expect(second.room.expiresAt).toEqual(first.room.expiresAt);
    expect(media.tokens[1]?.ttlSeconds).toBe(ROOM_DURATION_MS / 1000 - 60);
  });

  it("recusa a entrada depois dos 20 minutos", async () => {
    const { service, time } = setup();
    await service.create();
    await service.join("abcdefghij", { name: "Ana" });
    time.advance(ROOM_DURATION_MS);
    await expect(service.join("abcdefghij", { name: "Bia" })).rejects.toMatchObject({
      code: "ROOM_NOT_FOUND",
    });
  });

  it("recusa a nona pessoa com ROOM_FULL", async () => {
    const { service, media } = setup();
    await service.create();
    await service.join("abcdefghij", { name: "Ana" });
    media.participants.set("abcdefghij", MAX_PARTICIPANTS);
    await expect(service.join("abcdefghij", { name: "Bia" })).rejects.toMatchObject({
      code: "ROOM_FULL",
      statusCode: 409,
    });
  });

  it("marca como criador só quem traz a chave certa", async () => {
    const { service } = setup();
    const { hostKey } = await service.create();
    expect((await service.join("abcdefghij", { name: "Ana", hostKey })).isHost).toBe(true);
    expect((await service.join("abcdefghij", { name: "Bia", hostKey: "chave-errada" })).isHost).toBe(false);
    expect((await service.join("abcdefghij", { name: "Caio" })).isHost).toBe(false);
  });

  it("recusa sala inexistente sem criar nada no LiveKit", async () => {
    const { service, media } = setup();
    await expect(service.join("naoexisteu", { name: "Ana" })).rejects.toMatchObject({
      code: "ROOM_NOT_FOUND",
    });
    expect(media.rooms.size).toBe(0);
  });
});
