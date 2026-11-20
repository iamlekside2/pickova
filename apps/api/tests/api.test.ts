import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CartQuoteDTO, Paginated, ProductDetailDTO, ProductSummaryDTO } from "@pickova/shared";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { evaluateCoupon } from "../src/modules/cart/quote.service";

const app = createApp();
const api = "/api/v1";
const testEmail = `shopper-${Date.now()}@example.test`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@example.test" } } });
  await prisma.newsletterSubscriber.deleteMany({ where: { email: { endsWith: "@example.test" } } });
});

describe("platform", () => {
  it("reports health and sends security headers", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get(`${api}/nope`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("blocks state-changing requests from other origins (CSRF)", async () => {
    const res = await request(app).post(`${api}/newsletter`).set("Origin", "https://evil.example").send({ email: "a@example.test" });
    expect(res.status).toBe(403);
  });

  it("only allows the storefront origin through CORS", async () => {
    const ok = await request(app).get(`${api}/categories`).set("Origin", "http://localhost:3009");
    expect(ok.headers["access-control-allow-origin"]).toBe("http://localhost:3009");
    const other = await request(app).get(`${api}/categories`).set("Origin", "https://evil.example");
    expect(other.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("catalogue", () => {
  it("lists active products with pagination and integer kobo prices", async () => {
    const res = await request(app).get(`${api}/products?pageSize=5`);
    const body = res.body as Paginated<ProductSummaryDTO>;
    expect(res.status).toBe(200);
    expect(body.items).toHaveLength(5);
    expect(body.total).toBeGreaterThanOrEqual(12);
    for (const p of body.items) {
      expect(Number.isInteger(p.priceKobo)).toBe(true);
      expect(p.rating).toBeNull(); // no reviews seeded → no rating shown
    }
  });

  it("filters by several categories at once (AND)", async () => {
    const res = await request(app).get(`${api}/products?category=men,sports&pageSize=48`);
    const slugs = (res.body as Paginated<ProductSummaryDTO>).items.map((p) => p.slug);
    expect(slugs).toContain("nike-free-rn-flyknit-red");
    expect(slugs).not.toContain("puma-smash-suede-navy"); // men + casual
    expect(slugs).not.toContain("nike-air-max-90-pink-blue"); // women + sports
  });

  it("searches, sorts by price and filters by price range", async () => {
    const search = await request(app).get(`${api}/products?q=dunk`);
    expect((search.body as Paginated<ProductSummaryDTO>).items.every((p) => /dunk/i.test(p.name))).toBe(true);

    const sorted = await request(app).get(`${api}/products?sort=price-asc&pageSize=48`);
    const prices = (sorted.body as Paginated<ProductSummaryDTO>).items.map((p) => p.priceKobo);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const ranged = await request(app).get(`${api}/products?minPrice=40000&maxPrice=45000&pageSize=48`);
    for (const p of (ranged.body as Paginated<ProductSummaryDTO>).items) {
      expect(p.priceKobo).toBeGreaterThanOrEqual(4_000_000);
      expect(p.priceKobo).toBeLessThanOrEqual(4_500_000);
    }
  });

  it("only returns sale items when onSale is set", async () => {
    const res = await request(app).get(`${api}/products?onSale=1&pageSize=48`);
    const items = (res.body as Paginated<ProductSummaryDTO>).items;
    expect(items.length).toBeGreaterThan(0);
    for (const p of items) expect(p.compareAtPriceKobo).toBeGreaterThan(p.priceKobo);
  });

  it("rejects invalid query values with field errors", async () => {
    const res = await request(app).get(`${api}/products?sort=cheapest&page=0`);
    expect(res.status).toBe(422);
    expect(res.body.error.fields).toHaveProperty("sort");
    expect(res.body.error.fields).toHaveProperty("page");
  });

  it("returns product detail with variants and capped availability", async () => {
    const res = await request(app).get(`${api}/products/adidas-samba-og`);
    const p = res.body as ProductDetailDTO;
    expect(res.status).toBe(200);
    expect(p.sizes.map((s) => s.label)).toEqual(["38", "39", "40", "41", "42", "43", "44", "45"]);
    expect(p.colours).toHaveLength(2);
    expect(p.variants).toHaveLength(16);
    for (const v of p.variants) expect(v.available).toBeLessThanOrEqual(10);
  });

  it("hides draft products and 404s unknown slugs", async () => {
    await prisma.product.update({ where: { slug: "adidas-alphabounce-blue" }, data: { status: "DRAFT" } });
    try {
      expect((await request(app).get(`${api}/products/adidas-alphabounce-blue`)).status).toBe(404);
      const list = await request(app).get(`${api}/products?pageSize=48`);
      expect((list.body as Paginated<ProductSummaryDTO>).items.map((p) => p.slug)).not.toContain("adidas-alphabounce-blue");
    } finally {
      await prisma.product.update({ where: { slug: "adidas-alphabounce-blue" }, data: { status: "ACTIVE" } });
    }
    expect((await request(app).get(`${api}/products/does-not-exist`)).status).toBe(404);
  });

  it("lists categories and facets", async () => {
    const categories = await request(app).get(`${api}/categories`);
    expect(categories.body.map((c: { slug: string }) => c.slug)).toEqual(["men", "women", "kids", "sports", "casual"]);
    const facets = await request(app).get(`${api}/products/facets`);
    expect(facets.body.sizes.length).toBeGreaterThan(0);
    expect(facets.body.price.minKobo).toBeLessThan(facets.body.price.maxKobo);
  });
});

describe("database integrity", () => {
  it("refuses negative stock", async () => {
    const inv = await prisma.inventory.findFirstOrThrow();
    await expect(prisma.inventory.update({ where: { variantId: inv.variantId }, data: { quantity: -1 } })).rejects.toThrow();
  });

  it("refuses a 'was' price that is not higher than the price", async () => {
    const p = await prisma.product.findFirstOrThrow();
    await expect(prisma.product.update({ where: { id: p.id }, data: { compareAtPriceKobo: p.priceKobo } })).rejects.toThrow();
  });
});

describe("cart quote", () => {
  let inStock: { id: string; price: number; qty: number };
  let soldOut: { id: string };

  beforeAll(async () => {
    const withStock = await prisma.productVariant.findFirstOrThrow({
      where: { inventory: { quantity: { gte: 2, lte: 10 } }, product: { status: "ACTIVE" } },
      include: { product: true, inventory: true },
    });
    inStock = { id: withStock.id, price: withStock.product.priceKobo, qty: withStock.inventory!.quantity };
    soldOut = await prisma.productVariant.findFirstOrThrow({ where: { inventory: { quantity: 0 } }, select: { id: true } });
  });

  it("prices from the database, ignoring anything else the client sends", async () => {
    const res = await request(app)
      .post(`${api}/cart/quote`)
      .send({ items: [{ variantId: inStock.id, quantity: 2, unitPriceKobo: 1 }], state: "Lagos" });
    const quote = res.body as CartQuoteDTO;
    expect(res.status).toBe(200);
    expect(quote.subtotalKobo).toBe(inStock.price * 2);
    expect(quote.deliveryFeeKobo).toBe(250_000);
    expect(quote.totalKobo).toBe(inStock.price * 2 + 250_000);
    expect(quote.purchasable).toBe(true);
  });

  it("clamps quantities to stock and flags sold-out sizes", async () => {
    const res = await request(app)
      .post(`${api}/cart/quote`)
      .send({ items: [{ variantId: inStock.id, quantity: 10 }, { variantId: soldOut.id, quantity: 1 }] });
    const quote = res.body as CartQuoteDTO;
    const a = quote.lines.find((l) => l.variantId === inStock.id)!;
    const b = quote.lines.find((l) => l.variantId === soldOut.id)!;
    expect(a.quantity).toBe(Math.min(10, inStock.qty));
    expect(b.quantity).toBe(0);
    expect(b.issue).toBe("OUT_OF_STOCK");
    expect(quote.purchasable).toBe(false);
    expect(quote.deliveryFeeKobo).toBeNull(); // no state chosen yet
  });

  it("applies a valid coupon and explains an invalid one", async () => {
    const ok = await request(app).post(`${api}/cart/quote`).send({ items: [{ variantId: inStock.id, quantity: 1 }], couponCode: "welcome10" });
    expect((ok.body as CartQuoteDTO).discountKobo).toBe(Math.min(Math.floor(inStock.price / 10), 1_000_000));
    const bad = await request(app).post(`${api}/cart/quote`).send({ items: [{ variantId: inStock.id, quantity: 1 }], couponCode: "NOPE" });
    expect((bad.body as CartQuoteDTO).discountKobo).toBe(0);
    expect((bad.body as CartQuoteDTO).couponError).toBeTruthy();
  });

  it("rejects malformed carts", async () => {
    const res = await request(app).post(`${api}/cart/quote`).send({ items: [{ variantId: inStock.id, quantity: 0 }] });
    expect(res.status).toBe(422);
  });

  it("evaluates coupon rules", () => {
    const base = { id: "c", code: "X", description: "", type: "PERCENT" as const, value: 20, minSubtotalKobo: 0, maxDiscountKobo: null, startsAt: null, expiresAt: null, usageLimit: null, usedCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    expect(evaluateCoupon(base, 1_000_000)).toEqual({ discountKobo: 200_000 });
    expect(evaluateCoupon({ ...base, maxDiscountKobo: 50_000 }, 1_000_000)).toEqual({ discountKobo: 50_000 });
    expect(evaluateCoupon({ ...base, type: "FIXED", value: 5_000_000 }, 1_000_000)).toEqual({ discountKobo: 1_000_000 });
    expect(evaluateCoupon({ ...base, expiresAt: new Date(Date.now() - 1000) }, 1_000_000)).toHaveProperty("error");
    expect(evaluateCoupon({ ...base, usageLimit: 1, usedCount: 1 }, 1_000_000)).toHaveProperty("error");
    expect(evaluateCoupon({ ...base, minSubtotalKobo: 2_000_000 }, 1_000_000)).toHaveProperty("error");
    expect(evaluateCoupon({ ...base, isActive: false }, 1_000_000)).toHaveProperty("error");
    expect(evaluateCoupon(null, 1_000_000)).toHaveProperty("error");
  });
});

describe("auth", () => {
  const agent = request.agent(app);
  const password = "Sneakers2026";

  it("validates registration input", async () => {
    const res = await request(app).post(`${api}/auth/register`).send({ firstName: "", lastName: "B", email: "not-an-email", password: "short" });
    expect(res.status).toBe(422);
    expect(Object.keys(res.body.error.fields)).toEqual(expect.arrayContaining(["firstName", "email", "password"]));
  });

  it("registers a customer, hashes the password and sets an HTTP-only cookie", async () => {
    const res = await agent
      .post(`${api}/auth/register`)
      .send({ firstName: "Ada", lastName: "Obi", email: testEmail.toUpperCase(), phone: "0803 123 4567", password, role: "ADMIN" });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.role).toBe("CUSTOMER"); // role in the body is ignored
    expect(res.body.user).not.toHaveProperty("passwordHash");
    const cookie = String(res.headers["set-cookie"]);
    expect(cookie).toMatch(/pkv_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);

    const row = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });
    expect(row.passwordHash).not.toContain(password);
    expect(row.passwordHash.startsWith("$2")).toBe(true);
  });

  it("rejects duplicate emails", async () => {
    const res = await request(app).post(`${api}/auth/register`).send({ firstName: "Ada", lastName: "Obi", email: testEmail, password });
    expect(res.status).toBe(409);
  });

  it("returns the signed-in user, and 401 without a session", async () => {
    expect((await agent.get(`${api}/auth/me`)).body.user.email).toBe(testEmail);
    expect((await request(app).get(`${api}/auth/me`)).status).toBe(401);
    expect((await request(app).get(`${api}/auth/me`).set("Cookie", "pkv_session=forged.token.value")).status).toBe(401);
  });

  it("gives the same error for a wrong password and an unknown email", async () => {
    const wrong = await request(app).post(`${api}/auth/login`).send({ email: testEmail, password: "WrongPass1" });
    const unknown = await request(app).post(`${api}/auth/login`).send({ email: "nobody@example.test", password: "WrongPass1" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it("logs in, then invalidates the session when tokenVersion changes", async () => {
    const fresh = request.agent(app);
    expect((await fresh.post(`${api}/auth/login`).send({ email: testEmail, password })).status).toBe(200);
    expect((await fresh.get(`${api}/auth/me`)).status).toBe(200);
    await prisma.user.update({ where: { email: testEmail }, data: { tokenVersion: { increment: 1 } } });
    expect((await fresh.get(`${api}/auth/me`)).status).toBe(401);
  });

  it("logs out by clearing the cookie", async () => {
    const res = await agent.post(`${api}/auth/logout`);
    expect(String(res.headers["set-cookie"])).toMatch(/pkv_session=;/);
    expect((await agent.get(`${api}/auth/me`)).status).toBe(401);
  });
});

describe("store", () => {
  it("serves public settings, banners and delivery zones", async () => {
    const settings = await request(app).get(`${api}/store/settings`);
    expect(settings.body.sampleCatalogue).toBe(true);
    expect(settings.body.freeDeliveryThresholdKobo).toBeNull();
    const banners = await request(app).get(`${api}/store/banners`);
    expect(banners.body.some((b: { placement: string }) => b.placement === "PROMO")).toBe(true);
    const zones = await request(app).get(`${api}/store/delivery-zones`);
    expect(zones.body).toHaveLength(37);
  });

  it("subscribes to the newsletter idempotently", async () => {
    const email = `news-${Date.now()}@example.test`;
    expect((await request(app).post(`${api}/newsletter`).send({ email })).status).toBe(201);
    expect((await request(app).post(`${api}/newsletter`).send({ email })).status).toBe(201);
    expect(await prisma.newsletterSubscriber.count({ where: { email } })).toBe(1);
    expect((await request(app).post(`${api}/newsletter`).send({ email: "nope" })).status).toBe(422);
  });

  it("tracks an order only with the matching reference and email", async () => {
    const order = await prisma.order.create({
      data: {
        reference: `PKV-T${Date.now()}`, customerName: "Ada Obi", email: "tracker@example.test", phone: "08031234567",
        deliveryState: "Lagos", deliveryCity: "Ikeja", deliveryAddress: "1 Test Street",
        subtotalKobo: 3_500_000, deliveryFeeKobo: 250_000, totalKobo: 3_750_000, status: "PAID",
        items: { create: [{ productName: "Court Classic Low", sku: "X", sizeLabel: "42", colourName: "Navy", unitPriceKobo: 3_500_000, quantity: 1, lineTotalKobo: 3_500_000 }] },
        events: { create: [{ status: "PENDING_PAYMENT" }, { status: "PAID" }] },
      },
    });
    try {
      const ok = await request(app).post(`${api}/orders/track`).send({ reference: order.reference.toLowerCase(), email: "Tracker@Example.test" });
      expect(ok.status).toBe(200);
      expect(ok.body.status).toBe("PAID");
      expect(ok.body.timeline).toHaveLength(2);
      expect(JSON.stringify(ok.body)).not.toContain("08031234567"); // no contact details leak
      expect(JSON.stringify(ok.body)).not.toContain("1 Test Street");
      const wrong = await request(app).post(`${api}/orders/track`).send({ reference: order.reference, email: "someone-else@example.test" });
      expect(wrong.status).toBe(404);
    } finally {
      await prisma.order.delete({ where: { id: order.id } });
    }
  });
});
