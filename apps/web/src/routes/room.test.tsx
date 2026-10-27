import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { messages } from "../lib/messages.ts";
import { fakeApi, renderAt } from "../testing/render.tsx";

// A conexão com o LiveKit fica para o teste ponta a ponta.
vi.mock("../features/room/room-session.tsx", () => ({
  RoomSession: ({ session }: { session: { identity: string } }) => <p>sessão {session.identity}</p>,
}));

const waitingRoom = () =>
  Response.json({
    slug: "abcdefghij",
    status: "waiting",
    startedAt: null,
    expiresAt: "2026-10-27T14:00:00.000Z",
    serverNow: "2026-10-27T12:00:00.000Z",
  });

const error = (status: number, code: string) => Response.json({ error: { code, message: "x" } }, { status });

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("RoomPage", () => {
  it("mostra sala não encontrada quando a API responde 404", async () => {
    vi.stubGlobal("fetch", vi.fn(fakeApi({ "GET /rooms/abcdefghij": () => error(404, "ROOM_NOT_FOUND") })));
    renderAt("/r/abc-defg-hij");
    expect(screen.getByText(messages.room.loading)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: messages.room.notFoundTitle })).toBeInTheDocument();
  });

  it("mostra sala não encontrada para link em formato inválido, sem chamar a API", async () => {
    const fetch = vi.fn(fakeApi({}));
    vi.stubGlobal("fetch", fetch);
    renderAt("/r/xyz");
    expect(screen.getByRole("heading", { name: messages.room.notFoundTitle })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("valida o nome antes de chamar a API", async () => {
    const fetch = vi.fn(fakeApi({ "GET /rooms/abcdefghij": waitingRoom }));
    vi.stubGlobal("fetch", fetch);
    renderAt("/r/abc-defg-hij");
    await userEvent.click(await screen.findByRole("button", { name: messages.room.join }));
    expect(screen.getByText(messages.room.nameInvalid)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("avisa quando a sala está cheia", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        fakeApi({
          "GET /rooms/abcdefghij": waitingRoom,
          "POST /rooms/abcdefghij/token": () => error(409, "ROOM_FULL"),
        }),
      ),
    );
    renderAt("/r/abc-defg-hij");
    await userEvent.type(await screen.findByLabelText(messages.room.nameLabel), "Ana");
    await userEvent.click(screen.getByRole("button", { name: messages.room.join }));
    expect(await screen.findByText(messages.room.full)).toBeInTheDocument();
  });

  it("entra com o último nome usado e a chave de criador guardada", async () => {
    localStorage.setItem("thoth:last-name", "Ana");
    localStorage.setItem("thoth:host-key:abcdefghij", "chave");
    let body: unknown;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        fakeApi({
          "GET /rooms/abcdefghij": waitingRoom,
          "POST /rooms/abcdefghij/token": (init) => {
            body = JSON.parse(String(init?.body));
            return Response.json({
              token: "t",
              livekitUrl: "ws://lk",
              identity: "p_1",
              isHost: true,
              expiresAt: "2026-10-27T12:20:00.000Z",
              serverNow: "2026-10-27T12:00:00.000Z",
            });
          },
        }),
      ),
    );
    renderAt("/r/abc-defg-hij");
    expect(await screen.findByLabelText(messages.room.nameLabel)).toHaveValue("Ana");
    await userEvent.click(screen.getByRole("button", { name: messages.room.join }));
    expect(await screen.findByText("sessão p_1")).toBeInTheDocument();
    expect(body).toEqual({ name: "Ana", hostKey: "chave" });
  });
});
