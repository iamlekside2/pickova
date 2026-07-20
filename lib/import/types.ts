// A product "draft" pulled from an external source, before markup + publish.
export type ProductDraft = {
  name: string;
  imageUrl: string;
  costPrice: number; // numeric price found on the source (currency may vary)
  currency: string;
  sourceUrl: string;
  description: string;
};

export type ImportResult =
  | { ok: true; draft: ProductDraft }
  | { ok: false; error: string };

export interface ProductImporter {
  key: string;
  fetchDraft(url: string): Promise<ImportResult>;
}
