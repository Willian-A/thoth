import { Button, Card, Chip, Spinner } from "@heroui/react";
import {
  LiveKitRoom,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import { type JoinRoomResponse, participantMetadataSchema } from "@thoth/shared";
import { ConnectionState, type Participant } from "livekit-client";
import { useRef } from "react";
import { messages } from "../../lib/messages.ts";

type Props = {
  session: JoinRoomResponse;
  /** `disconnected` quando a conexão caiu sem a pessoa pedir. */
  onLeave: (reason: "left" | "disconnected") => void;
};

export function RoomSession({ session, onLeave }: Props) {
  const leaving = useRef(false);

  function leave() {
    leaving.current = true;
    onLeave("left");
  }

  return (
    <LiveKitRoom
      serverUrl={session.livekitUrl}
      token={session.token}
      connect
      audio={false}
      video={false}
      onDisconnected={() => {
        if (!leaving.current) onLeave("disconnected");
      }}
    >
      <Card>
        <Card.Header className="flex flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">{messages.room.participants}</h1>
          <Button variant="secondary" onPress={leave}>
            {messages.room.leave}
          </Button>
        </Card.Header>
        <Card.Content>
          <ParticipantList />
        </Card.Content>
      </Card>
    </LiveKitRoom>
  );
}

function ParticipantList() {
  const state = useConnectionState();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  if (state !== ConnectionState.Connected) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted" role="status">
        <Spinner size="sm" />
        {messages.room.connecting}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-label={messages.room.participants}>
      {participants.map((participant) => (
        <li key={participant.identity} className="flex items-center gap-2">
          <span className="truncate">{participant.name || participant.identity}</span>
          {participant.identity === localParticipant.identity && <Chip size="sm">{messages.room.you}</Chip>}
          {isHost(participant) && (
            <Chip size="sm" color="accent">
              {messages.room.host}
            </Chip>
          )}
        </li>
      ))}
    </ul>
  );
}

function isHost(participant: Participant) {
  try {
    return participantMetadataSchema.parse(JSON.parse(participant.metadata ?? "")).isHost;
  } catch {
    return false;
  }
}
