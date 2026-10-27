import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "../router.tsx";

/** Renderiza o app inteiro numa rota, com a API trocada por `fetch` falso nos testes. */
export function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

/** `fetch` falso que responde por método e caminho. */
export function fakeApi(handlers: Record<string, (init?: RequestInit) => Response>) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const key = `${init?.method ?? "GET"} ${url.replace(/^\/api/, "")}`;
    const handler = handlers[key];
    if (!handler) throw new Error(`Chamada inesperada: ${key}`);
    return handler(init);
  };
}
