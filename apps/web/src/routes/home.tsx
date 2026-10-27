import { Card } from "@heroui/react";
import { ApiStatus } from "../features/home/api-status.tsx";
import { CreateRoomButton } from "../features/home/create-room-button.tsx";
import { messages } from "../lib/messages.ts";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4">
      <Card>
        <Card.Header>
          <h1 className="text-2xl font-semibold">{messages.home.title}</h1>
          <Card.Description>{messages.home.subtitle}</Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <CreateRoomButton />
          <ApiStatus />
        </Card.Content>
      </Card>
    </main>
  );
}
