"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { setSetting, DEFAULT_MARKUP_KEY } from "@/lib/settings";

export type SettingsState = { ok?: boolean; error?: string };

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const markup = Math.round(Number(formData.get("defaultMarkup") ?? 0));
  if (!Number.isFinite(markup) || markup < 0) {
    return { error: "Markup must be a positive number." };
  }

  await setSetting(DEFAULT_MARKUP_KEY, String(markup));
  revalidatePath("/admin/settings");
  return { ok: true };
}
