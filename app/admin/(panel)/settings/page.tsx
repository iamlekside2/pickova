import type { Metadata } from "next";
import { getDefaultMarkupPercent } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const defaultMarkup = await getDefaultMarkupPercent();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Settings</h1>
        <p className="text-sm text-brand-muted">Store-wide configuration.</p>
      </div>

      <div className="rounded-card border border-brand-line-2 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-extrabold text-brand-green">Pricing</h2>
        <SettingsForm defaultMarkup={defaultMarkup} />
      </div>
    </div>
  );
}
