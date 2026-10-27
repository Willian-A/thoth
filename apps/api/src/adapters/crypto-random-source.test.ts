import { storedSlugSchema } from "@thoth/shared";
import { describe, expect, it } from "vitest";
import { cryptoRandomSource } from "./crypto-random-source.ts";

describe("cryptoRandomSource", () => {
  it("gera slugs no formato guardado", () => {
    for (let i = 0; i < 100; i++) {
      expect(storedSlugSchema.safeParse(cryptoRandomSource.slug()).success).toBe(true);
    }
  });

  it("gera chaves de 32 bytes, todas diferentes", () => {
    const keys = Array.from({ length: 100 }, () => cryptoRandomSource.hostKey());
    for (const key of keys) {
      expect(Buffer.from(key, "base64url")).toHaveLength(32);
    }
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gera identidades com prefixo p_, todas diferentes", () => {
    const identities = Array.from({ length: 100 }, () => cryptoRandomSource.identity());
    for (const identity of identities) {
      expect(identity).toMatch(/^p_[A-Za-z0-9_-]{12}$/);
    }
    expect(new Set(identities).size).toBe(identities.length);
  });
});
