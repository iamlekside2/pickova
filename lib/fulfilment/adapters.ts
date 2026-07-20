// Pluggable supplier fulfilment adapters. Each supplier has an `adapterKey`
// that maps to one of these. `manual` queues the order for a human; `generic-rest`
// POSTs it to the supplier's API and auto-forwards. New suppliers with their own
// APIs become a new adapter here — the rest of the pipeline is unchanged.

import type { Supplier } from "@prisma/client";
import type { SupplierOrderStatus } from "@/lib/constants";

export type FulfilmentItem = {
  name: string;
  price: number;
  qty: number;
  supplierSku: string | null;
};

export type PlaceOrderContext = {
  supplier: Supplier;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
  };
  items: FulfilmentItem[];
};

export type PlaceOrderResult = {
  status: SupplierOrderStatus;
  externalRef?: string;
  trackingNumber?: string;
  payload?: unknown;
};

export interface SupplierAdapter {
  key: string;
  placeOrder(ctx: PlaceOrderContext): Promise<PlaceOrderResult>;
}

/** Manual — no API. Drops the order into the admin queue for a human to place. */
const manualAdapter: SupplierAdapter = {
  key: "manual",
  async placeOrder() {
    return {
      status: "awaiting_manual",
      payload: { note: "Queued for manual fulfilment by admin." },
    };
  },
};

/** Generic REST — POSTs the order to the supplier's own ordering endpoint. */
const genericRestAdapter: SupplierAdapter = {
  key: "generic-rest",
  async placeOrder(ctx) {
    const base = ctx.supplier.apiBaseUrl.trim();
    if (!base) {
      return {
        status: "awaiting_manual",
        payload: { reason: "No API base URL configured — routed to manual queue." },
      };
    }

    let creds: { apiKey?: string } = {};
    try {
      creds = JSON.parse(ctx.supplier.apiCredentials || "{}");
    } catch {
      creds = {};
    }

    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(creds.apiKey ? { Authorization: `Bearer ${creds.apiKey}` } : {}),
        },
        body: JSON.stringify({
          reference: ctx.order.orderNumber,
          customer: {
            name: ctx.order.customerName,
            phone: ctx.order.customerPhone,
            address: ctx.order.deliveryAddress,
          },
          items: ctx.items.map((i) => ({ sku: i.supplierSku, name: i.name, qty: i.qty })),
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        return { status: "failed", payload: { httpStatus: res.status } };
      }
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      return {
        status: "placed",
        externalRef: String(data.id ?? data.orderId ?? ""),
        trackingNumber: String(data.tracking ?? data.trackingNumber ?? ""),
        payload: data,
      };
    } catch (err) {
      return { status: "failed", payload: { error: String(err) } };
    }
  },
};

const ADAPTERS: Record<string, SupplierAdapter> = {
  manual: manualAdapter,
  "generic-rest": genericRestAdapter,
};

/** Resolve a supplier's adapter, falling back to manual for unknown keys. */
export function getAdapter(key: string): SupplierAdapter {
  return ADAPTERS[key] ?? manualAdapter;
}
