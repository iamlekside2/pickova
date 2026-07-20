import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CollectionForm } from "../CollectionForm";
import { createCollection } from "../actions";

export const metadata: Metadata = { title: "New collection" };

export default function NewCollectionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/marketing/collections"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Collections
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">
        New collection
      </h1>
      <CollectionForm action={createCollection} submitLabel="Create collection" />
    </div>
  );
}
