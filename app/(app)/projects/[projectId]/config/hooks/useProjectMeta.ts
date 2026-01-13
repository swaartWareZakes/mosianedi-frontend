"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// 1. We define the shape of the data here
type ProjectMeta = {
  id: string;
  province: string;
  start_year: number;
  project_name: string; // <--- ADDED THIS
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useProjectMeta(projectId: string) {
  const [data, setData] = useState<ProjectMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeta = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch project meta", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  return { data, loading };
}