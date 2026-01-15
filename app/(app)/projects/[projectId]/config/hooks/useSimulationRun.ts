"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// Ensure this path matches your actual config file, or use process.env.NEXT_PUBLIC_API_URL
import { API_BASE_URL } from "@/lib/config"; 
import { SimulationOutput } from "../types";

// 👇 Define the shape of the options we expect from the UI
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

      // 👇 IMPORTANT: Map Frontend (camelCase) to Backend (snake_case)
      const payload = {
        start_year: options.startYearOverride,
        scope_paved: options.includePaved,
        scope_gravel: options.includeGravel
      };

      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/simulation/run`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}` 
          },
          body: JSON.stringify(payload), // Send the mapped payload
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Simulation run failed.");
      }

      const data: SimulationOutput = await res.json();
      setResult(data);
      
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