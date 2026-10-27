import { TokenVerifier } from "livekit-server-sdk";
import { describe, expect, it } from "vitest";
import { createLiveKitGateway } from "./livekit-gateway.ts";

const options = {
  url: "ws://localhost:7880",
  apiKey: "devkey",
  apiSecret: "segredo-de-teste-com-mais-de-32-caracteres",
};

describe("LiveKitGateway.createToken", () => {
  it("emite um token que só assiste, com nome, metadados e validade", async () => {
    const gateway = createLiveKitGateway(options);
    const before = Math.floor(Date.now() / 1000);
    const token = await gateway.createToken({
      slug: "abcdefghij",
      identity: "p_123",
      name: "Ana",
      isHost: true,
      ttlSeconds: 600,
    });

    const claims = await new TokenVerifier(options.apiKey, options.apiSecret).verify(token);
    expect(claims.sub).toBe("p_123");
    expect(claims.name).toBe("Ana");
    expect(JSON.parse(claims.metadata ?? "")).toEqual({ isHost: true });
    expect(claims.video).toMatchObject({
      roomJoin: true,
      room: "abcdefghij",
      canSubscribe: true,
      canPublish: false,
      canPublishData: false,
      canUpdateOwnMetadata: false,
    });
    expect(claims.exp).toBeGreaterThanOrEqual(before + 600);
    expect(claims.exp).toBeLessThanOrEqual(before + 602);
  });
});
