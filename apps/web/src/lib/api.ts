import { type HealthResponse, healthResponseSchema } from "@thoth/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health falhou: ${res.status}`);
  return healthResponseSchema.parse(await res.json());
}
