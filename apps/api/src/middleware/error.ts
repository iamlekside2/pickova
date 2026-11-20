import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import type { ApiError } from "@pickova/shared";
import { isProd } from "../env";
import { HttpError } from "../lib/errors";

export function notFoundHandler(_req: Request, res: Response<ApiError>) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "This endpoint does not exist." } });
}

// Express recognises error handlers by their four-argument signature.
export function errorHandler(err: unknown, req: Request, res: Response<ApiError>, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, fields: err.fields } });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Malformed JSON body." } });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found." } });
    return;
  }
  // Anything else is a bug or an outage: log it in full, tell the client nothing.
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: isProd || !(err instanceof Error) ? "Something went wrong. Please try again." : err.message,
    },
  });
}
