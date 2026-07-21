// Transactional email via Resend (REST API — no extra dependency).
// Dormant when RESEND_API_KEY isn't set: sendEmail becomes a no-op that logs,
// so orders keep working with no email configured. Add the key + a verified
// sender domain to turn it on — same pattern as Paystack mock mode.

import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";

const API_KEY = process.env.RESEND_API_KEY ?? "";
// Until your domain is verified in Resend, onboarding@resend.dev works for tests.
const FROM = process.env.EMAIL_FROM ?? "Pickova <onboarding@resend.dev>";
const ADMIN_TO = process.env.ADMIN_ORDER_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickova.com.ng";

export function isEmailConfigured(): boolean {
  return API_KEY.length > 0 && !API_KEY.includes("xxxx");
}

async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!opts.to) return;
  if (!isEmailConfigured()) {
    console.log(`[email] dormant — would send "${opts.subject}" to ${opts.to}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[email] send failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[email] error", err);
  }
}

function shell(title: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#FBF7EE;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #F0EBDD">
      <div style="background:#0A6640;padding:20px 24px">
        <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">Pickova</div>
      </div>
      <div style="padding:24px">
        <h1 style="margin:0 0 12px;font-size:20px;color:#0A3D26">${title}</h1>
        ${body}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #F0EBDD;color:#8a9a8e;font-size:12px">
        Pickova — Pick the moment. Own the season. · ${SITE.replace(/^https?:\/\//, "")}
      </div>
    </div>
  </div>`;
}

function itemsTable(items: { name: string; price: number; qty: number }[]): string {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#4a574d">${i.name} × ${i.qty}</td>
         <td style="padding:6px 0;text-align:right;font-weight:700;color:#0A3D26">${naira(i.price * i.qty)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>`;
}

/**
 * Send the buyer's confirmation + the admin's new-order alert for a paid order.
 * Idempotency is handled by the caller (only runs on the pending→paid transition).
 */
export async function sendOrderEmails(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const totalRow = `<div style="display:flex;justify-content:space-between;border-top:1px solid #F0EBDD;margin-top:10px;padding-top:10px;font-size:16px;font-weight:800;color:#0A3D26">
      <span>Total</span><span>${naira(order.total)}</span></div>`;

  // Buyer confirmation
  await sendEmail({
    to: order.customerEmail,
    subject: `Your Pickova order ${order.orderNumber} is confirmed 🎉`,
    html: shell(
      "Order confirmed!",
      `<p style="color:#4a574d;font-size:14px;line-height:1.6">We don receive your order, ${
        order.customerName?.split(" ")[0] || "there"
      }. E go land you sharp sharp. Here's what you picked:</p>
       ${itemsTable(order.items)}
       ${totalRow}
       <p style="color:#4a574d;font-size:14px;margin-top:16px">Delivery to: ${order.deliveryAddress || "—"}</p>
       <p style="color:#8a9a8e;font-size:13px;margin-top:16px">Order reference: <b>${order.orderNumber}</b></p>`,
    ),
  });

  // Admin alert
  if (ADMIN_TO) {
    await sendEmail({
      to: ADMIN_TO,
      subject: `🛒 New order ${order.orderNumber} — ${naira(order.total)}`,
      html: shell(
        "New order received",
        `<p style="color:#4a574d;font-size:14px">Customer: <b>${order.customerName}</b> (${order.customerEmail}, ${order.customerPhone})</p>
         ${itemsTable(order.items)}
         ${totalRow}
         <p style="color:#4a574d;font-size:14px;margin-top:12px">Deliver to: ${order.deliveryAddress}</p>
         <p style="margin-top:16px"><a href="${SITE}/admin/orders/${order.id}" style="background:#0A6640;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:700;font-size:14px">View in admin</a></p>`,
      ),
    });
  }
}
