import { storedSlugSchema } from "@thoth/shared";
import { describe, expect, it } from "vitest";
import { cryptoRandomSource } from "./crypto-random-source.ts";

describe("cryptoRandomSource", () => {
  it("gera slugs no formato guardado", () => {
    for (let i = 0; i < 100; i++) {
      expect(storedSlugSchema.safeParse(cryptoRandomSource.slug()).success).toBe(true);
    }
  });

  it("gera chaves de 32 bytes e identidades distintas", () => {
    expect(Buffer.from(cryptoRandomSource.hostKey(), "base64url")).toHaveLength(32);
    expect(cryptoRandomSource.identity()).not.toBe(cryptoRandomSource.identity());
  });
});
