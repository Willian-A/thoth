import { roomStatusSchema } from "@thoth/shared";
import type { Redis } from "ioredis";
import type { Room, RoomStore } from "../ports/room-store.ts";

// Cria só se o slug está livre e já agenda a expiração do link.
const CREATE_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 1 then return 0 end
redis.call("HSET", KEYS[1], unpack(ARGV, 2))
redis.call("PEXPIREAT", KEYS[1], ARGV[1])
return 1
`;

// Grava o relógio só na primeira entrada; entradas simultâneas recebem o mesmo relógio.
const START_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 0 then return nil end
if redis.call("HGET", KEYS[1], "status") == "waiting" then
  redis.call("HSET", KEYS[1], "status", "active", "startedAt", ARGV[1], "expiresAt", ARGV[2])
  redis.call("PEXPIREAT", KEYS[1], ARGV[3])
end
return redis.call("HGETALL", KEYS[1])
`;

export function createRedisRoomStore(redis: Redis): RoomStore {
  return {
    async create(room) {
      const fields = Object.entries(toHash(room)).flat();
      const created = await redis.eval(CREATE_SCRIPT, 1, key(room.slug), room.expiresAt.getTime(), ...fields);
      return created === 1;
    },

    async get(slug) {
      const hash = await redis.hgetall(key(slug));
      return fromHash(slug, hash);
    },

    async start(slug, startedAt, expiresAt) {
      const reply = (await redis.eval(
        START_SCRIPT,
        1,
        key(slug),
        startedAt.toISOString(),
        expiresAt.toISOString(),
        expiresAt.getTime(),
      )) as string[] | null;
      if (!reply) return null;
      const hash: Record<string, string> = {};
      for (let i = 0; i < reply.length; i += 2) {
        hash[reply[i] as string] = reply[i + 1] as string;
      }
      return fromHash(slug, hash);
    },
  };
}

function key(slug: string) {
  return `room:${slug}`;
}

function toHash(room: Room): Record<string, string> {
  return {
    status: room.status,
    createdAt: room.createdAt.toISOString(),
    startedAt: room.startedAt?.toISOString() ?? "",
    expiresAt: room.expiresAt.toISOString(),
    hostKeyHash: room.hostKeyHash,
  };
}

function fromHash(slug: string, hash: Record<string, string>): Room | null {
  const status = roomStatusSchema.safeParse(hash.status);
  if (!status.success || !hash.createdAt || !hash.expiresAt || !hash.hostKeyHash) return null;
  return {
    slug,
    status: status.data,
    createdAt: new Date(hash.createdAt),
    startedAt: hash.startedAt ? new Date(hash.startedAt) : null,
    expiresAt: new Date(hash.expiresAt),
    hostKeyHash: hash.hostKeyHash,
  };
}
