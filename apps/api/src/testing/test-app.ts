import { buildApp } from "../app.ts";
import { loadConfig } from "../config.ts";
import { createManualClock } from "./manual-clock.ts";
import { createMemoryMediaGateway } from "./memory-media-gateway.ts";
import { createMemoryRoomStore } from "./memory-room-store.ts";
import { createSequentialRandomSource } from "./sequential-random-source.ts";

/** App completo com Redis, LiveKit, relógio e sorteio trocados por versões em memória. */
export function buildTestApp() {
  const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent", LIVEKIT_URL: "ws://livekit.test" });
  const time = createManualClock();
  const store = createMemoryRoomStore(time.clock);
  const media = createMemoryMediaGateway();
  const app = buildApp(config, {
    clock: time.clock,
    store,
    media: media.gateway,
    random: createSequentialRandomSource(),
  });
  return { app, time, store, media };
}
