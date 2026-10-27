import { Card } from "@heroui/react";
import { Link } from "react-router";
import { messages } from "../../lib/messages.ts";

export function RoomNotFound() {
  return (
    <Card>
      <Card.Header>
        <h1 className="text-xl font-semibold">{messages.room.notFoundTitle}</h1>
        <Card.Description>{messages.room.notFoundDescription}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Link className="underline" to="/">
          {messages.room.createNew}
        </Link>
      </Card.Content>
    </Card>
  );
}
