/** Duração da sala, contada a partir da primeira entrada. */
export const ROOM_DURATION_MS = 20 * 60 * 1000;

/** Tempo que um link vale antes da primeira entrada. */
export const ROOM_WAITING_TTL_MS = 2 * 60 * 60 * 1000;

export const MAX_PARTICIPANTS = 8;

/** Prazo para quem está compartilhando responder a um pedido de troca. */
export const SHARE_REQUEST_TTL_MS = 45 * 1000;

export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 30;

/** Quantidade de letras do slug da sala (cerca de 47 bits de entropia). */
export const SLUG_LENGTH = 10;
