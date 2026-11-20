import type { ApiError } from "@pickova/shared";

/**
 * One fetch wrapper for both sides of the app.
 *  - On the server it calls the Express API directly (API_URL).
 *  - In the browser it calls this origin's /api/v1 proxy, so the HTTP-only
 *    session cookie is first-party.
 */
const BASE =
  typeof window === "undefined"
    ? `${(process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "")}/api/v1`
    : "/api/v1";

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Seconds to cache a server-side GET. Omit for always-fresh data. */
  revalidate?: number;
  tags?: string[];
  signal?: AbortSignal;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, revalidate, tags, signal } = options;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(revalidate !== undefined ? { next: { revalidate, tags } } : { cache: "no-store" as const }),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiRequestError(0, "NETWORK_ERROR", "We couldn't reach the store. Check your connection and try again.");
  }

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(
      res.status,
      payload?.error?.code ?? "UNKNOWN",
      payload?.error?.message ?? "Something went wrong. Please try again.",
      payload?.error?.fields,
    );
  }
  return (await res.json()) as T;
}

/** Builds "?a=1&b=2" from an object, skipping empty values. */
export function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    q.set(key, value === true ? "1" : String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
