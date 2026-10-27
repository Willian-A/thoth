import { Link } from "react-router";
import { messages } from "../lib/messages.ts";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">{messages.notFound.title}</h1>
      <Link className="underline" to="/">
        {messages.notFound.backHome}
      </Link>
    </main>
  );
}
