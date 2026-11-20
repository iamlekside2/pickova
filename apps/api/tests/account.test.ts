import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressDTO, ProductSummaryDTO, SavedCartDTO } from "@pickova/shared";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { createPasswordReset } from "../src/modules/auth/password-reset.service";

const app = createApp();
const api = "/api/v1";
const stamp = Date.now();
const password = "Sneakers2026";

const ada = { agent: request.agent(app), email: `ada-${stamp}@acct.test` };
const bola = { agent: request.agent(app), email: `bola-${stamp}@acct.test` };

const address = {
  label: "Home",
  recipientName: "Ada Obi",
  phone: "08031234567",
  state: "Lagos",
  city: "Ikeja",
  line1: "12 Allen Avenue",
};

beforeAll(async () => {
  for (const u of [ada, bola]) {
    const res = await u.agent.post(`${api}/auth/register`).send({ firstName: "Test", lastName: "User", email: u.email, password });
    expect(res.status).toBe(201);
  }
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { email: { endsWith: "@acct.test" } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: "@acct.test" } } });
});

describe("access control", () => {
  it("rejects every account endpoint without a session", async () => {
    for (const path of ["overview", "addresses", "orders", "wishlist", "cart"]) {
      expect((await request(app).get(`${api}/account/${path}`)).status).toBe(401);
    }
    expect((await request(app).patch(`${api}/account/profile`).send({})).status).toBe(401);
  });
});

describe("profile", () => {
  it("updates name and phone, and validates input", async () => {
    const ok = await ada.agent.patch(`${api}/account/profile`).send({ firstName: "Ada", lastName: "Obi", phone: "+234 803 123 4567", role: "ADMIN", email: "hacker@acct.test" });
    expect(ok.status).toBe(200);
    expect(ok.body.user).toMatchObject({ firstName: "Ada", lastName: "Obi", phone: "+2348031234567", role: "CUSTOMER", email: ada.email });

    const bad = await ada.agent.patch(`${api}/account/profile`).send({ firstName: "", lastName: "Obi", phone: "12345" });
    expect(bad.status).toBe(422);
    expect(Object.keys(bad.body.error.fields)).toEqual(expect.arrayContaining(["firstName", "phone"]));
  });

  it("changes the password only with the current one, and signs out other devices", async () => {
    const other = request.agent(app);
    await other.post(`${api}/auth/login`).send({ email: ada.email, password });

    const wrong = await ada.agent.post(`${api}/account/change-password`).send({ currentPassword: "NotMyPass1", newPassword: "BrandNew2026" });
    expect(wrong.status).toBe(422);
    expect(wrong.body.error.fields).toHaveProperty("currentPassword");

    const ok = await ada.agent.post(`${api}/account/change-password`).send({ currentPassword: password, newPassword: "BrandNew2026" });
    expect(ok.status).toBe(200);
    expect((await ada.agent.get(`${api}/auth/me`)).status).toBe(200); // this device stays signed in
    expect((await other.get(`${api}/auth/me`)).status).toBe(401); // the other one does not
    expect((await request(app).post(`${api}/auth/login`).send({ email: ada.email, password })).status).toBe(401);
    expect((await request(app).post(`${api}/auth/login`).send({ email: ada.email, password: "BrandNew2026" })).status).toBe(200);
  });
});

