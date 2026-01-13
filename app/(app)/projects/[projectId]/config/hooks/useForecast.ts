"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ForecastParameters, ForecastPatch } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useForecast(projectId: string) {
  const [data, setData] = useState<ForecastParameters | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Ref for debouncing saves
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/forecast`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to load forecast params", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optimistic Update + Debounced Save
  const updateField = (key: keyof ForecastParameters, value: any) => {
    if (!data) return;

    // 1. Optimistic Update
    const updated = { ...data, [key]: value };
    setData(updated);
    setSaving(true);

    // 2. Debounce Save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const payload: ForecastPatch = { [key]: value };

        await fetch(`${API_BASE}/api/v1/projects/${projectId}/forecast`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Save failed", err);
      } finally {
        setSaving(false);
      }
    }, 600); // 600ms delay
  };

  return { data, loading, saving, updateField };
}