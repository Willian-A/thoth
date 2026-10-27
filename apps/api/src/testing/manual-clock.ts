import type { Clock } from "../ports/clock.ts";

/** Relógio que só anda quando o teste manda. */
export function createManualClock(start = "2026-10-27T12:00:00.000Z") {
  let current = new Date(start).getTime();
  const clock: Clock = { now: () => new Date(current) };
  return {
    clock,
    advance(ms: number) {
      current += ms;
    },
  };
}
