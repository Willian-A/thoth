import { z } from "zod";

// Mesmas chaves de infra/livekit.yaml, só para desenvolvimento.
const DEV_LIVEKIT_KEY = "devkey";
const DEV_LIVEKIT_SECRET = "secret-de-desenvolvimento-com-32-caracteres";

const configSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
    LIVEKIT_URL: z.string().url().default("ws://localhost:7880"),
    LIVEKIT_API_KEY: z.string().min(1).default(DEV_LIVEKIT_KEY),
    LIVEKIT_API_SECRET: z.string().min(32).default(DEV_LIVEKIT_SECRET),
  })
  .refine((c) => c.NODE_ENV !== "production" || c.LIVEKIT_API_SECRET !== DEV_LIVEKIT_SECRET, {
    path: ["LIVEKIT_API_SECRET"],
    message: "defina um segredo próprio em produção",
  });

export type Config = z.infer<typeof configSchema>;

/** Lê e valida as variáveis de ambiente. Falha na inicialização se algo estiver errado. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Configuração inválida: ${issues}`);
  }
  return result.data;
}
