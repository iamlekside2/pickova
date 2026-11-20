"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, api } from "./api";
import { useSession } from "@/stores/session";

/** Only same-site paths are accepted as a post-login destination (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;
}

/**
 * Loads signed-in data for an account page. If the session has ended, the
 * visitor is sent to sign in and brought back afterwards.
 */
export function useAccountData<T>(path: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        useSession.getState().setUser(null);
        router.replace(`/account/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setError(e instanceof ApiRequestError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [path, pathname, router]);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
