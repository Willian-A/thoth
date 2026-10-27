import { createBrowserRouter, type RouteObject } from "react-router";
import { HomePage } from "./routes/home.tsx";
import { NotFoundPage } from "./routes/not-found.tsx";
import { RoomPage } from "./routes/room.tsx";

export const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/r/:slug", element: <RoomPage /> },
  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
