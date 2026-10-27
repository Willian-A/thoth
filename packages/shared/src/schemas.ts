import { z } from "zod";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, SLUG_LENGTH } from "./constants.ts";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  serverNow: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

const slugPattern = new RegExp(`^[a-z]{${SLUG_LENGTH}}$`);

/** Slug como é guardado: só letras minúsculas, sem hífens. */
export const storedSlugSchema = z.string().regex(slugPattern);

/** Slug como chega na URL: aceita hífens e maiúsculas e devolve a forma guardada. */
export const slugSchema = z
  .string()
  .max(SLUG_LENGTH * 2)
  .transform((value) => value.replaceAll("-", "").toLowerCase())
  .pipe(storedSlugSchema);

/** Mostra o slug no formato do link: `abc-defg-hij`. */
export function formatSlug(slug: string): string {
  return `${slug.slice(0, 3)}-${slug.slice(3, 7)}-${slug.slice(7)}`;
}

/** Nome de quem entra: espaços normalizados, sem `<` nem `>`. */
export const nameSchema = z
  .string()
  .max(NAME_MAX_LENGTH * 4)
  .transform((value) => value.normalize("NFC").replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .regex(/^[^<>]*$/),
  );

export const roomStatusSchema = z.enum(["waiting", "active"]);

export type RoomStatus = z.infer<typeof roomStatusSchema>;

export const createRoomResponseSchema = z.object({
  slug: storedSlugSchema,
  hostKey: z.string(),
  /** Fim da validade do link, se ninguém entrar. */
  expiresAt: z.string().datetime(),
});

export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>;

export const roomParamsSchema = z.object({ slug: slugSchema });

export const roomStatusResponseSchema = z.object({
  slug: storedSlugSchema,
  status: roomStatusSchema,
  startedAt: z.string().datetime().nullable(),
  /** Fim da validade do link enquanto aguarda; fim da sala depois da primeira entrada. */
  expiresAt: z.string().datetime(),
  serverNow: z.string().datetime(),
});

export type RoomStatusResponse = z.infer<typeof roomStatusResponseSchema>;

export const joinRoomRequestSchema = z.object({
  name: nameSchema,
  hostKey: z.string().max(100).optional(),
});

export type JoinRoomRequest = z.input<typeof joinRoomRequestSchema>;

export const joinRoomResponseSchema = z.object({
  token: z.string(),
  livekitUrl: z.string(),
  identity: z.string(),
  isHost: z.boolean(),
  expiresAt: z.string().datetime(),
  serverNow: z.string().datetime(),
});

export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>;

/** Metadados que a API grava no token e o front lê de cada participante. */
export const participantMetadataSchema = z.object({ isHost: z.boolean() });

export type ParticipantMetadata = z.infer<typeof participantMetadataSchema>;
