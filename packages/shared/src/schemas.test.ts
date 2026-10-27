import { describe, expect, it } from "vitest";
import {
  formatSlug,
  healthResponseSchema,
  joinRoomRequestSchema,
  nameSchema,
  slugSchema,
} from "./schemas.ts";

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

describe("slugSchema", () => {
  it("aceita o slug com ou sem hífens e devolve a forma guardada", () => {
    expect(slugSchema.parse("abcdefghij")).toBe("abcdefghij");
    expect(slugSchema.parse("abc-defg-hij")).toBe("abcdefghij");
    expect(slugSchema.parse("ABC-DEFG-HIJ")).toBe("abcdefghij");
  });

  it.each(["abc", "abcdefghijk", "abc-defg-hi1", "abc defg hij", ""])("recusa %j", (value) => {
    expect(slugSchema.safeParse(value).success).toBe(false);
  });

  it("formatSlug mostra o formato do link", () => {
    expect(formatSlug("abcdefghij")).toBe("abc-defg-hij");
  });
});

describe("nameSchema", () => {
  it("normaliza espaços", () => {
    expect(nameSchema.parse("  Ana   Maria \n")).toBe("Ana Maria");
  });

  it("aceita 1 e 30 caracteres", () => {
    expect(nameSchema.parse("A")).toBe("A");
    expect(nameSchema.parse("a".repeat(30))).toBe("a".repeat(30));
  });

  it.each(["", "   ", "a".repeat(31), "<b>Ana</b>", "Ana > Bia"])("recusa %j", (value) => {
    expect(nameSchema.safeParse(value).success).toBe(false);
  });
});

describe("joinRoomRequestSchema", () => {
  it("aceita só o nome", () => {
    expect(joinRoomRequestSchema.parse({ name: "Ana" })).toEqual({ name: "Ana" });
  });

  it("aceita nome e chave de criador", () => {
    expect(joinRoomRequestSchema.parse({ name: "Ana", hostKey: "k" })).toEqual({ name: "Ana", hostKey: "k" });
  });
});
