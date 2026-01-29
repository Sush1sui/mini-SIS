"use client";
import { useEffect, useState, useCallback } from "react";
import apiFetch from "./api";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/auth/me");
      setUser(res.user || null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // listen for global auth events so other pages can trigger a refresh
  useEffect(() => {
    const handler = () => {
      refresh();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("auth", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth", handler);
      }
    };
  }, [refresh]);

  return { user, loading, refresh };
}

export default useAuth;
