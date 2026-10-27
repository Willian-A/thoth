import type { ErrorCode, ErrorResponse } from "@thoth/shared";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

/** Erro esperado da aplicação. Os serviços lançam este erro; o handler converte em HTTP. */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(toBody(error.code, error.message));
  }
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send(toBody("VALIDATION_FAILED", "Requisição inválida"));
  }
  if ("statusCode" in error && error.statusCode === 429) {
    return reply.status(429).send(toBody("RATE_LIMITED", "Muitas requisições"));
  }
  request.log.error({ err: error }, "erro não tratado");
  return reply.status(500).send(toBody("INTERNAL", "Erro interno"));
}

export function notFoundHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send(toBody("NOT_FOUND", "Rota não encontrada"));
}

function toBody(code: ErrorCode, message: string): ErrorResponse {
  return { error: { code, message } };
}
