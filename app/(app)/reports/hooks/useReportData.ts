"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface ReportData {
  meta: {
    projectName: string;
    province: string;
    generatedDate: string;
  };
  summary: {
    totalLength: number;
    assetValue: number;
    avgCondition: number; 
    budgetAsk: number;
    segmentCount: number;
  };
  segments: any[];
  // 👇 FIX: Added this to the interface
  criticalRisks: any[]; 
  chartData: any[];
  loading: boolean;
}

export function useReportData(selectedProjectId: string | null, filters: any) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProjectId) return;
      setLoading(true);

      try {
        // 1. Fetch Project Meta
        const { data: project } = await supabase
          .from("projects")
          .select("*")
          .eq("id", selectedProjectId)
          .single();

        // 2. Fetch Segments
        let query = supabase
          .from("proposal_data") // Updated to query 'proposal_data' table
          .select("workbook_payload") // We need to extract the segments from the JSONB blob
          .eq("project_id", selectedProjectId)
          .single();

        const { data: proposalData, error: propError } = await query;
        
        // Extract segments from the JSON payload if available
        let safeSegments: any[] = [];
        if (proposalData?.workbook_payload?.sheets) {
             // Assuming the first sheet or a sheet named 'Segments' contains the data
             const firstSheet = Object.values(proposalData.workbook_payload.sheets)[0] as any[];
             safeSegments = firstSheet || [];
        }

        // Apply In-Memory Filters (since data is inside JSONB)
        if (filters.condition === "critical") safeSegments = safeSegments.filter((s: any) => (s.IRI || s.iri) > 6);
        if (filters.condition === "poor") safeSegments = safeSegments.filter((s: any) => (s.IRI || s.iri) >= 4 && (s.IRI || s.iri) <= 6);
        
        // 3. Fetch Simulation Results
        const { data: simResults } = await supabase
          .from("simulation_results")
          .select("results_payload")
          .eq("project_id", selectedProjectId)
          .order("run_at", { ascending: false })
          .limit(1)
          .single();

        const simData = simResults?.results_payload || {};

        // --- CALCULATIONS ---
        const totalLength = safeSegments.reduce((acc, s) => acc + (s.Length || s.length_km || 0), 0);
        const assetValue = totalLength * 15000000; 
        
        const totalIri = safeSegments.reduce((acc, s) => acc + (s.IRI || s.iri || 0), 0);
        const avgIri = safeSegments.length > 0 ? totalIri / safeSegments.length : 0;
        const avgVci = Math.max(0, 100 - (avgIri * 8));

        // Critical Risks Logic
        const criticalRisks = [...safeSegments]
            .sort((a, b) => (b.IRI || b.iri || 0) - (a.IRI || a.iri || 0))
            .slice(0, 5);

        setData({
          meta: {
            projectName: project?.project_name || "Unknown Project",
            province: project?.province || "National",
            generatedDate: new Date().toLocaleDateString(),
          },
          summary: {
            totalLength,
            assetValue,
            avgCondition: avgVci,
            budgetAsk: simData.total_cost_npv || 0,
            segmentCount: safeSegments.length
          },
          segments: safeSegments, 
          criticalRisks: criticalRisks, // Now correctly typed
          chartData: simData.yearly_data || [],
          loading: false
        });

      } catch (err) {
        console.error("Report Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedProjectId, filters.condition]); 

  return { data, loading };
}