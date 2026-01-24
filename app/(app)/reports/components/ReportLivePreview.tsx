"use client";

import React from "react";
import { Loader2, AlertTriangle, TrendingUp, Settings2 } from "lucide-react";
import { useReportData } from "../hooks/useReportData";

interface ReportLivePreviewProps {
  template: string;
  config: any;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

const formatMoney = (amount: number) => {
  if (!amount) return "R 0.00";
  if (amount >= 1_000_000_000) return `R ${(amount / 1_000_000_000).toFixed(2)}bn`;
  return `R ${(amount / 1_000_000).toFixed(1)}m`;
};

export default function ReportLivePreview({ template, config, previewRef }: ReportLivePreviewProps) {
  const { data, loading } = useReportData(config.projectId, config);

  if (!config.projectId) return <EmptyState label="Select a project from the settings sidebar." />;
  if (loading || !data) return <LoadingState />;

  const { meta, summary, narrative, criticalRisks, segments, chartData } = data;

  // Sorting for display
  const displaySegments = [...segments].sort((a, b) => b.iri - a.iri);

  return (
    <div
      id="report-print-root"
      ref={previewRef}
      style={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      className="w-[210mm] min-h-[297mm] mx-auto p-[15mm] origin-top text-sm font-sans"
    >
      {/* HEADER */}
      <header
        style={{
          borderBottom: "2px solid #0f172a",
          paddingBottom: 16,
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
            {String(config.title || "").toUpperCase()}
          </h1>

          <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
            <span>{meta.generatedDate}</span>
            <span>•</span>
            <span style={{ textTransform: "uppercase" }}>{meta.projectName}</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#94a3b8" }}>
            Province
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#4f46e5" }}>{meta.province}</div>
        </div>
      </header>

      {/* SUMMARY STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatBox label="Network Size" value={`${summary.totalLength.toFixed(0)} km`} />
        {/* FIX: Used currentVci instead of avgCondition */}
        <StatBox label="Current VCI" value={`${summary.currentVci.toFixed(0)} / 100`} />
        <StatBox label="Asset Value" value={formatMoney(summary.assetValue)} />
        {config.showCost && (
          <div style={{ backgroundColor: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 900, color: "#4f46e5", marginBottom: 6 }}>
              Total Ask
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b" }}>{formatMoney(summary.budgetAsk)}</div>
          </div>
        )}
      </div>

      {/* EXECUTIVE TEMPLATE */}
      {template === "executive" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* AI NARRATIVE BOX */}
          <div style={{ padding: 18, backgroundColor: "#f8fafc", borderLeft: "4px solid #4f46e5", borderRadius: 4 }}>
             <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>Strategic Outlook</h3>
             <p style={{ fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                {narrative.executiveSummary}
             </p>
          </div>

          {/* CHART: The Scissors Graph */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, height: 288 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8" }}>
                <TrendingUp size={16} />
                Scenario Comparison (10 Years)
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 10, fontWeight: 600 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, backgroundColor: "#6366f1", borderRadius: 2 }} /> Funded
                 </div>
                 <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, backgroundColor: "#fecdd3", borderRadius: 2 }} /> Do Nothing
                 </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", height: 190, gap: 8, borderLeft: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", paddingLeft: 10, paddingBottom: 10 }}>
              {chartData.length > 0 ? (
                chartData.map((d: any, i: number) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
                    {/* Do Nothing Bar (Ghost) */}
                    <div style={{ 
                        position: "absolute", bottom: 0, left: 4, right: 4, 
                        height: `${d.doNothingVCI}%`, 
                        backgroundColor: "#fecdd3", 
                        zIndex: 0 
                    }} />
                    
                    {/* Funded Bar */}
                    <div style={{ 
                        width: "100%", 
                        height: `${d.fundedVCI}%`, 
                        backgroundColor: "#6366f1", 
                        borderTopLeftRadius: 4, 
                        borderTopRightRadius: 4,
                        opacity: 0.9,
                        zIndex: 1
                    }} />
                    
                    <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 8 }}>{d.year}</div>
                  </div>
                ))
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontStyle: "italic" }}>
                  Run simulation to generate forecast graph.
                </div>
              )}
            </div>
          </div>

          {/* RISKS */}
          <div style={{ border: "1px solid #ffe4e6", borderRadius: 14, overflow: "hidden", backgroundColor: "#fff1f2" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #ffe4e6", display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 11, textTransform: "uppercase", color: "#be123c" }}>
              <AlertTriangle size={16} />
              Critical Risk Segments (Top 5)
            </div>

            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", backgroundColor: "#fff1f2" }}>
              <thead>
                <tr style={{ color: "#9f1239" }}>
                  <th style={{ textAlign: "left", padding: "10px 18px" }}>Road ID</th>
                  <th style={{ textAlign: "left", padding: "10px 18px" }}>Surface</th>
                  <th style={{ textAlign: "right", padding: "10px 18px" }}>Roughness (IRI)</th>
                  <th style={{ textAlign: "right", padding: "10px 18px" }}>Remedial Cost</th>
                </tr>
              </thead>
              <tbody>
                {criticalRisks.map((road: any, i: number) => (
                  <tr key={i} style={{ borderTop: "1px solid #fecdd3" }}>
                    <td style={{ padding: "12px 18px", fontWeight: 900, color: "#881337" }}>{road.road_id}</td>
                    <td style={{ padding: "12px 18px", color: "#9f1239", textTransform: "capitalize" }}>{road.surface}</td>
                    <td style={{ padding: "12px 18px", textAlign: "right", fontFamily: "monospace", fontWeight: 900, color: "#e11d48" }}>
                      {Number(road.iri || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 18px", textAlign: "right", color: "#9f1239" }}>
                      {formatMoney((road.length || 0) * 2_500_000)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENGINEERING TEMPLATE */}
      {template === "engineering" && (
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #0f172a" }}>
              <th style={{ padding: "10px 0", textTransform: "uppercase", fontWeight: 900, textAlign: "left" }}>Road ID</th>
              <th style={{ padding: "10px 0", textTransform: "uppercase", fontWeight: 900, textAlign: "right" }}>Length (km)</th>
              {config.showSurface && (
                <th style={{ padding: "10px 0", textTransform: "uppercase", fontWeight: 900, textAlign: "left" }}>Type</th>
              )}
              <th style={{ padding: "10px 0", textTransform: "uppercase", fontWeight: 900, textAlign: "center" }}>IRI</th>
              <th style={{ padding: "10px 0", textTransform: "uppercase", fontWeight: 900, textAlign: "left" }}>Action</th>
              {config.showCost && (
                <th style={{ padding: "10px 0", textTransform: "uppercase", fontWeight: 900, textAlign: "right" }}>Est. Cost</th>
              )}
            </tr>
          </thead>

          <tbody>
            {displaySegments.slice(0, 45).map((seg: any, i: number) => {
              const iri = Number(seg.iri || 0);
              const cost = (Number(seg.length || 1) || 1) * (iri > 5 ? 3_500_000 : 500_000);
              const danger = iri > 5;

              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff", borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px 0", fontFamily: "monospace", fontWeight: 900, color: "#334155" }}>{seg.road_id}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "#475569" }}>{Number(seg.length || 0).toFixed(2)}</td>
                  {config.showSurface && <td style={{ padding: "10px 0", textTransform: "capitalize", color: "#475569" }}>{seg.surface}</td>}
                  <td style={{ padding: "10px 0", textAlign: "center", fontWeight: 900, color: danger ? "#e11d48" : "#475569" }}>
                    {iri.toFixed(1)}
                  </td>
                  <td style={{ padding: "10px 0", color: "#475569" }}>{danger ? "Rehabilitation" : "Maintenance"}</td>
                  {config.showCost && <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "monospace", color: "#475569" }}>{formatMoney(cost)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
       {/* GIS TEMPLATE */}
      {template === "gis" && (
        <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          <div style={{ marginTop: 14, fontSize: 18, fontWeight: 900, color: "#334155" }}>Ready to Export</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>
            Package contains <span style={{ color: "#4f46e5", fontWeight: 900 }}>{displaySegments.length}</span> spatial features.
          </div>
        </div>
      )}
    </div>
  );
}

const StatBox = ({ label, value }: any) => (
  <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
    <div style={{ fontSize: 10, textTransform: "uppercase", color: "#94a3b8", fontWeight: 900, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{value}</div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto flex items-center justify-center text-gray-400 text-sm">
    {label}
  </div>
);

const LoadingState = () => (
  <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto flex flex-col items-center justify-center text-gray-400 text-sm gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    Generating report preview...
  </div>
);