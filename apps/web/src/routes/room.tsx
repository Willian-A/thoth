import { Alert, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { type JoinRoomResponse, slugSchema } from "@thoth/shared";
import { type ReactNode, useState } from "react";
import { useParams } from "react-router";
import { JoinForm } from "../features/room/join-form.tsx";
import { RoomNotFound } from "../features/room/room-not-found.tsx";
import { RoomSession } from "../features/room/room-session.tsx";
import { errorCode, getRoom } from "../lib/api.ts";
import { messages } from "../lib/messages.ts";

export function RoomPage() {
  const parsed = slugSchema.safeParse(useParams().slug ?? "");
  return <Page>{parsed.success ? <Room key={parsed.data} slug={parsed.data} /> : <RoomNotFound />}</Page>;
}

function Room({ slug }: { slug: string }) {
  const room = useQuery({ queryKey: ["room", slug], queryFn: () => getRoom(slug) });
  const [session, setSession] = useState<JoinRoomResponse | null>(null);
  const [notice, setNotice] = useState<string>();

  if (room.isPending) {
    return (
      <p className="flex items-center gap-2 text-muted" role="status">
        <Spinner size="sm" />
        {messages.room.loading}
      </p>
    );
  }

  if (room.isError) {
    if (errorCode(room.error) === "ROOM_NOT_FOUND") return <RoomNotFound />;
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Description>{messages.room.loadFailed}</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (session) {
    return (
      <RoomSession
        session={session}
        onLeave={(reason) => {
          setSession(null);
          setNotice(reason === "disconnected" ? messages.room.disconnected : undefined);
        }}
      />
    );
  }

  return (
    <JoinForm
      slug={slug}
      notice={notice}
      onJoined={(joined) => {
        setNotice(undefined);
        setSession(joined);
      }}
    />
  );
}

function Page({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4">{children}</main>
  );
}
