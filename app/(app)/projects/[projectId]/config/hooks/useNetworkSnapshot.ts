"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";

// The clean shape returned by your new backend service
export type NetworkProfile = {
  totalLengthKm: number;
  pavedLengthKm: number;
  gravelLengthKm: number;
  avgVci: number;
  assetValue: number; // CRC
  totalVehicleKm: number;
  fuelSales: number;
};

export function useNetworkSnapshot(projectId: string) {
  const [data, setData] = useState<NetworkProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      // This hits the new endpoint we updated in the backend
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/network/snapshot`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const err = await res.json().catch(() => ({}));
        // Silent fail 404s (just means no data yet)
        if (res.status !== 404) {
            setError(err.detail || "Failed to load profile");
        }
      }
    } catch (err: any) {
      console.error("Snapshot error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  return { data, loading, error, refetch: fetchSnapshot };
}