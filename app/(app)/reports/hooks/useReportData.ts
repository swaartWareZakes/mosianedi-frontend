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

function extractSegmentsFromPayload(payload: any): any[] {
  if (!payload) return [];

  // common shapes
  if (Array.isArray(payload)) return payload;

  if (payload?.sheets && typeof payload.sheets === "object") {
    const firstKey = Object.keys(payload.sheets)[0];
    const sheet = payload.sheets[firstKey];
    if (Array.isArray(sheet)) return sheet;
  }

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;

  // geojson-ish
  if (Array.isArray(payload?.features)) {
    return payload.features.map((f: any) => f?.properties || f);
  }

  return [];
}

function normalizeSegments(rows: any[]): any[] {
  return rows.map((s) => ({
    ...s,
    normalized_length: toNumber(
      s.Length ??
        s.length_km ??
        s.km ??
        s.length ??
        s.LEN_KM ??
        s.len_km ??
        s.segment_length ??
        0
    ),
    normalized_iri: toNumber(
      s.IRI ??
        s.iri ??
        s.avg_iri ??
        s.roughness ??
        s.IRI_AVG ??
        s.iri_avg ??
        0
    ),
    normalized_id: s.Road_ID ?? s.road_id ?? s.roadid ?? s.id ?? s.ID ?? "Unknown",
    district: s.district ?? s.District ?? s.region ?? s.Region ?? "",
    surface: s.surface ?? s.surface_type ?? s.Surface ?? "",
  }));
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

        if (projectErr) console.warn("projects fetch error:", projectErr);

        // 2) Scenario assumptions (schema-aligned)
        const { data: scenarios, error: scenErr } = await supabase
          .from("scenario_assumptions")
          .select("*")
          .eq("project_id", selectedProjectId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (scenErr) console.warn("scenario_assumptions fetch error:", scenErr);

        const activeScenario = scenarios?.[0] || {};

        // 3) Proposal data
        const { data: proposalData, error: proposalErr } = await supabase
          .from("proposal_data")
          .select("*")
          .eq("project_id", selectedProjectId)
          .maybeSingle();

        if (proposalErr) console.warn("proposal_data fetch error:", proposalErr);

        // try to get workbook payload from proposal_data first
        let workbookPayload: any = proposalData?.workbook_payload ?? null;

        // fallback: try latest master_data_uploads.workbook_payload (if proposal_data is empty)
        if (!workbookPayload) {
          const { data: uploadRow, error: uploadErr } = await supabase
            .from("master_data_uploads")
            .select("workbook_payload, created_at")
            .eq("project_id", selectedProjectId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (uploadErr) console.warn("master_data_uploads fetch error:", uploadErr);
          workbookPayload = uploadRow?.workbook_payload ?? null;
        }

        // extract + normalize segments
        let safeSegments = normalizeSegments(extractSegmentsFromPayload(workbookPayload));

        // Apply filters
        if (filters?.condition === "critical") {
          safeSegments = safeSegments.filter((s: any) => (s.normalized_iri || 0) > 6);
        }

        // 4) Simulation results (no .single() to avoid 406)
        const { data: simResults, error: simErr } = await supabase
          .from("simulation_results")
          .select("results_payload, run_at")
          .eq("project_id", selectedProjectId)
          .order("run_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (simErr) console.warn("simulation_results fetch error:", simErr);

        const simData = simResults?.results_payload || {};
        const yearly = Array.isArray(simData.yearly_data) ? simData.yearly_data : [];

        // --- CALCS ---
        // primary totalLength from segments
        let totalLength = safeSegments.reduce((acc, s) => acc + toNumber(s.normalized_length), 0);

        // fallback: if no segment rows, use proposal_data numeric totals (these look like km buckets)
        if (totalLength <= 0 && proposalData) {
          totalLength =
            toNumber(proposalData.paved_arid) +
            toNumber(proposalData.paved_semi_arid) +
            toNumber(proposalData.paved_dry_sub_humid) +
            toNumber(proposalData.paved_moist_sub_humid) +
            toNumber(proposalData.paved_humid) +
            toNumber(proposalData.gravel_arid) +
            toNumber(proposalData.gravel_semi_arid) +
            toNumber(proposalData.gravel_dry_sub_humid) +
            toNumber(proposalData.gravel_moist_sub_humid) +
            toNumber(proposalData.gravel_humid);
        }

        // asset value: prefer simulation yearly_data[0].asset_value if present (more accurate)
        const simAssetValue = yearly?.[0]?.asset_value ? toNumber(yearly[0].asset_value) : 0;
        const assetValue = simAssetValue > 0 ? simAssetValue : totalLength * 15_000_000;

        // avg condition: prefer sim yearly_data[0].avg_condition_index if present
        const simAvg = yearly?.[0]?.avg_condition_index ? toNumber(yearly[0].avg_condition_index) : 0;

        // if we have segment IRI, estimate VCI, else use sim avg_condition_index, else fallback
        let avgCondition = 0;
        if (safeSegments.length > 0) {
          const totalIri = safeSegments.reduce((acc, s) => acc + toNumber(s.normalized_iri), 0);
          const avgIri = totalIri / safeSegments.length;
          avgCondition = Math.max(0, 100 - avgIri * 8);
        } else if (simAvg > 0) {
          avgCondition = simAvg; // already condition index
        } else {
          avgCondition = 50;
        }

        const budgetAsk = toNumber(simData.total_cost_npv || 0);

        const criticalRisks =
          safeSegments.length > 0
            ? [...safeSegments].sort((a, b) => toNumber(b.normalized_iri) - toNumber(a.normalized_iri)).slice(0, 5)
            : [];

        const next: ReportData = {
          meta: {
            projectName: project?.project_name || "Unknown Project",
            province: project?.province || "National",
            generatedDate: new Date().toLocaleDateString(),
          },
          inputs: {
            startYear: project?.start_year || 2026,
            inflation: toNumber(activeScenario.cpi_percentage ?? 6.0),
            budgetCap: toNumber(activeScenario.annual_budget_cap ?? 0),
            strategy: String(activeScenario.budget_strategy ?? "unconstrained"),
          },
          summary: {
            totalLength,
            assetValue,
            avgCondition,
            budgetAsk,
            segmentCount: safeSegments.length,
          },
          segments: safeSegments,
          criticalRisks,
          chartData: yearly,
          loading: false,
        };

        if (!cancelled) setData(next);
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
  }, [selectedProjectId, filters?.condition, filters?.district]);

  return { data, loading };
}