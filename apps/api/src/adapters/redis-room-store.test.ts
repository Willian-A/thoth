import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Room } from "../ports/room-store.ts";
import { createRedisRoomStore } from "./redis-room-store.ts";

// Teste de integração: precisa de um Redis de verdade (docker compose local ou serviço do CI).
const prefix = `test:${randomUUID()}:`;
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { keyPrefix: prefix });
const store = createRedisRoomStore(redis);

const now = Date.now();
const twoHours = 2 * 60 * 60 * 1000;
const twentyMinutes = 20 * 60 * 1000;

function waitingRoom(slug: string): Room {
  return {
    slug,
    status: "waiting",
    createdAt: new Date(now),
    startedAt: null,
    expiresAt: new Date(now + twoHours),
    hostKeyHash: "hash",
  };
}

beforeEach(async () => {
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length > 0) await redis.del(...keys.map((k) => k.slice(prefix.length)));
});

afterAll(async () => {
  await redis.quit();
});

describe("RedisRoomStore", () => {
  it("guarda a sala e expira o link em 2 h", async () => {
    expect(await store.create(waitingRoom("abcdefghij"))).toBe(true);
    expect(await store.get("abcdefghij")).toEqual(waitingRoom("abcdefghij"));
    // PEXPIRETIME devolve o instante absoluto, então atrasos do ambiente não mudam o resultado.
    expect(await redis.pexpiretime("room:abcdefghij")).toBe(now + twoHours);
  });

  it("não sobrescreve um slug que já existe", async () => {
    await store.create(waitingRoom("abcdefghij"));
    expect(await store.create({ ...waitingRoom("abcdefghij"), hostKeyHash: "outra" })).toBe(false);
    expect((await store.get("abcdefghij"))?.hostKeyHash).toBe("hash");
  });

  it("devolve null para sala inexistente", async () => {
    expect(await store.get("naoexisteu")).toBeNull();
    expect(await store.start("naoexisteu", new Date(now), new Date(now + twentyMinutes))).toBeNull();
  });

  it("na primeira entrada fixa o relógio e troca o TTL para o fim da sala", async () => {
    await store.create(waitingRoom("abcdefghij"));
    const startedAt = new Date(now);
    const expiresAt = new Date(now + twentyMinutes);
    const room = await store.start("abcdefghij", startedAt, expiresAt);
    expect(room).toMatchObject({ status: "active", startedAt, expiresAt });
    expect(await redis.pexpiretime("room:abcdefghij")).toBe(expiresAt.getTime());
  });

  it("entradas simultâneas gravam um único relógio", async () => {
    await store.create(waitingRoom("abcdefghij"));
    const attempts = Array.from({ length: 10 }, (_, i) =>
      store.start("abcdefghij", new Date(now + i), new Date(now + i + twentyMinutes)),
    );
    const rooms = await Promise.all(attempts);
    const startedAts = new Set(rooms.map((r) => r?.startedAt?.toISOString()));
    expect(startedAts.size).toBe(1);
    expect((await store.get("abcdefghij"))?.startedAt?.toISOString()).toBe([...startedAts][0]);
  });
});
