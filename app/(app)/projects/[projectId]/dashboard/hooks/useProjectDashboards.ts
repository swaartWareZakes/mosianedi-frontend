"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dashboard } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useProjectDashboards(projectId: string | undefined) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboards = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/dashboards`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!res.ok) {
        // Handle 404 silently (just empty list)
        if (res.status === 404) {
            setDashboards([]);
            return;
        }
        throw new Error("Failed to load dashboards");
      }

      const data = await res.json();
      // Map snake_case to camelCase
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  // Create Dashboard
  const createDashboard = useCallback(async (payload: {
      name: string;
      description?: string;
      overrides?: any;
      layout?: any;
      isFavorite?: boolean;
    }) => {
      if (!projectId) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/dashboards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create dashboard");
      await fetchDashboards();
  }, [projectId, fetchDashboards]);

  // Update Dashboard
  const updateDashboard = useCallback(async (
      dashboardId: string,
      payload: Partial<Dashboard>
    ) => {
      if (!projectId) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/dashboards/${dashboardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update dashboard");
      await fetchDashboards();
  }, [projectId, fetchDashboards]);

  return {
    dashboards,
    loading,
    error,
    refetch: fetchDashboards,
    createDashboard,
    updateDashboard,
  };
}