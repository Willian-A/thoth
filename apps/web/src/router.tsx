import { createBrowserRouter, type RouteObject } from "react-router";
import { HomePage } from "./routes/home.tsx";
import { NotFoundPage } from "./routes/not-found.tsx";

export const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
