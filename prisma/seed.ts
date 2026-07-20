// Seeds the database from the shared catalog data (lib/catalog-data.ts), so the
// DB mirrors what the static storefront currently renders. Idempotent: wipes
// and re-inserts. Run with `npm run db:seed` (Prisma loads .env first).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CATEGORY_DATA,
  COLLECTION_DATA,
  COLLECTION_HERO_IMAGES,
  deriveProductMeta,
  slugify,
  unsplashUrl,
} from "../lib/catalog-data";
import { buildAffiliateUrl } from "../lib/jumia";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Pickova…");

  // 1. Clear existing data (FK-safe order).
  await prisma.productView.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.supplierOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.adminUser.deleteMany();

  // 2. Categories.
  const categoryIdByName = new Map<string, string>();
  for (const c of CATEGORY_DATA) {
    const row = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        blurb: c.blurb,
        sortOrder: c.sortOrder,
      },
    });
    categoryIdByName.set(c.name, row.id);
  }
  console.log(`  ✓ ${categoryIdByName.size} categories`);

  // 3. Collections (seasons kept as marketing collections).
  const collectionIdBySlug = new Map<string, string>();
  for (const col of COLLECTION_DATA) {
    const heroId = COLLECTION_HERO_IMAGES[col.slug];
    const row = await prisma.collection.create({
      data: {
        name: col.name,
        slug: col.slug,
        active: false,
        months: JSON.stringify(col.months),
        emoji: col.emoji,
        icon: col.icon,
        heroHeadline: col.heroHeadline,
        heroSubtext: col.heroSubtext,
        heroImage: heroId ? unsplashUrl(heroId, 1600, 640) : "",
        themeFrom: col.themeFrom,
        themeTo: col.themeTo,
      },
    });
    collectionIdBySlug.set(col.slug, row.id);
  }
  console.log(`  ✓ ${collectionIdBySlug.size} collections`);

  // 4. Default fulfilment supplier (manual adapter until real APIs are wired).
  const supplier = await prisma.supplier.create({
    data: {
      name: "Pickova Fulfilment (Default)",
      contactEmail: "ops@pickova.com.ng",
      adapterKey: "manual",
      leadTimeDays: 3,
      status: "active",
    },
  });

  // 5. Products — deduped by name (matches the neutral CATALOG). First
  //    occurrence wins, using the same (slug, index) so images/ratings match
  //    the current static storefront exactly.
  const seenNames = new Set<string>();
  let productCount = 0;
  for (const col of COLLECTION_DATA) {
    for (let i = 0; i < col.products.length; i++) {
      const raw = col.products[i];
      const key = raw.name.toLowerCase();
      if (seenNames.has(key)) continue;
      seenNames.add(key);

      const meta = deriveProductMeta(raw, col.slug, i);
      const categoryId = categoryIdByName.get(raw.category);
      if (!categoryId) continue;

      await prisma.product.create({
        data: {
          name: raw.name,
          slug: slugify(raw.name),
          description: `A curated ${raw.category} pick from Pickova, shipped fast across Nigeria.`,
          price: raw.price,
          costPrice: Math.round(raw.price * 0.7), // placeholder 30% margin
          images: JSON.stringify([meta.image]),
          stock: 100,
          status: "active",
          rating: meta.rating,
          source: meta.source,
          affiliateUrl: buildAffiliateUrl(raw.name, meta.source),
          categoryId,
          collectionId: collectionIdBySlug.get(col.slug) ?? null,
          supplierId: supplier.id,
          supplierSku: `${col.slug}-${i}`,
        },
      });
      productCount++;
    }
  }
  console.log(`  ✓ ${productCount} products (1 supplier)`);

  // 6. A demo coupon.
  await prisma.coupon.create({
    data: { code: "WELCOME10", type: "percent", value: 10, active: true },
  });

  // 7. First admin user (credentials from env).
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pickova.com.ng";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "pickova123";
  await prisma.adminUser.create({
    data: {
      email: adminEmail,
      name: "Pickova Owner",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "owner",
    },
  });
  console.log(`  ✓ admin user: ${adminEmail}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
