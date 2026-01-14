"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type AiAnalysis = {
  // 👇 New Section
  chart_insights: {
    condition_forecast: string;
    budget_impact: string;
  };
  // Existing Section
  executive_summary: string;
  risk_analysis: string;
  economic_impact: string;
  recommended_action: string[];
};

export function useAiAdvisor(projectId: string) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/advisor/generate`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to generate insights.");

      const data = await res.json();
      setAnalysis(data);
      
    } catch (err: any) {
      console.error(err);
      setError("AI Service Unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, generateAnalysis };
}