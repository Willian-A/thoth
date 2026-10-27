import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { systemClock } from "./adapters/system-clock.ts";
import type { Config } from "./config.ts";
import { errorHandler, notFoundHandler } from "./errors.ts";
import type { Clock } from "./ports/clock.ts";
import { healthRoutes } from "./routes/health.ts";

export type AppDeps = {
  clock: Clock;
};

/** Monta a aplicação: recebe as dependências prontas, para os testes poderem trocá-las. */
export function buildApp(config: Config, deps: Partial<AppDeps> = {}) {
  const resolved: AppDeps = { clock: deps.clock ?? systemClock };

  const app = Fastify({
    logger: { level: config.LOG_LEVEL, redact: ["req.headers.authorization"] },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.register(healthRoutes({ clock: resolved.clock }));

  return app;
}
