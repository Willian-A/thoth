import { Alert, Button, Card, FieldError, Input, Label, TextField } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { type JoinRoomResponse, nameSchema } from "@thoth/shared";
import { type FormEvent, useState } from "react";
import { errorCode, joinRoom } from "../../lib/api.ts";
import { messages } from "../../lib/messages.ts";
import { storage } from "../../lib/storage.ts";

type Props = {
  slug: string;
  /** Aviso vindo de uma sessão anterior, como a queda da conexão. */
  notice?: string | undefined;
  onJoined: (session: JoinRoomResponse) => void;
};

export function JoinForm({ slug, notice, onJoined }: Props) {
  const [name, setName] = useState(storage.getLastName);
  const [touched, setTouched] = useState(false);
  const parsed = nameSchema.safeParse(name);

  const mutation = useMutation({
    mutationFn: (validName: string) => joinRoom(slug, { name: validName, hostKey: storage.getHostKey(slug) }),
    onSuccess: (session, validName) => {
      storage.saveLastName(validName);
      onJoined(session);
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (parsed.success) mutation.mutate(parsed.data);
  }

  const error = mutation.isError ? joinErrorMessage(errorCode(mutation.error)) : notice;

  return (
    <Card>
      <Card.Header>
        <h1 className="text-xl font-semibold">{messages.room.joinTitle}</h1>
      </Card.Header>
      <Card.Content>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <TextField value={name} onChange={setName} isInvalid={touched && !parsed.success} autoFocus>
            <Label>{messages.room.nameLabel}</Label>
            <Input placeholder={messages.room.namePlaceholder} maxLength={60} />
            <FieldError>{messages.room.nameInvalid}</FieldError>
          </TextField>
          {error && (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          <Button type="submit" isPending={mutation.isPending}>
            {messages.room.join}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}

function joinErrorMessage(code: ReturnType<typeof errorCode>) {
  if (code === "ROOM_FULL") return messages.room.full;
  if (code === "ROOM_NOT_FOUND") return messages.room.notFoundTitle;
  return messages.room.joinFailed;
}
