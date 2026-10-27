import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { messages } from "../lib/messages.ts";
import { HomePage } from "./home.tsx";

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <HomePage />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("HomePage", () => {
  it("mostra o título e o status do servidor online", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ status: "ok", serverNow: new Date().toISOString() })),
    );
    renderHome();
    expect(screen.getByRole("heading", { name: messages.home.title })).toBeInTheDocument();
    expect(await screen.findByText(messages.apiStatus.online)).toBeInTheDocument();
  });

  it("avisa quando o servidor está fora", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    renderHome();
    expect(await screen.findByText(messages.apiStatus.offline)).toBeInTheDocument();
  });
});
