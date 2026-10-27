export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "NOT_FOUND",
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "RATE_LIMITED",
  "CAPTCHA_FAILED",
  "SHARE_REQUEST_PENDING",
  "FORBIDDEN",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
