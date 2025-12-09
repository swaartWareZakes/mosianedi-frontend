// app/(app)/dashboard/hooks/useProjectDashboards.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dashboard } from "../types";

const API_BASE = "http://127.0.0.1:8000";

export function useProjectDashboards(projectId: string | "") {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboards = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Please log in to load dashboards.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/dashboards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load dashboards (${res.status})`);
      }

      const data = await res.json();
      const mapped: Dashboard[] = data.map((d: any) => ({
        id: d.id,
        projectId: d.project_id,
        userId: d.user_id,
        name: d.name,
        description: d.description,
        isFavorite: d.is_favorite,
        layout: d.layout,
        overrides: d.overrides,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setDashboards(mapped);
    } catch (err: any) {
      console.error("[useProjectDashboards] error:", err);
      setError(err.message || "Could not load dashboards.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  const createDashboard = useCallback(
    async (payload: {
      name: string;
      description?: string;
      overrides?: any;
      layout?: any;
      isFavorite?: boolean;
    }) => {
      if (!projectId) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated.");

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/dashboards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to create dashboard (${res.status})`);
      }

      await fetchDashboards();
    },
    [projectId, fetchDashboards]
  );

  const updateDashboard = useCallback(
    async (
      dashboardId: string,
      payload: {
        name?: string;
        description?: string;
        overrides?: any;
        layout?: any;
        isFavorite?: boolean;
      }
    ) => {
      if (!projectId) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated.");

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/dashboards/${dashboardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to update dashboard (${res.status})`);
      }

      await fetchDashboards();
    },
    [projectId, fetchDashboards]
  );

  return {
    dashboards,
    loading,
    error,
    refetch: fetchDashboards,
    createDashboard,
    updateDashboard,
  };
}