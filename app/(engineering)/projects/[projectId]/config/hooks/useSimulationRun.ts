"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config"; 
import { SimulationOutput } from "../types";

export type SimulationOptions = {
  startYearOverride?: number | null;
  includePaved: boolean;
  includeGravel: boolean;
};

export function useSimulationRun(projectId: string) {
  const [result, setResult] = useState<SimulationOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (options: SimulationOptions) => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // 👇 FIX: Match Backend Pydantic Schema exactly
      const payload = {
        startYearOverride: options.startYearOverride, // Backend expects snake_case alias or this camelCase
        includePaved: options.includePaved,            
        includeGravel: options.includeGravel           
      };

      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/simulation/run`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}` 
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Simulation run failed.");
      }

      // 👇 FIX: Unwrap the 'results_payload' from the history wrapper
      const wrapper = await res.json();
      setResult(wrapper.results_payload || null);
      
    } catch (err: any) {
      console.error("Simulation error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runSimulation,
    isRunning,
    error,
    result
  };
}