import { healthResponseSchema } from "@thoth/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Clock } from "../ports/clock.ts";

export function healthRoutes(deps: { clock: Clock }): FastifyPluginAsyncZod {
  return async (app) => {
    app.get("/health", { schema: { response: { 200: healthResponseSchema } } }, async () => ({
      status: "ok" as const,
      serverNow: deps.clock.now().toISOString(),
    }));
  };
}
