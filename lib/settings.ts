import { prisma } from "@/lib/db";

export const DEFAULT_MARKUP_KEY = "default_markup_percent";

export async function getSetting(key: string, fallback: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** Global default markup percent applied to imported/new products (cost → sale). */
export async function getDefaultMarkupPercent(): Promise<number> {
  const v = await getSetting(DEFAULT_MARKUP_KEY, "40");
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 40;
}
