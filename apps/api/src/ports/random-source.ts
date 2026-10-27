/** Valores aleatórios da aplicação, injetáveis para os testes serem determinísticos. */
export interface RandomSource {
  /** Slug da sala: só letras minúsculas, sem hífens. */
  slug(): string;
  /** Chave secreta de quem criou a sala. */
  hostKey(): string;
  /** Identidade de um participante no servidor de mídia. */
  identity(): string;
}
