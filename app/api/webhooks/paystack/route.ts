import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";
import { fulfillOrder } from "@/lib/fulfilment/engine";

// Paystack webhook — the authoritative source of payment truth. Verifies the
// HMAC signature, then marks the matching order paid (idempotently).
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
    if (order && order.status === "pending_payment") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "paid", paidAt: new Date() },
      });
      // Forward to suppliers (idempotent — callback may also trigger this).
      await fulfillOrder(order.id);
    }
  }

  // Always 200 so Paystack doesn't retry endlessly for events we ignore.
  return new Response("ok", { status: 200 });
}
