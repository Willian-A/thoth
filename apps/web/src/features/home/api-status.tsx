import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../lib/api.ts";
import { messages } from "../../lib/messages.ts";

export function ApiStatus() {
  const { isPending, isError } = useQuery({ queryKey: ["health"], queryFn: getHealth, retry: false });

  const label = isPending
    ? messages.apiStatus.checking
    : isError
      ? messages.apiStatus.offline
      : messages.apiStatus.online;
  const color = isPending ? "bg-muted" : isError ? "bg-danger" : "bg-success";

  return (
    <p className="flex items-center gap-2 text-sm text-muted" role="status">
      <span aria-hidden className={`size-2 rounded-full ${color}`} />
      {label}
    </p>
  );
}
