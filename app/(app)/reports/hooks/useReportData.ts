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
  inputs: {
    startYear: number;
    inflation: number;
    budgetCap: number;
    strategy: string;
  };
  segments: any[];
  criticalRisks: any[];
  chartData: any[];
  loading: boolean;
}

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useReportData(selectedProjectId: string | null, filters: any) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!selectedProjectId) return;
      setLoading(true);

      try {
        // 1) Project meta
        const { data: project, error: projectErr } = await supabase
          .from("projects")
          .select("*")
          .eq("id", selectedProjectId)
          .maybeSingle();

        if (projectErr) console.warn("project fetch error:", projectErr);

        // 2) Scenario assumptions
        const { data: scenarios, error: scenErr } = await supabase
          .from("scenario_assumptions")
          .select("*")
          .eq("project_id", selectedProjectId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (scenErr) console.warn("scenario fetch error:", scenErr);

        const activeScenario = scenarios?.[0] || {};

        // 3) Proposal workbook payload (DO NOT use .single() -> causes 406 when no rows)
        const { data: proposalData, error: proposalErr } = await supabase
          .from("proposal_data")
          .select("workbook_payload")
          .eq("project_id", selectedProjectId)
          .maybeSingle();

        if (proposalErr) console.warn("proposal_data fetch error:", proposalErr);

        // ---- extract segments safely from many possible payload shapes
        let safeSegments: any[] = [];
        const payload = proposalData?.workbook_payload;

        if (Array.isArray(payload)) {
          safeSegments = payload;
        } else if (payload?.sheets && typeof payload.sheets === "object") {
          const firstSheetKey = Object.keys(payload.sheets)[0];
          safeSegments = Array.isArray(payload.sheets[firstSheetKey]) ? payload.sheets[firstSheetKey] : [];
        } else if (Array.isArray(payload?.data)) {
          safeSegments = payload.data;
        } else if (Array.isArray(payload?.rows)) {
          safeSegments = payload.rows;
        } else if (Array.isArray(payload?.features)) {
          // sometimes geojson-ish
          safeSegments = payload.features.map((f: any) => f?.properties || f);
        }

        // normalize common columns
        safeSegments = safeSegments.map((s) => ({
          ...s,
          normalized_length: toNumber(s.Length ?? s.length_km ?? s.km ?? s.length ?? s.NORMALIZED_LENGTH ?? 0),
          normalized_iri: toNumber(s.IRI ?? s.iri ?? s.avg_iri ?? s.roughness ?? s.NORMALIZED_IRI ?? 0),
          normalized_id: s.Road_ID ?? s.road_id ?? s.roadid ?? s.id ?? s.ID ?? "Unknown",
          district: s.district ?? s.District ?? s.region ?? s.Region ?? "",
          surface: s.surface ?? s.surface_type ?? s.Surface ?? "",
        }));

        // filters
        if (filters?.condition === "critical") {
          safeSegments = safeSegments.filter((s: any) => (s.normalized_iri || 0) > 6);
        }

        // 4) Simulation results (DO NOT .single() -> causes 406 if empty)
        const { data: simResults, error: simErr } = await supabase
          .from("simulation_results")
          .select("results_payload")
          .eq("project_id", selectedProjectId)
          .order("run_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (simErr) console.warn("simulation_results fetch error:", simErr);

        const simData = simResults?.results_payload || {};

        // calculations
        const totalLength = safeSegments.reduce((acc, s) => acc + toNumber(s.normalized_length), 0);
        const assetValue = totalLength * 15_000_000;

        const totalIri = safeSegments.reduce((acc, s) => acc + toNumber(s.normalized_iri), 0);
        const avgIri = safeSegments.length > 0 ? totalIri / safeSegments.length : 0;
        const avgVci = Math.max(0, 100 - avgIri * 8);

        const criticalRisks = [...safeSegments]
          .sort((a, b) => toNumber(b.normalized_iri) - toNumber(a.normalized_iri))
          .slice(0, 5);

        const nextData: ReportData = {
          meta: {
            projectName: project?.project_name || "Unknown Project",
            province: project?.province || "National",
            generatedDate: new Date().toLocaleDateString(),
          },
          inputs: {
            startYear: project?.start_year || 2026,
            inflation: toNumber(activeScenario.inflation_rate || 5.5),
            budgetCap: toNumber(activeScenario.budget_cap || 0),
            strategy: activeScenario.strategy_type || "Unconstrained",
          },
          summary: {
            totalLength,
            assetValue,
            avgCondition: avgVci,
            budgetAsk: toNumber(simData.total_cost_npv || 0),
            segmentCount: safeSegments.length,
          },
          segments: safeSegments,
          criticalRisks,
          chartData: Array.isArray(simData.yearly_data) ? simData.yearly_data : [],
          loading: false,
        };

        if (!cancelled) setData(nextData);
      } catch (err) {
        console.error("Report Fetch Error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, filters?.condition]);

  return { data, loading };
}