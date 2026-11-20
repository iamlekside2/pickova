/** Shapes the storefront components work with. */

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
};

export type ColourDTO = { id: string; name: string; hex: string };
export type SizeDTO = { id: string; label: string; system: string };

export type ProductImageDTO = { id: string; url: string; alt: string; colourId: string | null };

/** Card-sized product, used in every listing. */
export type ProductSummaryDTO = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  priceKobo: number;
  compareAtPriceKobo: number | null;
  image: ProductImageDTO | null;
  colours: ColourDTO[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  inStock: boolean;
};

export type VariantDTO = {
  /** Also the order code quoted in the WhatsApp message, e.g. AD-SAMBA-WHI-42 */
  id: string;
  sku: string;
  sizeId: string;
  colourId: string;
  priceKobo: number;
  /** How many one order may include; 0 when the size is sold out. */
  available: number;
};

export type ProductDetailDTO = ProductSummaryDTO & {
  sku: string;
  description: string;
  images: ProductImageDTO[];
  sizes: SizeDTO[];
  variants: VariantDTO[];
  categories: { name: string; slug: string }[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductFacetsDTO = {
  categories: CategoryDTO[];
  sizes: SizeDTO[];
  colours: ColourDTO[];
  price: { minKobo: number; maxKobo: number };
};

/** One cart line after it has been checked against the current catalogue. */
export type QuoteLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  colourName: string;
  imageUrl: string | null;
  unitPriceKobo: number;
  quantity: number;
  available: number;
  lineTotalKobo: number;
  issue: "OUT_OF_STOCK" | "UNAVAILABLE" | null;
};

export type Quote = {
  lines: QuoteLine[];
  subtotalKobo: number;
  /** null until a delivery state is chosen */
  deliveryFeeKobo: number | null;
  totalKobo: number;
  /** true when every line can be ordered */
  orderable: boolean;
};
