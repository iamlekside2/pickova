import type { OrderStatus, Role } from "./constants";

/** Shapes returned by the REST API. Dates are ISO strings. */

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
  /** null until the product has approved customer reviews */
  rating: { average: number; count: number } | null;
};

export type VariantDTO = {
  id: string;
  sku: string;
  sizeId: string;
  colourId: string;
  priceKobo: number;
  /** Units available right now (capped — exact stock is not disclosed). */
  available: number;
};

export type ReviewDTO = {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  product?: { name: string; slug: string };
};

export type ProductDetailDTO = ProductSummaryDTO & {
  sku: string;
  description: string;
  images: ProductImageDTO[];
  sizes: SizeDTO[];
  variants: VariantDTO[];
  categories: { name: string; slug: string }[];
  reviews: ReviewDTO[];
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

export type BannerDTO = {
  id: string;
  placement: "ANNOUNCEMENT" | "HERO" | "PROMO";
  title: string;
  subtitle: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type StorefrontSettingsDTO = {
  contact: { email: string | null; phone: string | null; whatsapp: string | null; address: string | null };
  social: { instagram: string | null; tiktok: string | null; facebook: string | null; x: string | null };
  freeDeliveryThresholdKobo: number | null;
  /** true while the catalogue holds sample products rather than real stock */
  sampleCatalogue: boolean;
};

export type UserDTO = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
};

export type CartQuoteLineDTO = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  colourName: string;
  imageUrl: string | null;
  unitPriceKobo: number;
  /** quantity the server will honour (may be lower than requested) */
  quantity: number;
  available: number;
  lineTotalKobo: number;
  /** set when the line was changed or cannot be bought */
  issue: "OUT_OF_STOCK" | "QUANTITY_REDUCED" | "UNAVAILABLE" | null;
};

export type CartQuoteDTO = {
  lines: CartQuoteLineDTO[];
  subtotalKobo: number;
  /** null until a delivery state is chosen */
  deliveryFeeKobo: number | null;
  discountKobo: number;
  totalKobo: number;
  coupon: { code: string; description: string } | null;
  couponError: string | null;
  /** true when every line can be bought as quoted */
  purchasable: boolean;
};

export type DeliveryZoneDTO = { state: string; feeKobo: number; etaMinDays: number; etaMaxDays: number };

export type OrderTrackingDTO = {
  reference: string;
  status: OrderStatus;
  createdAt: string;
  totalKobo: number;
  deliveryState: string;
  deliveryCity: string;
  tracking: { carrier: string | null; number: string | null; url: string | null };
  items: { name: string; sizeLabel: string; colourName: string; quantity: number; imageUrl: string | null }[];
  timeline: { status: OrderStatus; at: string; note: string | null }[];
};

export type AddressDTO = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  state: string;
  city: string;
  line1: string;
  instructions: string | null;
  isDefault: boolean;
};

export type OrderSummaryDTO = {
  reference: string;
  status: OrderStatus;
  createdAt: string;
  totalKobo: number;
  itemCount: number;
  /** first item, for the list thumbnail */
  preview: { name: string; imageUrl: string | null } | null;
};

export type OrderDetailDTO = OrderTrackingDTO & {
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryInstructions: string | null;
  subtotalKobo: number;
  deliveryFeeKobo: number;
  discountKobo: number;
  couponCode: string | null;
  paidAt: string | null;
  lines: {
    name: string;
    slug: string | null;
    sizeLabel: string;
    colourName: string;
    imageUrl: string | null;
    unitPriceKobo: number;
    quantity: number;
    lineTotalKobo: number;
  }[];
};

/** A saved cart, priced the same way as a quote. */
export type SavedCartDTO = { lines: CartQuoteLineDTO[]; couponCode: string | null };

export type AccountOverviewDTO = {
  orderCount: number;
  wishlistCount: number;
  addressCount: number;
  recentOrders: OrderSummaryDTO[];
  defaultAddress: AddressDTO | null;
};

export type CheckoutResponseDTO = {
  orderReference: string;
  /** Paystack's hosted payment page — the browser is sent here. */
  authorizationUrl: string;
};

export type PaymentResultDTO = {
  /** PAID once the payment has been verified by the server; never taken from the browser. */
  outcome: "PAID" | "PENDING" | "FAILED";
  message: string;
  order: {
    reference: string;
    status: OrderStatus;
    totalKobo: number;
    /** partly hidden, e.g. a•••@gmail.com */
    emailHint: string;
    deliveryCity: string;
    deliveryState: string;
    items: { name: string; sizeLabel: string; colourName: string; quantity: number; imageUrl: string | null }[];
  };
};

export type ApiError = {
  error: { code: string; message: string; fields?: Record<string, string[]> };
};
