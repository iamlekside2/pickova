import type { BannerDTO, DeliveryZoneDTO, StorefrontSettingsDTO } from "@pickova/shared";
import { prisma } from "../../lib/prisma";

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Only the settings that are safe to show publicly. */
export async function getStorefrontSettings(): Promise<StorefrontSettingsDTO> {
  const rows = await prisma.storeSetting.findMany({
    where: { key: { in: ["contact", "social", "freeDeliveryThresholdKobo", "sampleCatalogue"] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value as unknown]));
  const contact = obj(map.get("contact"));
  const social = obj(map.get("social"));
  const threshold = map.get("freeDeliveryThresholdKobo");
  return {
    contact: {
      email: str(contact.email),
      phone: str(contact.phone),
      whatsapp: str(contact.whatsapp),
      address: str(contact.address),
    },
    social: {
      instagram: str(social.instagram),
      tiktok: str(social.tiktok),
      facebook: str(social.facebook),
      x: str(social.x),
    },
    freeDeliveryThresholdKobo: typeof threshold === "number" && threshold > 0 ? threshold : null,
    sampleCatalogue: map.get("sampleCatalogue") === true,
  };
}

export async function listActiveBanners(): Promise<BannerDTO[]> {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      isActive: true,
      AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
    },
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
    select: { id: true, placement: true, title: true, subtitle: true, imageUrl: true, ctaLabel: true, ctaHref: true },
  });
}

export async function listDeliveryZones(): Promise<DeliveryZoneDTO[]> {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { state: "asc" },
    select: { state: true, feeKobo: true, etaMinDays: true, etaMaxDays: true },
  });
}
