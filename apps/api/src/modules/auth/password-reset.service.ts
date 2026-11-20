import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { siteUrl } from "../../env";
import { HttpError } from "../../lib/errors";
import { emailLayout, sendMail } from "../../lib/mailer";
import { prisma } from "../../lib/prisma";

export const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_MINUTES = 30;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Creates a single-use reset token for the account, if one exists, and returns
 * the raw token (null when there is no such active account). Only the SHA-256
 * of the token is stored, so a database leak cannot be used to reset passwords.
 */
export async function createPasswordReset(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, isActive: true } });
  if (!user || !user.isActive) return null;

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    // A new request invalidates any earlier, unused links.
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000) },
    }),
  ]);
  return token;
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${siteUrl}/account/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: "Reset your Pickova password",
    text: `We received a request to reset your Pickova password.\n\nChoose a new password here (link valid for ${TOKEN_TTL_MINUTES} minutes):\n${link}\n\nIf you didn't ask for this, you can ignore this email — your password will not change.`,
    html: emailLayout(
      "Reset your password",
      `<p style="margin:0 0 20px;line-height:1.6">We received a request to reset your Pickova password. This link is valid for ${TOKEN_TTL_MINUTES} minutes.</p>
       <p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#F28C28;color:#fff;text-decoration:none;font-weight:500;padding:12px 28px;border-radius:999px">Choose a new password</a></p>
       <p style="margin:0;font-size:13px;color:#5F6E90;line-height:1.6">If you didn't ask for this, you can ignore this email — your password will not change.</p>`,
    ),
  });
}

/** Sets a new password from a valid token and signs the user out everywhere. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const invalid = new HttpError(400, "INVALID_TOKEN", "This reset link is invalid or has expired. Please request a new one.");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt <= new Date()) throw invalid;

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.$transaction(async (tx) => {
    // Claim the token atomically so two simultaneous requests cannot both use it.
    const claimed = await tx.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: new Date() } });
    if (claimed.count !== 1) throw invalid;
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash, tokenVersion: { increment: 1 } } });
  });
}
