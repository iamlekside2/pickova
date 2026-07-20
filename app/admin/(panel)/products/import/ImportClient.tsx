"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Download, RotateCcw } from "lucide-react";
import { ProductForm, type ProductInitial } from "../ProductForm";
import { createProduct } from "../actions";
import { fetchDraftAction, type ImportState } from "./actions";

type Option = { id: string; name: string };

type ImportClientProps = {
  categories: Option[];
  collections: Option[];
  suppliers: Option[];
  defaultMarkup: number;
  brightDataAvailable: boolean;
};

function FetchButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
    >
      <Download size={16} />
      {pending ? "Fetching…" : "Fetch product"}
    </button>
  );
}

export function ImportClient({
  categories,
  collections,
  suppliers,
  defaultMarkup,
  brightDataAvailable,
}: ImportClientProps) {
  const [state, formAction] = useFormState(fetchDraftAction, {} as ImportState);

  if (state.draft) {
    const d = state.draft;
    const initial: ProductInitial = {
      name: d.name,
      description: d.description,
      price: 0, // let the form compute from cost × default markup
      costPrice: d.costPrice,
      stock: 0,
      status: "active",
      categoryId: "",
      collectionId: null,
      supplierId: null,
      supplierSku: null,
      source: "local",
      affiliateUrl: d.sourceUrl,
      images: d.imageUrl ? [d.imageUrl] : [],
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-green/30 bg-brand-green/5 px-4 py-3 text-sm">
          <span className="font-semibold text-brand-green">
            Pulled from source — review, set category &amp; markup, then publish.
          </span>
          <Link
            href="/admin/products/import"
            className="flex items-center gap-1.5 font-semibold text-brand-muted hover:text-brand-green"
          >
            <RotateCcw size={14} /> Try another URL
          </Link>
        </div>

        {d.currency && d.currency !== "NGN" && (
          <div className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 px-4 py-2.5 text-sm text-brand-ink">
            Source price was <b>{d.currency} {d.costPrice.toLocaleString()}</b> — set the
            cost price in naira before publishing.
          </div>
        )}

        <ProductForm
          action={createProduct}
          categories={categories}
          collections={collections}
          suppliers={suppliers}
          initial={initial}
          defaultMarkup={defaultMarkup}
          submitLabel="Publish product"
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <form action={formAction} className="flex flex-col gap-3">
        {state.error && (
          <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
            {state.error}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-brand-ink">Product URL</span>
          <input
            name="url"
            type="url"
            required
            placeholder="https://www.example.com/product/…"
            className="rounded-lg border border-brand-line-2 bg-white px-3.5 py-3 text-sm text-brand-ink outline-none focus:border-brand-green"
          />
          <span className="text-xs text-brand-muted-2">
            We read the page&apos;s title, image and price.
            {!brightDataAvailable &&
              " Protected sites (Amazon, AliExpress, Jumia) may block this — you can still add the product manually."}
          </span>
        </label>

        {brightDataAvailable ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-brand-ink">Fetch method</span>
            <select
              name="method"
              defaultValue="metadata"
              className="rounded-lg border border-brand-line-2 bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-green"
            >
              <option value="metadata">Standard (open sites)</option>
              <option value="brightdata">Bright Data (protected sites — Amazon, AliExpress, Jumia)</option>
            </select>
          </label>
        ) : (
          <input type="hidden" name="method" value="metadata" />
        )}
        <div className="flex items-center gap-3">
          <FetchButton />
          <Link
            href="/admin/products/new"
            className="text-sm font-semibold text-brand-muted hover:text-brand-green"
          >
            Add manually instead
          </Link>
        </div>
      </form>
    </div>
  );
}
