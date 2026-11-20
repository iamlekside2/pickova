import { formatNaira } from "@pickova/shared";
import { env, siteUrl } from "../../env";
import { emailLayout, sendMail } from "../../lib/mailer";
import { prisma } from "../../lib/prisma";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Order confirmation to the customer, plus a new-order alert to the store if configured. Never throws. */
export async function sendOrderEmails(orderId: string): Promise<void> {
  try {
    const o = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!o) return;

    const lines = o.items.map((i) => `${i.quantity} × ${i.productName} (${i.colourName}, size ${i.sizeLabel}) — ${formatNaira(i.lineTotalKobo)}`);
    const totals = [
      `Subtotal: ${formatNaira(o.subtotalKobo)}`,
      ...(o.discountKobo > 0 ? [`Discount${o.couponCode ? ` (${o.couponCode})` : ""}: −${formatNaira(o.discountKobo)}`] : []),
      `Delivery: ${o.deliveryFeeKobo === 0 ? "Free" : formatNaira(o.deliveryFeeKobo)}`,
      `Total paid: ${formatNaira(o.totalKobo)}`,
    ];
    const address = `${o.customerName}, ${o.deliveryAddress}, ${o.deliveryCity}, ${o.deliveryState} — ${o.phone}`;
    const trackUrl = `${siteUrl}/track-order`;

    const row = (l: string) => `<tr><td style="padding:6px 0;border-bottom:1px solid #E9E3D9;font-size:14px">${esc(l)}</td></tr>`;
    await sendMail({
      to: o.email,
      subject: `Your Pickova order ${o.reference} is confirmed`,
      text: `Hi ${o.customerName},\n\nThank you — we've received your payment and your order is confirmed.\n\nOrder reference: ${o.reference}\n\n${lines.join("\n")}\n\n${totals.join("\n")}\n\nDelivering to: ${address}\n\nTrack your order with your reference and this email address: ${trackUrl}\n\nPickova — Pick your pair.`,
      html: emailLayout(
        "Your order is confirmed",
        `<p style="margin:0 0 16px;line-height:1.6">Hi ${esc(o.customerName)}, thank you — we've received your payment.</p>
         <p style="margin:0 0 20px;font-size:14px">Order reference: <strong style="font-size:16px">${esc(o.reference)}</strong></p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${lines.map(row).join("")}</table>
         <p style="margin:16px 0 0;font-size:14px;line-height:1.8">${totals.map(esc).join("<br>")}</p>
         <p style="margin:16px 0 24px;font-size:14px;line-height:1.6"><strong>Delivering to:</strong><br>${esc(address)}</p>
         <p style="margin:0"><a href="${trackUrl}" style="display:inline-block;background:#F28C28;color:#fff;text-decoration:none;font-weight:500;padding:12px 28px;border-radius:999px">Track your order</a></p>`,
      ),
    });

    if (env.ADMIN_ORDER_EMAIL) {
      await sendMail({
        to: env.ADMIN_ORDER_EMAIL,
        subject: `New paid order ${o.reference} — ${formatNaira(o.totalKobo)}`,
        text: `New paid order ${o.reference}\n\n${lines.join("\n")}\n\n${totals.join("\n")}\n\nDeliver to: ${address}\nCustomer email: ${o.email}${o.deliveryInstructions ? `\nInstructions: ${o.deliveryInstructions}` : ""}`,
        html: emailLayout(
          `New paid order ${o.reference}`,
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${lines.map(row).join("")}</table>
           <p style="margin:16px 0;font-size:14px;line-height:1.8">${totals.map(esc).join("<br>")}</p>
           <p style="margin:0;font-size:14px;line-height:1.6"><strong>Deliver to:</strong><br>${esc(address)}<br>${esc(o.email)}${o.deliveryInstructions ? `<br><em>${esc(o.deliveryInstructions)}</em>` : ""}</p>`,
        ),
      });
    }
  } catch (e) {
    console.error(`[mail] Could not send order emails for ${orderId}`, e);
  }
}
