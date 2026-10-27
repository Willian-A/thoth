/** Fonte de tempo injetável, para testar prazos sem esperar o tempo passar. */
export interface Clock {
  now(): Date;
}
