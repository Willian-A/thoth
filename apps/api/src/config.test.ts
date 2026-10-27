import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.ts";

describe("loadConfig", () => {
  it("usa valores padrão quando a variável não existe", () => {
    expect(loadConfig({}).PORT).toBe(3000);
  });

  it("falha com valor inválido", () => {
    expect(() => loadConfig({ PORT: "abc" })).toThrow(/PORT/);
  });

  it("recusa o segredo de desenvolvimento do LiveKit em produção", () => {
    expect(() => loadConfig({ NODE_ENV: "production" })).toThrow(/LIVEKIT_API_SECRET/);
    expect(() =>
      loadConfig({ NODE_ENV: "production", LIVEKIT_API_SECRET: "um-segredo-de-producao-com-32-caracteres!" }),
    ).not.toThrow();
  });
});
