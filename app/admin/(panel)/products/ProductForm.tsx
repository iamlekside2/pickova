"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";
import type { ProductFormState } from "./actions";

type Option = { id: string; name: string };

export type ProductInitial = {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  status: string;
  categoryId: string;
  collectionId: string | null;
  supplierId: string | null;
  supplierSku: string | null;
  source: string;
  affiliateUrl: string;
  images: string[];
};

type ProductFormProps = {
  action: (prev: ProductFormState, fd: FormData) => Promise<ProductFormState>;
  categories: Option[];
  collections: Option[];
  suppliers: Option[];
  initial?: ProductInitial;
  submitLabel?: string;
  /** Global default markup % (used when there's no per-product markup yet). */
  defaultMarkup?: number;
};

const labelCls = "text-[13px] font-bold text-brand-ink";
const inputCls =
  "rounded-lg border border-brand-line-2 bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-green";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
    >
      <Save size={16} />
      {pending ? "Saving…" : label}
    </button>
  );
}

const saleFromCost = (cost: number, markup: number) => Math.round(cost * (1 + markup / 100));
const markupFromSale = (cost: number, sale: number) =>
  cost > 0 ? Math.round((sale / cost - 1) * 100) : 0;

export function ProductForm({
  action,
  categories,
  collections,
  suppliers,
  initial,
  submitLabel = "Save product",
  defaultMarkup = 40,
}: ProductFormProps) {
  const [state, formAction] = useFormState(action, {} as ProductFormState);

  // Pricing cluster — bidirectional: editing cost or markup recomputes the sale
  // price; editing the sale price back-computes the (override) markup.
  const [cost, setCost] = useState<number>(initial?.costPrice ?? 0);
  const [markup, setMarkup] = useState<number>(
    initial && initial.costPrice > 0 && initial.price > 0
      ? markupFromSale(initial.costPrice, initial.price)
      : defaultMarkup,
  );
  const [price, setPrice] = useState<number>(
    initial && initial.price > 0
      ? initial.price
      : saleFromCost(initial?.costPrice ?? 0, defaultMarkup),
  );

  const onCost = (v: number) => {
    setCost(v);
    setPrice(saleFromCost(v, markup));
  };
  const onMarkup = (v: number) => {
    setMarkup(v);
    setPrice(saleFromCost(cost, v));
  };
  const onPrice = (v: number) => {
    setPrice(v);
    setMarkup(markupFromSale(cost, v));
  };

  const profit = price - cost;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={labelCls}>Product name *</span>
          <input name="name" required defaultValue={initial?.name} className={inputCls} placeholder="e.g. Bluetooth Party Speaker" />
        </label>

        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={labelCls}>Description</span>
          <textarea name="description" rows={3} defaultValue={initial?.description} className={inputCls} />
        </label>

        {/* Pricing calculator */}
        <div className="rounded-lg border border-brand-line-2 bg-brand-bg/40 p-4 md:col-span-2">
          <div className="mb-3 text-[13px] font-bold text-brand-ink">Pricing</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Cost price (₦)</span>
              <input name="costPrice" type="number" min={0} value={cost} onChange={(e) => onCost(Number(e.target.value))} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Markup (%)</span>
              <input type="number" min={0} value={markup} onChange={(e) => onMarkup(Number(e.target.value))} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Sell price (₦) *</span>
              <input name="price" type="number" min={0} required value={price} onChange={(e) => onPrice(Number(e.target.value))} className={inputCls} />
            </label>
          </div>
          <div className="mt-2.5 text-xs text-brand-muted">
            Profit per unit:{" "}
            <span className={profit >= 0 ? "font-bold text-brand-green" : "font-bold text-brand-danger"}>
              ₦{profit.toLocaleString("en-NG")}
            </span>{" "}
            · edit cost or markup to auto-set the sell price, or type a sell price to override.
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Stock</span>
          <input name="stock" type="number" min={0} defaultValue={initial?.stock ?? 0} className={inputCls} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Status</span>
          <select name="status" defaultValue={initial?.status ?? "active"} className={inputCls}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Category *</span>
          <select name="categoryId" required defaultValue={initial?.categoryId ?? ""} className={inputCls}>
            <option value="" disabled>Choose category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Collection (optional)</span>
          <select name="collectionId" defaultValue={initial?.collectionId ?? ""} className={inputCls}>
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Supplier (optional)</span>
          <select name="supplierId" defaultValue={initial?.supplierId ?? ""} className={inputCls}>
            <option value="">None</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Supplier SKU</span>
          <input name="supplierSku" defaultValue={initial?.supplierSku ?? ""} className={inputCls} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Sourced from</span>
          <select name="source" defaultValue={initial?.source ?? "local"} className={inputCls}>
            <option value="local">Local</option>
            <option value="jumia">Jumia</option>
            <option value="konga">Konga</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={labelCls}>Source URL (internal — where you buy it)</span>
          <input name="affiliateUrl" defaultValue={initial?.affiliateUrl ?? ""} className={inputCls} placeholder="https://… (not shown to shoppers)" />
        </label>

        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={labelCls}>Image URLs (one per line)</span>
          <textarea name="images" rows={3} defaultValue={initial?.images.join("\n")} className={inputCls} placeholder="https://images.unsplash.com/…" />
          <span className="text-xs text-brand-muted-2">
            Direct image URLs for now — file upload (Cloudinary) lands next.
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/products" className="text-sm font-semibold text-brand-muted hover:text-brand-green">
          Cancel
        </Link>
      </div>
    </form>
  );
}
