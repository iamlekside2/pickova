import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/products";
import { STORE } from "@/data/store";
import { getAllProductSlugs, getCategories, getFacets, getProduct, getProducts, quoteCart } from "@/lib/catalog";
import { formatNaira, orderDetailsSchema } from "@/lib/shared";
import { buildOrderMessage, hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("catalogue data", () => {
  it("has unique slugs and order codes, valid prices, and every photo on disk", () => {
    const slugs = getAllProductSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(PRODUCTS.map((p) => p.sku)).size).toBe(PRODUCTS.length);
    const codes = slugs.flatMap((s) => getProduct(s)!.variants.map((v) => v.id));
    expect(new Set(codes).size).toBe(codes.length);

    for (const p of PRODUCTS) {
      expect(p.price, p.name).toBeGreaterThan(0);
      if (p.was !== undefined) expect(p.was, `${p.name}: "was" must be above price`).toBeGreaterThan(p.price);
      expect(p.sizes.length, p.name).toBeGreaterThan(0);
      for (const c of p.colours) {
        expect(c.photos.length, `${p.name} ${c.name}`).toBeGreaterThan(0);
        for (const file of c.photos) expect(existsSync(join(process.cwd(), "public", "products", file)), `missing photo ${file}`).toBe(true);
        for (const s of c.soldOut ?? []) expect(p.sizes, `${p.name}: soldOut size ${s} is not one of its sizes`).toContain(s);
      }
    }
  });
});

describe("listing", () => {
  it("filters by several categories at once, searches and sorts", () => {
    const menSports = getProducts({ category: "men,sports", pageSize: 48 }).items.map((p) => p.slug);
    expect(menSports).toContain("nike-free-rn-flyknit-red");
    expect(menSports).not.toContain("puma-smash-suede-navy");

    expect(getProducts({ q: "dunk" }).items.every((p) => /dunk/i.test(p.name))).toBe(true);
    expect(getProducts({ q: "zzz-nothing" }).total).toBe(0);

    const prices = getProducts({ sort: "price-asc", pageSize: 48 }).items.map((p) => p.priceKobo);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    for (const p of getProducts({ minPrice: 40000, maxPrice: 50000, pageSize: 48 }).items) {
      expect(p.priceKobo).toBeGreaterThanOrEqual(4_000_000);
      expect(p.priceKobo).toBeLessThanOrEqual(5_000_000);
    }
    for (const p of getProducts({ onSale: true, pageSize: 48 }).items) expect(p.compareAtPriceKobo).toBeGreaterThan(p.priceKobo);
  });

  it("paginates and tolerates out-of-range input", () => {
    const first = getProducts({ pageSize: 5 });
    expect(first.items).toHaveLength(5);
    expect(first.totalPages).toBe(Math.ceil(first.total / 5));
    expect(getProducts({ pageSize: 5, page: 999 }).page).toBe(first.totalPages);
    expect(getProducts({ sort: "nonsense" }).items[0]!.slug).toBe(getProducts().items[0]!.slug);
  });

  it("exposes categories, facets and product detail", () => {
    expect(getCategories().map((c) => c.slug)).toEqual(["men", "women", "kids", "sports", "casual"]);
    expect(getFacets().price.minKobo).toBeLessThan(getFacets().price.maxKobo);
    const samba = getProduct("adidas-samba-og")!;
    expect(samba.colours).toHaveLength(2);
    expect(samba.variants).toHaveLength(samba.sizes.length * 2);
    expect(getProduct("nope")).toBeNull();
  });
});

describe("cart quote", () => {
  const samba = getProduct("adidas-samba-og")!;
  const variant = samba.variants[0]!;

  it("prices from the catalogue, adds the state's delivery estimate and caps quantities", () => {
    const quote = quoteCart([{ variantId: variant.id, quantity: 2 }], "Lagos");
    expect(quote.subtotalKobo).toBe(samba.priceKobo * 2);
    expect(quote.deliveryFeeKobo).toBe(250_000);
    expect(quote.totalKobo).toBe(samba.priceKobo * 2 + 250_000);
    expect(quote.orderable).toBe(true);

    expect(quoteCart([{ variantId: variant.id, quantity: 999 }]).lines[0]!.quantity).toBe(10);
    expect(quoteCart([{ variantId: variant.id, quantity: 1 }]).deliveryFeeKobo).toBeNull();
  });

  it("drops unknown items and is not orderable when empty", () => {
    const quote = quoteCart([{ variantId: "does-not-exist", quantity: 1 }], "Lagos");
    expect(quote.lines).toEqual([]);
    expect(quote.orderable).toBe(false);
    expect(quote.totalKobo).toBe(0);
  });
});

describe("WhatsApp order", () => {
  const variant = getProduct("adidas-samba-og")!.variants[0]!;
  const details = orderDetailsSchema.parse({
    customerName: "  Ada Obi ",
    phone: "0803 123 4567",
    state: "Lagos",
    city: "Ikeja",
    address: "12 Allen Avenue",
    note: "Call on arrival",
  });

  it("validates delivery details", () => {
    expect(details.customerName).toBe("Ada Obi");
    expect(details.phone).toBe("08031234567");
    const bad = orderDetailsSchema.safeParse({ customerName: "A", phone: "555", state: "Atlantis", city: "", address: "x" });
    expect(bad.success).toBe(false);
    expect(Object.keys(bad.error!.flatten().fieldErrors).sort()).toEqual(["address", "city", "customerName", "phone", "state"]);
  });

  it("writes every item, total and delivery detail into the message", () => {
    const quote = quoteCart([{ variantId: variant.id, quantity: 2 }], details.state);
    const message = buildOrderMessage(quote, details);
    expect(message).toContain("Adidas Samba OG");
    expect(message).toContain(`size ${variant.sizeId} × 2`);
    expect(message).toContain(`Code: ${variant.id}`);
    expect(message).toContain(`Estimated total: ${formatNaira(quote.totalKobo)}`);
    expect(message).toContain("Ada Obi");
    expect(message).toContain("12 Allen Avenue, Ikeja, Lagos");
    expect(message).toContain("Note: Call on arrival");
  });

  it("links to the store's WhatsApp number with the message safely encoded", () => {
    expect(hasWhatsApp).toBe(true);
    const url = new URL(whatsappUrl("Size 42 & 43?\nThanks #1"));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${STORE.whatsappNumber}`);
    expect(url.searchParams.get("text")).toBe("Size 42 & 43?\nThanks #1");
  });
});
