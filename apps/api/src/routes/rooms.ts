import {
  createRoomResponseSchema,
  joinRoomRequestSchema,
  joinRoomResponseSchema,
  roomParamsSchema,
  roomStatusResponseSchema,
} from "@thoth/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Clock } from "../ports/clock.ts";
import type { Room } from "../ports/room-store.ts";
import type { RoomService } from "../services/room-service.ts";

export type RoomRoutesDeps = {
  rooms: RoomService;
  clock: Clock;
  /** Endereço do LiveKit que o navegador usa para conectar. */
  livekitUrl: string;
};

export function roomRoutes({ rooms, clock, livekitUrl }: RoomRoutesDeps): FastifyPluginAsyncZod {
  return async (app) => {
    app.post(
      "/rooms",
      { schema: { response: { 201: createRoomResponseSchema } } },
      async (_request, reply) => {
        const { room, hostKey } = await rooms.create();
        return reply.status(201).send({ slug: room.slug, hostKey, expiresAt: room.expiresAt.toISOString() });
      },
    );

    app.get(
      "/rooms/:slug",
      { schema: { params: roomParamsSchema, response: { 200: roomStatusResponseSchema } } },
      async (request) => toStatus(await rooms.get(request.params.slug), clock),
    );

    app.post(
      "/rooms/:slug/token",
      {
        schema: {
          params: roomParamsSchema,
          body: joinRoomRequestSchema,
          response: { 200: joinRoomResponseSchema },
        },
      },
      async (request) => {
        const result = await rooms.join(request.params.slug, request.body);
        return {
          token: result.token,
          livekitUrl,
          identity: result.identity,
          isHost: result.isHost,
          expiresAt: result.room.expiresAt.toISOString(),
          serverNow: clock.now().toISOString(),
        };
      },
    );
  };
}

function toStatus(room: Room, clock: Clock) {
  return {
    slug: room.slug,
    status: room.status,
    startedAt: room.startedAt?.toISOString() ?? null,
    expiresAt: room.expiresAt.toISOString(),
    serverNow: clock.now().toISOString(),
  };
}
