"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import type { SimulationOutput } from "../../config/types";

export function useSimulationResults(projectId: string) {
  const [results, setResults] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!projectId) {
          setResults(null);
          return;
      }
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(
          `${API_BASE_URL}/api/v1/projects/${projectId}/simulation/latest`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );

        if (res.status === 404) {
            setResults(null);
        } else if (!res.ok) {
            throw new Error("Failed to load results");
        } else {
            const data = await res.json();
            setResults(data);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [projectId]);

  return { results, loading, error };
}