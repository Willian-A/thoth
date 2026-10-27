import type { Clock } from "../ports/clock.ts";
import type { Room, RoomStore } from "../ports/room-store.ts";

/** `RoomStore` em memória para os testes. Respeita a expiração pelo relógio injetado. */
export function createMemoryRoomStore(clock: Clock): RoomStore & { rooms: Map<string, Room> } {
  const rooms = new Map<string, Room>();

  function alive(slug: string) {
    const room = rooms.get(slug);
    if (room && room.expiresAt.getTime() <= clock.now().getTime()) {
      rooms.delete(slug);
      return undefined;
    }
    return room;
  }

  return {
    rooms,
    async create(room) {
      if (alive(room.slug)) return false;
      rooms.set(room.slug, { ...room });
      return true;
    },
    async get(slug) {
      const room = alive(slug);
      return room ? { ...room } : null;
    },
    async start(slug, startedAt, expiresAt) {
      const room = alive(slug);
      if (!room) return null;
      if (room.status === "waiting") {
        Object.assign(room, { status: "active", startedAt, expiresAt });
      }
      return { ...room };
    },
  };
}
