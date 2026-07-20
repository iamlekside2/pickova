import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { CollectionForm, type CollectionInitial } from "../CollectionForm";
import { updateCollection, deleteCollection } from "../actions";

export const metadata: Metadata = { title: "Edit collection" };
export const dynamic = "force-dynamic";

function monthsToInput(json: string): string {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.join(", ") : "";
  } catch {
    return "";
  }
}

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const collection = await prisma.collection.findUnique({ where: { id: params.id } });
  if (!collection) notFound();

  const initial: CollectionInitial = {
    name: collection.name,
    slug: collection.slug,
    active: collection.active,
    months: monthsToInput(collection.months),
    emoji: collection.emoji,
    icon: collection.icon,
    heroHeadline: collection.heroHeadline,
    heroSubtext: collection.heroSubtext,
    heroImage: collection.heroImage,
    themeFrom: collection.themeFrom,
    themeTo: collection.themeTo,
  };
  const boundUpdate = updateCollection.bind(null, collection.id);
  const boundDelete = deleteCollection.bind(null, collection.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/marketing/collections"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Collections
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Edit collection</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-brand-danger/40 px-3 py-2 text-[13px] font-semibold text-brand-danger transition-colors hover:bg-brand-danger/5"
          >
            <Trash2 size={15} /> Delete
          </button>
        </form>
      </div>

      <CollectionForm action={boundUpdate} initial={initial} submitLabel="Save changes" />
    </div>
  );
}
