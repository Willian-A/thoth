import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.ts";

describe("loadConfig", () => {
  it("usa valores padrão quando a variável não existe", () => {
    expect(loadConfig({}).PORT).toBe(3000);
  });

  it("falha com valor inválido", () => {
    expect(() => loadConfig({ PORT: "abc" })).toThrow(/PORT/);
  });
});
