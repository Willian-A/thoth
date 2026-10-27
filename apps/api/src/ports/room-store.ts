import type { RoomStatus } from "@thoth/shared";

export type Room = {
  slug: string;
  status: RoomStatus;
  createdAt: Date;
  /** Vazio até a primeira entrada. */
  startedAt: Date | null;
  /** Fim da validade do link enquanto aguarda; fim da sala depois da primeira entrada. */
  expiresAt: Date;
  hostKeyHash: string;
};

/** Onde as salas vivem. Cada sala some sozinha em `expiresAt`. */
export interface RoomStore {
  /** Guarda uma sala nova. Devolve `false` se o slug já existe. */
  create(room: Room): Promise<boolean>;
  get(slug: string): Promise<Room | null>;
  /**
   * Marca a primeira entrada de forma atômica: só grava se a sala ainda está aguardando.
   * Devolve a sala como ficou (com o relógio de quem chegou primeiro) ou `null` se ela não existe.
   */
  start(slug: string, startedAt: Date, expiresAt: Date): Promise<Room | null>;
}
