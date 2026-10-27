import type { RandomSource } from "../ports/random-source.ts";

/** Valores previsíveis: slugs da lista (repetindo o último), chaves e identidades numeradas. */
export function createSequentialRandomSource(slugs = ["abcdefghij"]): RandomSource {
  let slugIndex = 0;
  let keyCount = 0;
  let identityCount = 0;
  return {
    slug: () => slugs[Math.min(slugIndex++, slugs.length - 1)] as string,
    hostKey: () => `chave-${++keyCount}`,
    identity: () => `p_${++identityCount}`,
  };
}
