import { z } from "zod";
import { NIGERIAN_STATES } from "./constants";

/** Nigerian mobile numbers: 080…, 23480…, +23480… */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"));

/** Delivery details the customer fills in before the order opens in WhatsApp. */
export const orderDetailsSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: phoneSchema,
  state: z.enum(NIGERIAN_STATES, { errorMap: () => ({ message: "Choose a state" }) }),
  city: z.string().trim().min(2, "Enter a city or town").max(80),
  address: z.string().trim().min(5, "Enter the full delivery address").max(200),
  note: z.string().trim().max(300).optional(),
});
export type OrderDetails = z.output<typeof orderDetailsSchema>;
export type OrderDetailsInput = z.input<typeof orderDetailsSchema>;
