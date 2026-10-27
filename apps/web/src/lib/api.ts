import {
  type CreateRoomResponse,
  createRoomResponseSchema,
  type ErrorCode,
  type HealthResponse,
  healthResponseSchema,
} from "@thoth/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Erro devolvido pela API, com o código de `shared` para a interface traduzir. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode | "UNKNOWN",
  ) {
    super(`API respondeu ${status} (${code})`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, schema: { parse(data: unknown): T }, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const code = (body as { error?: { code?: ErrorCode } } | null)?.error?.code ?? "UNKNOWN";
    throw new ApiError(res.status, code);
  }
  return schema.parse(body);
}

export function getHealth(): Promise<HealthResponse> {
  return request("/health", healthResponseSchema);
}

export function createRoom(): Promise<CreateRoomResponse> {
  return request("/rooms", createRoomResponseSchema, { method: "POST" });
}
