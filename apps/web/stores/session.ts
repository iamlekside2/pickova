"use client";

import { create } from "zustand";
import type { UserDTO } from "@pickova/shared";
import { ApiRequestError, api } from "@/lib/api";

/**
 * Who is signed in. The session itself lives in an HTTP-only cookie the
 * browser cannot read, so the only way to know is to ask the API.
 */
type SessionState = {
  user: UserDTO | null;
  /** "loading" until the first /auth/me answer arrives */
  status: "loading" | "ready";
  load: () => Promise<void>;
  setUser: (user: UserDTO | null) => void;
};

export const useSession = create<SessionState>((set) => ({
  user: null,
  status: "loading",
  load: async () => {
    try {
      const { user } = await api<{ user: UserDTO }>("/auth/me");
      set({ user, status: "ready" });
    } catch (e) {
      // 401 simply means "not signed in"; on a network error keep whatever we knew.
      if (e instanceof ApiRequestError && e.status === 401) set({ user: null, status: "ready" });
      else set({ status: "ready" });
    }
  },
  setUser: (user) => set({ user, status: "ready" }),
}));
