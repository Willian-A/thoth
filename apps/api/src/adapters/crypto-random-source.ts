import { randomBytes, randomInt } from "node:crypto";
import { SLUG_LENGTH } from "@thoth/shared";
import type { RandomSource } from "../ports/random-source.ts";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

export const cryptoRandomSource: RandomSource = {
  slug: () => Array.from({ length: SLUG_LENGTH }, () => LETTERS[randomInt(LETTERS.length)]).join(""),
  hostKey: () => randomBytes(32).toString("base64url"),
  identity: () => `p_${randomBytes(9).toString("base64url")}`,
};
