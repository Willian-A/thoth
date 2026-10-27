import { MAX_PARTICIPANTS, type ParticipantMetadata } from "@thoth/shared";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import type { MediaGateway } from "../ports/media-gateway.ts";

export type LiveKitOptions = {
  url: string;
  apiKey: string;
  apiSecret: string;
};

// Quanto tempo a sala vazia espera a primeira conexão depois de criada.
const EMPTY_TIMEOUT_SECONDS = 120;

export function createLiveKitGateway(options: LiveKitOptions): MediaGateway {
  const rooms = new RoomServiceClient(options.url, options.apiKey, options.apiSecret);

  return {
    async ensureRoom(slug) {
      // createRoom devolve a sala existente se ela já foi criada.
      await rooms.createRoom({
        name: slug,
        maxParticipants: MAX_PARTICIPANTS,
        emptyTimeout: EMPTY_TIMEOUT_SECONDS,
      });
    },

    async countParticipants(slug) {
      const participants = await rooms.listParticipants(slug);
      return participants.length;
    },

    async createToken({ slug, identity, name, isHost, ttlSeconds }) {
      const metadata: ParticipantMetadata = { isHost };
      const token = new AccessToken(options.apiKey, options.apiSecret, {
        identity,
        name,
        metadata: JSON.stringify(metadata),
        ttl: ttlSeconds,
      });
      token.addGrant({
        roomJoin: true,
        room: slug,
        canSubscribe: true,
        canPublish: false,
        canPublishData: false,
        // Sem isso, qualquer um poderia se marcar como criador pelos metadados.
        canUpdateOwnMetadata: false,
      });
      return token.toJwt();
    },
  };
}
