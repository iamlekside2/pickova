import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import { fulfillOrder } from "@/lib/fulfilment/engine";
import { sendOrderEmails } from "@/lib/email";
import { CartClear } from "@/components/CartClear";

export const metadata: Metadata = { title: "Order status" };
export const dynamic = "force-dynamic";

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: { reference?: string; trxref?: string; mock?: string };
}) {
  const reference = searchParams.reference ?? searchParams.trxref;

  if (!reference) {
    return <Result ok={false} message="Missing payment reference." />;
  }

  const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
  if (!order) {
    return <Result ok={false} message="We couldn't find that order." />;
  }

  let paid = order.status !== "pending_payment";

  if (order.status === "pending_payment") {
    let success = false;
    if (isPaystackConfigured() && searchParams.mock !== "1") {
      try {
        const v = await verifyTransaction(reference);
        success = v.success;
      } catch {
        success = false;
      }
    } else {
      // Mock mode — treat as paid so the flow completes without live keys.
      success = true;
    }

    if (success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "paid", paidAt: new Date() },
      });
      paid = true;
      // Forward to suppliers + send confirmation/alert emails (runs once — this
      // block only executes on the pending→paid transition).
      await fulfillOrder(order.id);
      await sendOrderEmails(order.id);
    }
  }

  if (!paid) {
    return (
      <Result
        ok={false}
        message="Your payment wasn't completed. You can try again from your basket."
        orderNumber={order.orderNumber}
      />
    );
  }

  return (
    <>
      <CartClear />
      <div className="mx-auto max-w-narrow px-6 py-16">
        <div className="mx-auto max-w-lg rounded-card border border-brand-line-2 bg-white p-8 text-center sm:p-12">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-brand-green" />
          <h1 className="mb-2 font-display text-2xl font-extrabold text-brand-green">
            Order Confirmed!
          </h1>
          <p className="mb-1 text-brand-muted">
            We don receive your order. E go land you sharp sharp.
          </p>
          <p className="mb-6 text-sm text-brand-muted-2">
            Order <span className="font-bold text-brand-ink">{order.orderNumber}</span> ·{" "}
            {naira(order.total)}
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            Back to Pickova
          </Link>
        </div>
      </div>
    </>
  );
}

function Result({
  ok,
  message,
  orderNumber,
}: {
  ok: boolean;
  message: string;
  orderNumber?: string;
}) {
  return (
    <div className="mx-auto max-w-narrow px-6 py-16">
      <div className="mx-auto max-w-lg rounded-card border border-brand-line-2 bg-white p-8 text-center sm:p-12">
        {ok ? (
          <CheckCircle2 size={48} className="mx-auto mb-4 text-brand-green" />
        ) : (
          <XCircle size={48} className="mx-auto mb-4 text-brand-danger" />
        )}
        <h1 className="mb-2 font-display text-2xl font-extrabold text-brand-ink">
          {ok ? "Done" : "Payment not completed"}
        </h1>
        <p className="mb-6 text-brand-muted">{message}</p>
        {orderNumber && (
          <p className="mb-6 text-sm text-brand-muted-2">Order {orderNumber}</p>
        )}
        <Link
          href="/"
          className="inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-bold text-white hover:bg-brand-green-dark"
        >
          Back to Pickova
        </Link>
      </div>
    </div>
  );
}
