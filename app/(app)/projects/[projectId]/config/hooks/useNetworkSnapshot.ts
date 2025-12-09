// app/(app)/projects/[projectId]/config/hooks/useNetworkSnapshot.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// 👇 IMPORT THE CENTRAL CONFIG
import { API_BASE_URL } from "@/lib/config"; 

// -------------------------
// Raw API types (snake_case)
// -------------------------

export type LengthByCategoryApi = {
  label: string;
  length_km: number;
};

export type AssetValueByCategoryApi = {
  label: string;
  value: number;
};

export type UnitCostByCategoryApi = {
  label: string;
  cost_per_km: number;
};

export type NetworkSnapshotApi = {
  project_id: string;
  upload_id: string;

  total_length_km: number;
  total_segments: number;
  total_roads?: number | null;

  length_by_road_class?: LengthByCategoryApi[];
  length_by_surface_type?: LengthByCategoryApi[];

  total_network_length_km?: number | null;
  length_by_network_type?: LengthByCategoryApi[];

  total_asset_value?: number | null;
  asset_value_by_category?: AssetValueByCategoryApi[];

  unit_costs_by_surface?: UnitCostByCategoryApi[];

  // Optional timestamp if backend adds it
  calculated_at?: string | null;
};

// -------------------------
// UI types (camelCase)
// -------------------------

export type LengthByCategoryUi = {
  label: string;
  lengthKm: number;
};

export type AssetValueByCategoryUi = {
  label: string;
  value: number;
};

export type UnitCostByCategoryUi = {
  label: string;
  costPerKm: number;
};

export type NetworkSnapshotUi = {
  projectId: string;
  uploadId: string;

  totalLengthKm: number;
  totalSegments: number;
  totalRoads: number | null;

  pavedLengthKm: number;
  gravelLengthKm: number;

  goodConditionPct: number;
  fairConditionPct: number;
  poorConditionPct: number;

  totalNetworkLengthKm: number | null;
  lengthByRoadClass: LengthByCategoryUi[];
  lengthBySurfaceType: LengthByCategoryUi[];
  lengthByNetworkType: LengthByCategoryUi[];

  totalAssetValue: number | null;
  assetValueByCategory: AssetValueByCategoryUi[];

  unitCostsBySurface: UnitCostByCategoryUi[];

  calculatedAt: string | null;
};

// -------------------------
// Hook state
// -------------------------

type State = {
  snapshot: NetworkSnapshotUi | null;
  loading: boolean;
  error: string | null;
};

// -------------------------
// Hook implementation
// -------------------------

export function useNetworkSnapshot(projectId: string) {
  const [state, setState] = useState<State>({
    snapshot: null,
    loading: false,
    error: null,
  });

  const fetchSnapshot = useCallback(async () => {
    // If no project yet, just reset and bail out
    if (!projectId) {
      setState((prev) => ({
        ...prev,
        snapshot: null,
        error: null,
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        // Soft error to avoid flashing red if just logged out/loading
        setState((prev) => ({
            ...prev,
            loading: false,
            error: "Please log in to view network snapshot."
        }));
        return;
      }

      // 👇 USE API_BASE_URL FROM CONFIG
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/network/snapshot`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        // Handle 404 gracefully (no snapshot yet)
        if (res.status === 404) {
            setState({ snapshot: null, loading: false, error: null });
            return;
        }
        
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.detail || `Failed to load network snapshot (${res.status})`
        );
      }

      const api: NetworkSnapshotApi = await res.json();

      // ----- Core length logic ---------------------------------------------
      // Prioritize network_length sheet if available, else segments sum
      const totalLengthKm =
        api.total_network_length_km ??
        api.total_length_km ??
        0;

      const lengthBySurfaceApi = api.length_by_surface_type ?? [];

      // Calculate paved/gravel split from surface types
      let pavedLengthKm = 0;
      let gravelLengthKm = 0;
      
      lengthBySurfaceApi.forEach((row) => {
        const label = (row.label || "").toLowerCase();
        if (
          label.includes("paved") ||
          label.includes("seal") ||
          label.includes("asphalt") ||
          label.includes("concrete") ||
          label.includes("surfaced")
        ) {
          pavedLengthKm += row.length_km || 0;
        } else if (
            label.includes("gravel") || 
            label.includes("earth") || 
            label.includes("unpaved")
        ) {
          gravelLengthKm += row.length_km || 0;
        } else {
            // Default bucket if unclear
            gravelLengthKm += row.length_km || 0;
        }
      });

      // ----- Condition split (placeholder until we wire real condition) ----
      const goodConditionPct = 60;
      const fairConditionPct = 25;
      const poorConditionPct = 15;

      // ----- Map to UI model -----------------------------------------------
      const snapshotUi: NetworkSnapshotUi = {
        projectId: api.project_id,
        uploadId: api.upload_id,
        totalLengthKm,
        totalSegments: api.total_segments ?? 0,
        totalRoads: api.total_roads ?? null,
        
        pavedLengthKm,
        gravelLengthKm,

        goodConditionPct,
        fairConditionPct,
        poorConditionPct,

        totalNetworkLengthKm: api.total_network_length_km ?? null,
        
        lengthByRoadClass: (api.length_by_road_class ?? []).map((row) => ({
          label: row.label,
          lengthKm: row.length_km ?? 0,
        })),
        
        lengthBySurfaceType: lengthBySurfaceApi.map((row) => ({
          label: row.label,
          lengthKm: row.length_km ?? 0,
        })),
        
        lengthByNetworkType: (api.length_by_network_type ?? []).map((row) => ({
          label: row.label,
          lengthKm: row.length_km ?? 0,
        })),

        totalAssetValue: api.total_asset_value ?? null,
        assetValueByCategory: (api.asset_value_by_category ?? []).map((row) => ({
          label: row.label,
          value: row.value ?? 0,
        })),

        unitCostsBySurface: (api.unit_costs_by_surface ?? []).map((row) => ({
          label: row.label,
          costPerKm: row.cost_per_km ?? 0,
        })),

        calculatedAt: api.calculated_at ?? null,
      };

      setState({
        snapshot: snapshotUi,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("[useNetworkSnapshot] error:", err);
      setState({
        snapshot: null,
        loading: false,
        error: err.message || "Could not load network snapshot.",
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  return {
    snapshot: state.snapshot,
    loading: state.loading,
    error: state.error,
    refetch: fetchSnapshot,
  };
}