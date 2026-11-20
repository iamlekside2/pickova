import { NIGERIAN_STATES, type NigerianState } from "@/lib/shared";

export type DeliveryZone = { state: NigerianState; feeNaira: number; etaMinDays: number; etaMaxDays: number };

/**
 * Delivery fee estimates per state, in naira. These are STARTING VALUES —
 * set them to what your courier actually charges. The fee shown to customers
 * is labelled an estimate and is confirmed in the WhatsApp chat.
 */
const SOUTH_WEST = new Set<string>(["Ogun", "Oyo", "Osun", "Ondo", "Ekiti"]);

function zoneFor(state: NigerianState): Omit<DeliveryZone, "state"> {
  if (state === "Lagos") return { feeNaira: 2500, etaMinDays: 1, etaMaxDays: 2 };
  if (SOUTH_WEST.has(state)) return { feeNaira: 3500, etaMinDays: 2, etaMaxDays: 4 };
  if (state === "FCT (Abuja)") return { feeNaira: 4000, etaMinDays: 2, etaMaxDays: 4 };
  return { feeNaira: 5000, etaMinDays: 3, etaMaxDays: 6 };
}

export const DELIVERY_ZONES: DeliveryZone[] = NIGERIAN_STATES.map((state) => ({ state, ...zoneFor(state) }));

export const getDeliveryZone = (state: string | null | undefined) => DELIVERY_ZONES.find((z) => z.state === state) ?? null;
