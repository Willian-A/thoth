export type MediaTokenInput = {
  slug: string;
  identity: string;
  name: string;
  isHost: boolean;
  /** Validade do token, em segundos. */
  ttlSeconds: number;
};

/** O servidor de mídia (LiveKit), visto pela regra de negócio. */
export interface MediaGateway {
  /** Cria a sala no servidor de mídia, se ainda não existir. */
  ensureRoom(slug: string): Promise<void>;
  countParticipants(slug: string): Promise<number>;
  /** Token de entrada: só assistir. Publicar a tela é liberado depois, pela API. */
  createToken(input: MediaTokenInput): Promise<string>;
}
