// Paystack integration. If the secret key is a placeholder, `isPaystackConfigured`
// returns false and callers fall back to MOCK mode (order created + auto-paid)
// so the checkout flow works end-to-end without live keys.

import { createHmac } from "crypto";

const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export function isPaystackConfigured(): boolean {
  return /^sk_(test|live)_/.test(SECRET) && !SECRET.includes("xxxx");
}

/** Paystack works in kobo (1 naira = 100 kobo). */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function generateOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `PK-${t}-${r}`;
}

type InitParams = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export async function initializeTransaction(
  params: InitParams,
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message ?? "Paystack initialization failed");
  }
  return {
    authorizationUrl: json.data.authorization_url as string,
    reference: json.data.reference as string,
  };
}

export async function verifyTransaction(
  reference: string,
): Promise<{ success: boolean; amount: number }> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${SECRET}` },
      cache: "no-store",
    },
  );
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message ?? "Paystack verification failed");
  }
  return {
    success: json.data.status === "success",
    amount: json.data.amount as number,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature || !SECRET) return false;
  const hash = createHmac("sha512", SECRET).update(rawBody).digest("hex");
  return hash === signature;
}
