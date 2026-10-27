import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { messages } from "../lib/messages.ts";
import { fakeApi, renderAt } from "../testing/render.tsx";

const health = () => Response.json({ status: "ok", serverNow: new Date().toISOString() });

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("HomePage", () => {
  it("mostra o título e o status do servidor online", async () => {
    vi.stubGlobal("fetch", vi.fn(fakeApi({ "GET /health": health })));
    renderAt("/");
    expect(screen.getByRole("heading", { name: messages.home.title })).toBeInTheDocument();
    expect(await screen.findByText(messages.apiStatus.online)).toBeInTheDocument();
  });

  it("avisa quando o servidor está fora", async () => {
    vi.stubGlobal("fetch", vi.fn(fakeApi({ "GET /health": () => new Response(null, { status: 503 }) })));
    renderAt("/");
    expect(await screen.findByText(messages.apiStatus.offline)).toBeInTheDocument();
  });

  it("cria a sala, guarda a chave de criador e vai para o link", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        fakeApi({
          "GET /health": health,
          "POST /rooms": () =>
            Response.json(
              { slug: "abcdefghij", hostKey: "chave", expiresAt: "2026-10-27T14:00:00.000Z" },
              { status: 201 },
            ),
        }),
      ),
    );
    const router = renderAt("/");
    await userEvent.click(screen.getByRole("button", { name: messages.home.createRoom }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/r/abc-defg-hij"));
    expect(localStorage.getItem("thoth:host-key:abcdefghij")).toBe("chave");
  });

  it("avisa quando não consegue criar a sala", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(fakeApi({ "GET /health": health, "POST /rooms": () => new Response(null, { status: 500 }) })),
    );
    renderAt("/");
    await userEvent.click(screen.getByRole("button", { name: messages.home.createRoom }));
    expect(await screen.findByText(messages.home.createRoomFailed)).toBeInTheDocument();
  });
});
