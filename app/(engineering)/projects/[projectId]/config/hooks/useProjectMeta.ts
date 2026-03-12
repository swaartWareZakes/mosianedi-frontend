"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ProjectScope = "provincial" | "municipal" | "local" | "route";

export type ProjectMeta = {
  id: string;
  user_id: string; 
  province: string;
  start_year: number;
  project_name: string;
  scope: ProjectScope;
  municipality?: string;
  local_area?: string;
  route_name?: string;
  start_point?: string;
  end_point?: string;
  route_length_km?: number;
  surface_type?: string;
  climate_zone?: string;
  route_specific_vci?: number;
  route_daily_traffic?: number;
  owner?: { first_name: string; last_name: string; email: string };
};

export interface UseProjectMetaReturn {
  data: ProjectMeta | null;
  loading: boolean;
  hasAccess: boolean | null;
}

export function useProjectMeta(projectId: string): UseProjectMetaReturn {
  const [data, setData] = useState<ProjectMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const fetchMeta = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
      if (!currentUser) {
        setHasAccess(false);
        return;
      }

      // CRITICAL FIX: Added !projects_user_id_fkey to resolve the ambiguous join!
      const { data: project, error } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles!projects_user_id_fkey(first_name, last_name, email),
          collaborators:project_collaborators(user_id)
        `)
        .eq("id", projectId)
        .single();

      if (error) throw error;

      if (project) {
        setData(project);

        const userEmail = currentUser.email?.toLowerCase();
        const isOwner = project.user_id === currentUser.id;
        const isSuperAdmin = userEmail === "tholang@gmail.com" || userEmail === "rfgadmin@rfgsolutions.co.za";
        const isCollaborator = project.collaborators?.some((c: any) => c.user_id === currentUser.id) || false;

        setHasAccess(isOwner || isSuperAdmin || isCollaborator);
      }
    } catch (err) {
      console.error("Failed to fetch project meta or check access", err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  return { data, loading, hasAccess };
}