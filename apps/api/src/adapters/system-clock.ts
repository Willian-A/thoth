import type { Clock } from "../ports/clock.ts";

export const systemClock: Clock = {
  now: () => new Date(),
};
