import type {
  BannerDTO,
  CategoryDTO,
  Paginated,
  ProductDetailDTO,
  ProductFacetsDTO,
  ProductSummaryDTO,
  ReviewDTO,
  StorefrontSettingsDTO,
} from "@pickova/shared";
import { ApiRequestError, api, toQuery } from "./api";

/** Server-side data access for the storefront. Short cache keeps pages fast
 *  while stock and prices stay close to live; the cart is always re-priced
 *  uncached before any money moves. */
const CACHE = 30;

export type ProductListParams = {
  q?: string;
  category?: string;
  size?: string;
  colour?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export function getProducts(params: ProductListParams = {}) {
  return api<Paginated<ProductSummaryDTO>>(`/products${toQuery(params)}`, { revalidate: CACHE, tags: ["products"] });
}

export async function getProduct(slug: string): Promise<ProductDetailDTO | null> {
  try {
    return await api<ProductDetailDTO>(`/products/${encodeURIComponent(slug)}`, { revalidate: CACHE, tags: ["products"] });
  } catch (e) {
    if (e instanceof ApiRequestError && (e.status === 404 || e.status === 422)) return null;
    throw e;
  }
}

export const getFacets = () => api<ProductFacetsDTO>("/products/facets", { revalidate: CACHE, tags: ["products"] });
export const getCategories = () => api<CategoryDTO[]>("/categories", { revalidate: CACHE, tags: ["categories"] });
export const getBanners = () => api<BannerDTO[]>("/store/banners", { revalidate: CACHE, tags: ["banners"] });
export const getSettings = () => api<StorefrontSettingsDTO>("/store/settings", { revalidate: CACHE, tags: ["settings"] });
export const getFeaturedReviews = () => api<ReviewDTO[]>("/reviews/featured?limit=3", { revalidate: CACHE, tags: ["reviews"] });
