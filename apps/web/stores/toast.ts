"use client";

import { create } from "zustand";

export type Toast = { id: number; message: string; action?: { label: string; href: string }; tone: "success" | "error" };

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id" | "tone"> & { tone?: Toast["tone"] }) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { tone: "success", ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
