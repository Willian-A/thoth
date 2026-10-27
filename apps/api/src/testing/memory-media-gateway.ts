import type { MediaGateway, MediaTokenInput } from "../ports/media-gateway.ts";

/** `MediaGateway` em memória: guarda as salas criadas e os tokens pedidos. */
export function createMemoryMediaGateway() {
  const rooms = new Set<string>();
  const participants = new Map<string, number>();
  const tokens: MediaTokenInput[] = [];

  const gateway: MediaGateway = {
    async ensureRoom(slug) {
      rooms.add(slug);
    },
    async countParticipants(slug) {
      return participants.get(slug) ?? 0;
    },
    async createToken(input) {
      tokens.push(input);
      return `token-${input.identity}`;
    },
  };

  return { gateway, rooms, participants, tokens };
}