describe("password reset", () => {
  it("answers identically for known and unknown emails", async () => {
    const known = await request(app).post(`${api}/auth/forgot-password`).send({ email: bola.email });
    const unknown = await request(app).post(`${api}/auth/forgot-password`).send({ email: "nobody@acct.test" });
    expect(known.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
    expect(await createPasswordReset("nobody@acct.test")).toBeNull();
  });

  it("stores only a hash, resets once, and ends existing sessions", async () => {
    const token = (await createPasswordReset(bola.email))!;
    const rows = await prisma.passwordResetToken.findMany({ where: { user: { email: bola.email } } });
    expect(rows).toHaveLength(1); // the earlier request's token was replaced
    expect(rows[0]!.tokenHash).not.toBe(token);

    expect((await request(app).post(`${api}/auth/reset-password`).send({ token, password: "weak" })).status).toBe(422);
    expect((await request(app).post(`${api}/auth/reset-password`).send({ token: "x".repeat(43), password: "Recovered2026" })).status).toBe(400);

    expect((await request(app).post(`${api}/auth/reset-password`).send({ token, password: "Recovered2026" })).status).toBe(200);
    expect((await bola.agent.get(`${api}/auth/me`)).status).toBe(401); // old session is dead
    expect((await request(app).post(`${api}/auth/reset-password`).send({ token, password: "Another2026" })).status).toBe(400); // single use
    expect((await bola.agent.post(`${api}/auth/login`).send({ email: bola.email, password: "Recovered2026" })).status).toBe(200);
  });

  it("rejects expired tokens", async () => {
    const token = (await createPasswordReset(bola.email))!;
    await prisma.passwordResetToken.updateMany({ where: { user: { email: bola.email } }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await request(app).post(`${api}/auth/reset-password`).send({ token, password: "TooLate2026" })).status).toBe(400);
  });
});

describe("addresses", () => {
  let first: AddressDTO;
  let second: AddressDTO;

  it("makes the first address the default and validates Nigerian details", async () => {
    const bad = await ada.agent.post(`${api}/account/addresses`).send({ ...address, state: "Atlantis", phone: "555" });
    expect(bad.status).toBe(422);
    expect(Object.keys(bad.body.error.fields)).toEqual(expect.arrayContaining(["state", "phone"]));

    const res = await ada.agent.post(`${api}/account/addresses`).send(address);
    expect(res.status).toBe(201);
    first = res.body;
    expect(first.isDefault).toBe(true);
  });

  it("keeps exactly one default", async () => {
    second = (await ada.agent.post(`${api}/account/addresses`).send({ ...address, label: "Office", line1: "5 Broad Street", isDefault: true })).body;
    const list = (await ada.agent.get(`${api}/account/addresses`)).body as AddressDTO[];
    expect(list.filter((a) => a.isDefault).map((a) => a.id)).toEqual([second.id]);
    expect(list[0]!.id).toBe(second.id); // default first
  });

  it("does not let one customer read, edit or delete another's address", async () => {
    expect((await bola.agent.get(`${api}/account/addresses`)).body).toEqual([]);
    expect((await bola.agent.put(`${api}/account/addresses/${first.id}`).send(address)).status).toBe(404);
    expect((await bola.agent.delete(`${api}/account/addresses/${first.id}`)).status).toBe(404);
    expect(await prisma.address.count({ where: { id: first.id } })).toBe(1);
  });

  it("updates, and promotes another address when the default is deleted", async () => {
    const updated = await ada.agent.put(`${api}/account/addresses/${first.id}`).send({ ...address, city: "Lekki" });
    expect(updated.body.city).toBe("Lekki");
    expect((await ada.agent.delete(`${api}/account/addresses/${second.id}`)).status).toBe(200);
    const list = (await ada.agent.get(`${api}/account/addresses`)).body as AddressDTO[];
    expect(list).toHaveLength(1);
    expect(list[0]!.isDefault).toBe(true);
  });
});

describe("wishlist", () => {
  it("adds, merges device items, ignores unknown ids and removes", async () => {
    const products = await prisma.product.findMany({ where: { status: "ACTIVE" }, take: 3, select: { id: true } });
    const [a, b, c] = products.map((p) => p.id) as [string, string, string];

    expect((await ada.agent.put(`${api}/account/wishlist/${a}`)).status).toBe(200);
    expect((await ada.agent.put(`${api}/account/wishlist/${a}`)).status).toBe(200); // idempotent
    expect((await ada.agent.put(`${api}/account/wishlist/does-not-exist`)).status).toBe(404);

    const merged = (await ada.agent.post(`${api}/account/wishlist/merge`).send({ productIds: [a, b, c, "ghost"] })).body as ProductSummaryDTO[];
    expect(merged.map((p) => p.id).sort()).toEqual([a, b, c].sort());

    await ada.agent.delete(`${api}/account/wishlist/${b}`);
    const list = (await ada.agent.get(`${api}/account/wishlist`)).body as ProductSummaryDTO[];
    expect(list.map((p) => p.id).sort()).toEqual([a, c].sort());
    expect((await bola.agent.get(`${api}/account/wishlist`)).body).toEqual([]);
  });
});

describe("saved cart", () => {
  it("saves, merges without doubling, replaces and stays private", async () => {
    const variants = await prisma.productVariant.findMany({ where: { inventory: { quantity: { gte: 4 } }, product: { status: "ACTIVE" } }, take: 2, select: { id: true } });
    const [v1, v2] = variants.map((v) => v.id) as [string, string];

    const saved = (await ada.agent.put(`${api}/account/cart`).send({ items: [{ variantId: v1, quantity: 2 }] })).body as SavedCartDTO;
    expect(saved.lines).toHaveLength(1);
    expect(saved.lines[0]).toMatchObject({ variantId: v1, quantity: 2 });
    expect(saved.lines[0]!.unitPriceKobo).toBeGreaterThan(0); // priced by the server

    // Signing in on a device with a guest cart: keep the larger quantity, add new lines.
    const body = { items: [{ variantId: v1, quantity: 1 }, { variantId: v2, quantity: 3 }, { variantId: "ghost", quantity: 1 }], merge: true };
    const merged = (await ada.agent.put(`${api}/account/cart`).send(body)).body as SavedCartDTO;
    expect(Object.fromEntries(merged.lines.map((l) => [l.variantId, l.quantity]))).toEqual({ [v1]: 2, [v2]: 3 });
    const again = (await ada.agent.put(`${api}/account/cart`).send(body)).body as SavedCartDTO;
    expect(again.lines.map((l) => l.quantity).sort()).toEqual([2, 3]); // merging twice changes nothing

    const withCoupon = (await ada.agent.put(`${api}/account/cart`).send({ items: [{ variantId: v2, quantity: 1 }], couponCode: "welcome10" })).body as SavedCartDTO;
    expect(withCoupon.lines.map((l) => l.variantId)).toEqual([v2]);
    expect(withCoupon.couponCode).toBe("WELCOME10");

    expect(((await bola.agent.get(`${api}/account/cart`)).body as SavedCartDTO).lines).toEqual([]);
    expect(((await ada.agent.put(`${api}/account/cart`).send({ items: [], couponCode: null })).body as SavedCartDTO)).toEqual({ lines: [], couponCode: null });
  });
});

describe("orders", () => {
  it("lists only the customer's own orders and hides others", async () => {
    const adaUser = await prisma.user.findUniqueOrThrow({ where: { email: ada.email } });
    const order = await prisma.order.create({
      data: {
        reference: `PKV-A${stamp}`, userId: adaUser.id, customerName: "Ada Obi", email: ada.email, phone: "08031234567",
        deliveryState: "Lagos", deliveryCity: "Ikeja", deliveryAddress: "12 Allen Avenue",
        subtotalKobo: 8_500_000, deliveryFeeKobo: 250_000, totalKobo: 8_750_000, status: "PAID", paidAt: new Date(),
        items: { create: [{ productName: "Nike Air Force 1 '07 White", sku: "X", sizeLabel: "42", colourName: "White", unitPriceKobo: 4_250_000, quantity: 2, lineTotalKobo: 8_500_000 }] },
        events: { create: [{ status: "PENDING_PAYMENT" }, { status: "PAID" }] },
      },
    });

    const list = await ada.agent.get(`${api}/account/orders`);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).toMatchObject({ reference: order.reference, status: "PAID", itemCount: 2, totalKobo: 8_750_000 });

    const detail = await ada.agent.get(`${api}/account/orders/${order.reference.toLowerCase()}`);
    expect(detail.status).toBe(200);
    expect(detail.body.lines[0].lineTotalKobo).toBe(8_500_000);
    expect(detail.body.timeline).toHaveLength(2);

    expect((await bola.agent.get(`${api}/account/orders`)).body.total).toBe(0);
    expect((await bola.agent.get(`${api}/account/orders/${order.reference}`)).status).toBe(404);

    const overview = await ada.agent.get(`${api}/account/overview`);
    expect(overview.body).toMatchObject({ orderCount: 1, addressCount: 1, wishlistCount: 2 });
    expect(overview.body.defaultAddress.city).toBe("Lekki");
    expect(overview.headers["cache-control"]).toBe("no-store");
  });
});
