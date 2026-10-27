import { createHash, timingSafeEqual } from "node:crypto";
import { MAX_PARTICIPANTS, ROOM_DURATION_MS, ROOM_WAITING_TTL_MS } from "@thoth/shared";
import { AppError } from "../errors.ts";
import type { Clock } from "../ports/clock.ts";
import type { MediaGateway } from "../ports/media-gateway.ts";
import type { RandomSource } from "../ports/random-source.ts";
import type { Room, RoomStore } from "../ports/room-store.ts";

export type RoomServiceDeps = {
  store: RoomStore;
  media: MediaGateway;
  clock: Clock;
  random: RandomSource;
};

export type JoinResult = {
  room: Room;
  token: string;
  identity: string;
  isHost: boolean;
};

export type RoomService = ReturnType<typeof createRoomService>;

// Com 47 bits de slug, repetir é quase impossível; o limite só evita laço infinito.
const MAX_SLUG_ATTEMPTS = 3;

export function createRoomService({ store, media, clock, random }: RoomServiceDeps) {
  async function get(slug: string): Promise<Room> {
    const room = await store.get(slug);
    // Sala inexistente e sala vencida respondem igual, para não ajudar quem tenta adivinhar links.
    if (!room || room.expiresAt.getTime() <= clock.now().getTime()) {
      throw new AppError("ROOM_NOT_FOUND", 404, "Sala não encontrada ou encerrada");
    }
    return room;
  }

  return {
    async create(): Promise<{ room: Room; hostKey: string }> {
      const hostKey = random.hostKey();
      const now = clock.now();
      for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
        const room: Room = {
          slug: random.slug(),
          status: "waiting",
          createdAt: now,
          startedAt: null,
          expiresAt: new Date(now.getTime() + ROOM_WAITING_TTL_MS),
          hostKeyHash: hash(hostKey),
        };
        if (await store.create(room)) return { room, hostKey };
      }
      throw new Error("não foi possível gerar um slug livre");
    },

    get,

    async join(slug: string, input: { name: string; hostKey?: string | undefined }): Promise<JoinResult> {
      let room = await get(slug);
      await media.ensureRoom(slug);

      if (room.status === "waiting") {
        const startedAt = clock.now();
        const started = await store.start(slug, startedAt, new Date(startedAt.getTime() + ROOM_DURATION_MS));
        if (!started) throw new AppError("ROOM_NOT_FOUND", 404, "Sala não encontrada ou encerrada");
        room = started;
      } else if ((await media.countParticipants(slug)) >= MAX_PARTICIPANTS) {
        throw new AppError("ROOM_FULL", 409, "A sala está cheia");
      }

      const identity = random.identity();
      const isHost = input.hostKey !== undefined && sameHash(hash(input.hostKey), room.hostKeyHash);
      const ttlSeconds = Math.ceil((room.expiresAt.getTime() - clock.now().getTime()) / 1000);
      const token = await media.createToken({ slug, identity, name: input.name, isHost, ttlSeconds });
      return { room, token, identity, isHost };
    },
  };
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sameHash(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}
