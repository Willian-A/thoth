import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "./schemas.ts";

describe("healthResponseSchema", () => {
  it("aceita uma resposta válida", () => {
    const result = healthResponseSchema.safeParse({
      status: "ok",
      serverNow: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("recusa data inválida", () => {
    const result = healthResponseSchema.safeParse({ status: "ok", serverNow: "ontem" });
    expect(result.success).toBe(false);
  });
});
