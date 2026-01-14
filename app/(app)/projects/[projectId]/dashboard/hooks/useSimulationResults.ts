"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { SimulationOutput } from "../../config/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useSimulationResults(projectId: string) {
  const [results, setResults] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!projectId) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(
          `${API_BASE}/api/v1/projects/${projectId}/simulation/latest`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );

        if (res.status === 404) {
            setResults(null); // No simulation run yet
        } else if (res.ok) {
            const data = await res.json();
            setResults(data);
        } else {
            setError("Failed to fetch results");
        }
      } catch (err: any) {
        console.error("Simulation fetch error:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [projectId]);

  return { results, loading, error };
}