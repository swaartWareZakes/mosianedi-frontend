"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import type { SimulationOutput } from "../../config/types";

export function useSimulationResults(projectId: string) {
  const [results, setResults] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchResults() {
      if (!projectId) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(
          `${API_BASE_URL}/api/v1/projects/${projectId}/simulation/latest`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );

        if (isCancelled) return;

        if (res.status === 404) {
            // No simulation run yet
            setResults(null); 
        } else if (res.ok) {
            const wrapper = await res.json();
            // 👇 CRITICAL FIX: Unwrap the payload from the history wrapper
            // The backend returns { id: "...", results_payload: { ...data... } }
            if (wrapper && wrapper.results_payload) {
                setResults(wrapper.results_payload);
            } else {
                // Fallback in case the structure is flat (legacy) or empty
                setResults(null);
            }
        } else {
            setError("Failed to fetch results");
        }
      } catch (err: any) {
        if (!isCancelled) {
            console.error("Simulation fetch error:", err);
            setError("Network error");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchResults();

    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  return { results, loading, error };
}