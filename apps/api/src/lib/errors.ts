import type { ZodTypeAny, z } from "zod";

/** An error that is safe to show to the client. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, "BAD_REQUEST", message);
export const unauthorized = (message = "Please sign in to continue.") => new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "You do not have access to this.") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "Not found.") => new HttpError(404, "NOT_FOUND", message);
export const conflict = (message: string) => new HttpError(409, "CONFLICT", message);

/** Validates untrusted input, throwing a 422 with per-field messages. */
export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const fields: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_";
    (fields[key] ??= []).push(issue.message);
  }
  throw new HttpError(422, "VALIDATION_ERROR", "Please check the highlighted fields.", fields);
}
