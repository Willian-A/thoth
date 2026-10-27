import { Alert, Button } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { formatSlug } from "@thoth/shared";
import { useNavigate } from "react-router";
import { createRoom } from "../../lib/api.ts";
import { messages } from "../../lib/messages.ts";
import { storage } from "../../lib/storage.ts";

export function CreateRoomButton() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: createRoom,
    onSuccess: ({ slug, hostKey }) => {
      storage.saveHostKey(slug, hostKey);
      navigate(`/r/${formatSlug(slug)}`);
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <Button isPending={mutation.isPending} onPress={() => mutation.mutate()}>
        {messages.home.createRoom}
      </Button>
      {mutation.isError && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{messages.home.createRoomFailed}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
    </div>
  );
}
