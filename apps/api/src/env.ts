import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  WEB_ORIGIN: z
    .string()
    .default("http://localhost:3009")
    .transform((v) => v.split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean)),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  COOKIE_DOMAIN: z.string().optional().transform((v) => v || undefined),
  /** Public storefront URL used in links inside emails. Defaults to the first WEB_ORIGIN. */
  PUBLIC_SITE_URL: z.string().url().optional(),
  /** Paystack secret key (sk_test_… or sk_live_…). Server-side only. */
  PAYSTACK_SECRET_KEY: z
    .string()
    .optional()
    .transform((v) => v || undefined)
    .refine((v) => !v || /^sk_(test|live)_[A-Za-z0-9]{20,}$/.test(v), "PAYSTACK_SECRET_KEY must look like sk_test_… or sk_live_…"),
  /** Where new-order alerts are emailed. Optional. */
  ADMIN_ORDER_EMAIL: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  RESEND_API_KEY: z.string().optional().transform((v) => v || undefined),
  EMAIL_FROM: z.string().default("Pickova <onboarding@resend.dev>"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  // Fail fast: a misconfigured server must not start.
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const siteUrl = (env.PUBLIC_SITE_URL ?? env.WEB_ORIGIN[0] ?? "http://localhost:3009").replace(/\/$/, "");
