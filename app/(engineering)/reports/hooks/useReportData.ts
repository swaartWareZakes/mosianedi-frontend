"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- Types ---
export interface ReportData {
  meta: {
    projectName: string;
    province: string;
    generatedDate: string;
    author: string;
  };
  summary: {
    totalLength: number;
    assetValue: number;
    currentVci: number; // Replaces avgCondition
    futureVci: number;
    budgetAsk: number;
    preservationRatio: number;
  };
  narrative: {
    executiveSummary: string;
    riskStatement: string;
    recommendation: string;
    aiGenerated: boolean;
  };
  chartData: {
    year: number;
    fundedVCI: number;    
    doNothingVCI: number; 
    budget: number;
  }[];
  segments: any[];        // Added back for tables
  criticalRisks: any[];   // Added back for top 5 list
  loading: boolean;
  error: string | null;
}

// Helper: Calculate "Do Nothing" Decay
function calculateDecayCurve(startVci: number, years: number) {
  const curve = [];
  let current = startVci;
  for (let i = 0; i < years; i++) {
    const decayRate = current > 70 ? 1.5 : current > 50 ? 2.5 : 4.0; 
    current = Math.max(0, current - decayRate);
    curve.push(current);
  }
  return curve;
}

export function useReportData(projectId: string | null, config?: any) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let isCancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Project Basics
        const { data: project } = await supabase
          .from("projects")
          .select("project_name, province, active_simulation_run_id")
          .eq("id", projectId)
          .single();

        if (!project) throw new Error("Project not found.");

        // 2. Fetch Active Simulation (The "Math")
        let simulationPayload: any = null;
        let aiContent: any = null;

        if (project.active_simulation_run_id) {
            const { data: sim } = await supabase
                .from("simulation_results")
                .select("results_payload")
                .eq("id", project.active_simulation_run_id)
                .single();
            simulationPayload = sim?.results_payload;

            const { data: ai } = await supabase
                .from("ai_insights")
                .select("content")
                .eq("simulation_run_id", project.active_simulation_run_id)
                .eq("status", "final")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            aiContent = ai?.content;
        } else {
            // Fallback to latest
            const { data: latestSim } = await supabase
                .from("simulation_results")
                .select("results_payload")
                .eq("project_id", projectId)
                .order("run_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            simulationPayload = latestSim?.results_payload;
        }

        // 3. Fetch Segments (The "Evidence")
        // We look for the latest upload to populate the tables
        let segments: any[] = [];
        const { data: upload } = await supabase
            .from("master_data_uploads")
            .select("workbook_payload")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (upload?.workbook_payload) {
             // Handle different payload structures
             const payload = upload.workbook_payload;
             const rawData = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);
             segments = rawData.map((s: any) => ({
                 road_id: s.Road_ID || s.road_id || "Unknown",
                 surface: s.Surface || s.surface || "Paved",
                 iri: Number(s.IRI || s.iri || 0),
                 length: Number(s.Length || s.length || 0)
             }));
        }

        // 4. Process & Merge
        if (!isCancelled) {
            const yearlyData = simulationPayload?.yearly_data || [];
            const startVci = yearlyData[0]?.avg_condition_index || 50;
            const endVci = yearlyData[yearlyData.length - 1]?.avg_condition_index || 0;
            const assetValue = yearlyData[0]?.asset_value || 0;
            const totalCost = simulationPayload?.total_cost_npv || 0;

            // Generate Curves
            const decayCurve = calculateDecayCurve(startVci, yearlyData.length || 10);
            const chartData = yearlyData.map((d: any, i: number) => ({
                year: d.year,
                fundedVCI: d.avg_condition_index,
                doNothingVCI: decayCurve[i] || 0,
                budget: d.total_maintenance_cost
            }));

            // Identify Risks (Top 5 worst roads)
            const criticalRisks = [...segments]
                .sort((a, b) => b.iri - a.iri)
                .slice(0, 5);

            setData({
                meta: {
                    projectName: project.project_name,
                    province: project.province,
                    generatedDate: new Date().toLocaleDateString(),
                    author: "Provincial Roads Dept"
                },
                summary: {
                    totalLength: segments.reduce((acc, s) => acc + s.length, 0),
                    assetValue: assetValue,
                    currentVci: startVci,
                    futureVci: endVci,
                    budgetAsk: totalCost,
                    preservationRatio: assetValue > 0 ? (totalCost / assetValue) * 100 : 0
                },
                narrative: {
                    executiveSummary: aiContent?.executive_summary || "No strategic narrative generated yet. Run the AI Advisor to populate this section.",
                    riskStatement: aiContent?.fiscal_implications?.liability_growth || "Data insufficient to calculate liability risk.",
                    recommendation: aiContent?.recommendation || "Proceed with budget allocation to prevent asset collapse.",
                    aiGenerated: !!aiContent
                },
                chartData,
                segments,
                criticalRisks,
                loading: false,
                error: null
            });
        }

      } catch (err: any) {
        if (!isCancelled) setError(err.message);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { isCancelled = true; };
  }, [projectId]);

  return { data, loading, error };
}