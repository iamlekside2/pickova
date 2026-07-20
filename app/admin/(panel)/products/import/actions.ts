"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getImporter } from "@/lib/import/registry";
import type { ProductDraft } from "@/lib/import/types";

export type ImportState = { error?: string; draft?: ProductDraft };

export async function fetchDraftAction(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const url = String(formData.get("url") ?? "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return { error: "Enter a valid http(s) product URL." };
  }

  const method = String(formData.get("method") ?? "metadata");
  const res = await getImporter(method).fetchDraft(url);
  if (!res.ok) return { error: res.error };
  return { draft: res.draft };
}
