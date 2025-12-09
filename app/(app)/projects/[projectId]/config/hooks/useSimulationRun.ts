// app/(app)/projects/[projectId]/config/hooks/useSimulationRun.ts
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { SimulationOutput } from "../types";

export function useSimulationRun(projectId: string) {
  const [result, setResult] = useState<SimulationOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Trigger the calculation engine
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/simulation/run`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
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