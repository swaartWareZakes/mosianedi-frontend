// app/(app)/projects/[projectId]/config/hooks/useScenarioAssumptions.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { Scenario, RonetParameters } from "../types";

export function useScenarioAssumptions(projectId: string) {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // We keep a ref for the debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Baseline on Mount
  const fetchBaseline = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/scenarios/baseline`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (res.ok) {
        const data: Scenario = await res.json();
        setScenario(data);
      } else {
        console.error("Failed to fetch baseline scenario");
      }
    } catch (err) {
      console.error("Error fetching baseline:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchBaseline();
  }, [fetchBaseline, projectId]);

  // 2. Update Function (Optimistic UI + Debounced Save)
  const updateParameter = (key: keyof RonetParameters, value: any) => {
    if (!scenario) return;

    // A. Optimistic Update (Instant UI feedback)
    const updatedParams = { ...scenario.parameters, [key]: value };
    const updatedScenario = { ...scenario, parameters: updatedParams };
    setScenario(updatedScenario);
    setIsSaving(true);

    // B. Debounced API Call
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Backend expects { parameters: { ... } } inside the payload
        const payload = {
            parameters: updatedParams 
        };

        const res = await fetch(
          `${API_BASE_URL}/api/v1/projects/${projectId}/scenarios/${scenario.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
            console.error("Failed to save scenario parameters");
            // Optional: Revert state here if critical
        } else {
            setLastSavedAt(new Date());
        }
      } catch (err) {
        console.error("Error saving scenario:", err);
      } finally {
        setIsSaving(false);
      }
    }, 600); // Wait 600ms after last change before sending
  };

  return {
    scenario,
    parameters: scenario?.parameters,
    loading,
    isSaving,
    lastSavedAt,
    updateParameter,
  };
}