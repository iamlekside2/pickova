import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";
import { HttpError } from "./errors";

/**
 * Paystack client. The secret key never leaves the server: the browser only
 * ever receives the hosted-checkout URL.
 */
const BASE = "https://api.paystack.co";

export const isPaystackConfigured = () => Boolean(env.PAYSTACK_SECRET_KEY);

export class PaystackError extends Error {}

/** The fields of a Paystack transaction we rely on. */
export type PaystackTransaction = {
  status: string; // "success" | "failed" | "abandoned" | "ongoing" | …
  reference: string;
  amount: number; // kobo
  currency: string;
  channel?: string | null;
  gateway_response?: string | null;
  paid_at?: string | null;
  id?: number;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new HttpError(503, "PAYMENTS_UNAVAILABLE", "Online payment isn't available right now. Please try again later.");
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (cause) {
    throw new PaystackError(`Could not reach Paystack: ${(cause as Error).message}`);
  }
  const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !json?.status || !json.data) throw new PaystackError(json?.message ?? `Paystack responded ${res.status}`);
  return json.data;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorizationUrl: string }> {
  const data = await call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
  // Only ever send customers to Paystack's own checkout.
  const url = new URL(data.authorization_url);
  if (url.protocol !== "https:" || !/(^|\.)paystack\.com$/.test(url.hostname)) throw new PaystackError("Unexpected checkout URL from Paystack");
  return { authorizationUrl: data.authorization_url };
}

export function verifyTransaction(reference: string): Promise<PaystackTransaction> {
  return call<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Paystack signs each webhook body with HMAC-SHA512 using the secret key. */
export function isValidWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!env.PAYSTACK_SECRET_KEY || !signature) return false;
  const expected = createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(rawBody).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
