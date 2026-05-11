"use client";

import { useEffect, useState } from "react";
import { searchJuraAddress } from "@/lib/api";
import type { JuraAddress } from "@/types/jura";

export function useAddressSearch(text: string, divisionId = 6, delay = 300) {
  const [results, setResults] = useState<JuraAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text || text.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await searchJuraAddress(text.trim(), divisionId);
        if (!cancelled) {
          setResults(r);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Ошибка поиска");
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [text, divisionId, delay]);

  return { results, loading, error };
}
