// Central status vocabularies. Stored as plain strings in the DB (SQLite has no
// native enums and this keeps the Postgres swap mechanical), typed here so the
// app has compile-time safety.

export const PRODUCT_STATUS = ["active", "draft", "out_of_stock"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const ORDER_STATUS = [
  "pending_payment",
  "paid",
  "forwarded",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const ORDER_ITEM_STATUS = [
  "pending",
  "forwarded",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderItemStatus = (typeof ORDER_ITEM_STATUS)[number];

export const SUPPLIER_ORDER_STATUS = [
  "pending",
  "awaiting_manual",
  "placed",
  "shipped",
  "delivered",
  "failed",
] as const;
export type SupplierOrderStatus = (typeof SUPPLIER_ORDER_STATUS)[number];

export const SUPPLIER_ADAPTERS = ["manual", "generic-rest"] as const;
export type SupplierAdapterKey = (typeof SUPPLIER_ADAPTERS)[number];

export const ADMIN_ROLES = ["owner", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
