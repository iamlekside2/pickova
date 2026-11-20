import { z } from "zod";
import { MAX_QTY_PER_LINE, NIGERIAN_STATES, PRODUCT_SORTS } from "./constants";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

/** Nigerian mobile numbers: 080…, 23480…, +23480… */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email,
  phone: phoneSchema.optional().or(z.literal("").transform(() => undefined)),
  password: passwordSchema,
});
export type RegisterInput = z.input<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(72),
});
export type LoginInput = z.input<typeof loginSchema>;

export const newsletterSchema = z.object({ email });

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(72),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  phone: phoneSchema.optional().or(z.literal("").transform(() => undefined)),
});
export type ProfileInput = z.input<typeof profileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a name").max(30).default("Home"),
  recipientName: z.string().trim().min(2, "Enter the recipient's name").max(120),
  phone: phoneSchema,
  state: z.enum(NIGERIAN_STATES, { errorMap: () => ({ message: "Choose a state" }) }),
  city: z.string().trim().min(2, "Enter a city or town").max(80),
  line1: z.string().trim().min(5, "Enter the full street address").max(200),
  instructions: z.string().trim().max(300).optional().or(z.literal("").transform(() => undefined)),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.input<typeof addressSchema>;

const id = z.string().min(1).max(40);

/** Wishlist entries saved on this device, sent once after signing in. */
export const wishlistMergeSchema = z.object({ productIds: z.array(id).max(200) });

const csv = z
  .string()
  .max(200)
  .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
  .optional();

const flag = z
  .enum(["1", "true"])
  .transform(() => true)
  .optional();

/** Query string accepted by GET /products. */
export const productQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  /** category slugs; a product must be in ALL of them (e.g. men + sports) */
  category: csv,
  size: csv,
  colour: csv,
  minPrice: z.coerce.number().int().min(0).optional(), // naira
  maxPrice: z.coerce.number().int().min(0).optional(), // naira
  featured: flag,
  newArrival: flag,
  bestSeller: flag,
  onSale: flag,
  inStock: flag,
  sort: z.enum(PRODUCT_SORTS).default("newest"),
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});
export type ProductQuery = z.output<typeof productQuerySchema>;

export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
});

export const cartQuoteSchema = z.object({
  items: z.array(cartLineSchema).max(50),
  state: z.string().max(40).optional(),
  couponCode: z.string().trim().max(40).optional(),
});
export type CartQuoteInput = z.input<typeof cartQuoteSchema>;

/** Everything needed to place an order. Prices are never part of this — the
 *  server prices the items itself. */
export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty").max(50),
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  email,
  phone: phoneSchema,
  state: z.enum(NIGERIAN_STATES, { errorMap: () => ({ message: "Choose a state" }) }),
  city: z.string().trim().min(2, "Enter a city or town").max(80),
  address: z.string().trim().min(5, "Enter the full delivery address").max(200),
  instructions: z.string().trim().max(300).optional().or(z.literal("").transform(() => undefined)),
  couponCode: z.string().trim().max(40).optional().or(z.literal("").transform(() => undefined)),
  /** The total the customer was shown. If the server's total differs (a price
   *  or fee changed meanwhile) the order is refused so nobody is surprised. */
  expectedTotalKobo: z.number().int().min(0),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const verifyPaymentSchema = z.object({ reference: z.string().trim().min(6).max(60) });

/** The signed-in customer's saved cart. `merge` adds to what is already saved
 *  (used once after sign-in); otherwise the saved cart is replaced. */
export const savedCartSchema = z.object({
  items: z.array(cartLineSchema).max(50),
  couponCode: z.string().trim().max(40).nullable().optional(),
  merge: z.boolean().optional(),
});

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const trackOrderSchema = z.object({
  reference: z.string().trim().toUpperCase().min(4, "Enter your order reference").max(40),
  email,
});
export type TrackOrderInput = z.input<typeof trackOrderSchema>;
