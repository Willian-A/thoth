import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { Redis } from "ioredis";
import { cryptoRandomSource } from "./adapters/crypto-random-source.ts";
import { createLiveKitGateway } from "./adapters/livekit-gateway.ts";
import { createRedisRoomStore } from "./adapters/redis-room-store.ts";
import { systemClock } from "./adapters/system-clock.ts";
import type { Config } from "./config.ts";
import { errorHandler, notFoundHandler } from "./errors.ts";
import type { Clock } from "./ports/clock.ts";
import type { MediaGateway } from "./ports/media-gateway.ts";
import type { RandomSource } from "./ports/random-source.ts";
import type { RoomStore } from "./ports/room-store.ts";
import { healthRoutes } from "./routes/health.ts";
import { roomRoutes } from "./routes/rooms.ts";
import { createRoomService } from "./services/room-service.ts";

export type AppDeps = {
  clock: Clock;
  store: RoomStore;
  media: MediaGateway;
  random: RandomSource;
};

/** Monta a aplicação: recebe as dependências prontas, para os testes poderem trocá-las. */
export function buildApp(config: Config, deps: Partial<AppDeps> = {}) {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL, redact: ["req.headers.authorization"] },
  }).withTypeProvider<ZodTypeProvider>();

  const clock = deps.clock ?? systemClock;
  let store = deps.store;
  if (!store) {
    const redis = new Redis(config.REDIS_URL);
    app.addHook("onClose", async () => {
      await redis.quit();
    });
    store = createRedisRoomStore(redis);
  }
  const media =
    deps.media ??
    createLiveKitGateway({
      url: config.LIVEKIT_URL,
      apiKey: config.LIVEKIT_API_KEY,
      apiSecret: config.LIVEKIT_API_SECRET,
    });
  const rooms = createRoomService({ store, media, clock, random: deps.random ?? cryptoRandomSource });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.register(healthRoutes({ clock }));
  app.register(roomRoutes({ rooms, clock, livekitUrl: config.LIVEKIT_PUBLIC_URL ?? config.LIVEKIT_URL }));

  return app;
}
