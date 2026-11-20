import { env, isProd } from "../env";

type Mail = { to: string; subject: string; text: string; html: string };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Brand-styled wrapper for transactional emails. */
export function emailLayout(heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FAF7F2;font-family:Poppins,Arial,sans-serif;color:#1B2A4A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden">
<tr><td style="background:#1B2A4A;padding:22px 32px;color:#fff;font-size:24px;font-weight:700;letter-spacing:-1px">pickova</td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-size:22px">${escapeHtml(heading)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:20px 32px;background:#FAF7F2;font-size:12px;color:#5F6E90">Pickova — Pick your pair.</td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Sends a transactional email through Resend when RESEND_API_KEY is set.
 * Without a key (local development) the message is printed to the server log
 * instead, so flows like password reset can be exercised end to end.
 * Never throws: a mail outage must not break the request that triggered it.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (isProd) console.warn(`[mail] RESEND_API_KEY is not set — "${mail.subject}" was NOT sent`);
    else if (env.NODE_ENV !== "test") console.info(`[mail:dev] To: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[mail] Resend rejected "${mail.subject}": ${res.status} ${await res.text()}`);
  } catch (e) {
    console.error(`[mail] Failed to send "${mail.subject}"`, e);
  }
}
