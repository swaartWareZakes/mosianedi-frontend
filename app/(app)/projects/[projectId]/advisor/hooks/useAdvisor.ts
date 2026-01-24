"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type AiInsight = {
  id: string;
  created_at: string;
  status: string;
  content: {
    headline: string;
    executive_summary: string;
    fiscal_implications: {
      liability_growth: string;
      economic_risk: string;
    };
    engineering_reality: string;
    recommendation: string;
  };
  simulation_summary?: {
    run_name: string;
    total_cost: string;
    end_vci: number;
  };
};

export function useAdvisor(projectId: string) {
  const [history, setHistory] = useState<AiInsight[]>([]);
  const [activeInsight, setActiveInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch History
  const fetchHistory = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/advisor/history`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        // Default to latest if nothing selected
        if (!activeInsight && data.length > 0) {
            setActiveInsight(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeInsight]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Generate New
  const generateInsight = async () => {
    setGenerating(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/advisor/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Generation failed");
      }

      const newInsight = await res.json();
      
      // Update state immediately
      setHistory(prev => [newInsight, ...prev]);
      setActiveInsight(newInsight);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return {
    history,
    activeInsight,
    setActiveInsight,
    loading,
    generating,
    error,
    generateInsight
  };
}