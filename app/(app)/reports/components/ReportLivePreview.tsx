"use client";

import React from "react";
import { Loader2, AlertTriangle, Building2, Map, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReportData } from "../hooks/useReportData";

interface ReportLivePreviewProps {
  template: string;
  config: any;
}

export default function ReportLivePreview({ template, config }: ReportLivePreviewProps) {
  
  // 1. Fetch Real Data
  const { data, loading } = useReportData(config.projectId, config);

  if (!config.projectId) return <EmptyState label="Select a project from the sidebar to begin." />;
  if (loading || !data) return <LoadingState />;

  const { meta, summary, criticalRisks, segments, chartData } = data;

  // 2. Client-Side Filtering (District)
  const filteredSegments = segments.filter((seg: any) => {
      if (config.district && config.district !== "All") {
          // Normalize check (case insensitive)
          return (seg.district || "").toLowerCase() === config.district.toLowerCase();
      }
      return true;
  });

  // 3. Sorting (Criticality Desc)
  const displaySegments = [...filteredSegments].sort((a, b) => (b.iri || 0) - (a.iri || 0));

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto p-[15mm] text-slate-900 transition-all duration-500 origin-top scale-[0.85] lg:scale-100 text-sm">
      
      {/* HEADER */}
      <header className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{config.title}</h1>
            <p className="text-xs font-mono text-slate-500 mt-1">
                Generated: {new Date().toLocaleDateString()} • {meta.projectName}
            </p>
        </div>
        <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Province</div>
            <div className="font-bold text-indigo-600">{meta.province}</div>
        </div>
      </header>

      {/* SUMMARY BANNER */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 flex justify-between">
          <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">Total Network</div>
              <div className="text-xl font-bold">{summary.totalLength.toFixed(2)} km</div>
          </div>
          <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">Segment Count</div>
              <div className="text-xl font-bold">{displaySegments.length}</div>
          </div>
          {config.showCost && (
             <div className="text-right">
                 <div className="text-[10px] uppercase text-slate-400 font-bold">Budget Est.</div>
                 <div className="text-xl font-bold text-indigo-600">R {(summary.budgetAsk / 1e6).toFixed(1)}m</div>
             </div>
          )}
      </div>

      {/* VIEW: ENGINEERING TABLE */}
      {template === "engineering" && (
        <>
            <div className="mb-4 text-xs font-mono text-slate-500 flex gap-4">
                <span>FILTER: {config.condition.toUpperCase()}</span>
                {config.district !== 'All' && <span>DISTRICT: {config.district.toUpperCase()}</span>}
            </div>

            <table className="w-full text-xs text-left">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                        <th className="py-2 font-black uppercase w-24">Road ID</th>
                        {config.showDistrict && <th className="py-2 font-black uppercase">District</th>}
                        <th className="py-2 font-black uppercase text-right">Start (km)</th>
                        <th className="py-2 font-black uppercase text-right">Length</th>
                        {config.showSurface && <th className="py-2 font-black uppercase">Surface</th>}
                        <th className="py-2 font-black uppercase text-center">IRI</th>
                        <th className="py-2 font-black uppercase text-right">Action</th>
                        {config.showCost && <th className="py-2 font-black uppercase text-right">Est. Cost</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {displaySegments.slice(0, 35).map((seg: any, i: number) => {
                         const iri = seg.iri || seg.avg_iri || 0;
                         const isCritical = iri > 5;
                         const cost = (seg.length || seg.length_km || 1) * (isCritical ? 2.5 : 0.5); // Mock cost calc

                         return (
                            <tr key={i} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
                                <td className="py-2 font-bold">{seg.road_id || seg.road_code || "Unknown"}</td>
                                
                                {config.showDistrict && (
                                    <td className="py-2 text-slate-500">{seg.district || "-"}</td>
                                )}

                                <td className="py-2 text-right">{(seg.start_km || 0).toFixed(2)}</td>
                                <td className="py-2 text-right">{(seg.length || seg.length_km || 0).toFixed(2)}</td>
                                
                                {config.showSurface && (
                                    <td className="py-2 text-slate-500 capitalize">{seg.surface || seg.surface_type || "Paved"}</td>
                                )}

                                <td className={cn("py-2 text-center font-bold", isCritical ? "text-rose-600" : "text-emerald-600")}>
                                    {iri.toFixed(2)}
                                </td>

                                <td className="py-2 text-right font-sans text-slate-600">
                                    {isCritical ? "Rehabilitate" : "Routine Maint"}
                                </td>

                                {config.showCost && (
                                    <td className="py-2 text-right">R {cost.toFixed(2)}m</td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {displaySegments.length === 0 && (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-300 rounded-lg mt-4">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No segments found matching "{config.condition}" in {config.district}.
                </div>
            )}

            {displaySegments.length > 35 && (
                <div className="mt-4 p-2 text-center text-xs text-slate-400 italic bg-slate-50 border border-slate-100 rounded">
                    ... {displaySegments.length - 35} more rows included in export.
                </div>
            )}
        </>
      )}

      {/* VIEW: EXECUTIVE SUMMARY */}
      {template === "executive" && (
         <div className="space-y-8">
            <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 p-4 relative overflow-hidden">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 absolute top-4 left-4">
                    Network Deterioration Forecast
                </span>
                <div className="flex items-end h-full pt-8 gap-1">
                    {chartData.length > 0 ? chartData.map((d: any, i: number) => (
                        <div key={i} className="flex-1 bg-indigo-500 transition-all rounded-t-sm" style={{ height: `${d.avg_condition_index}%` }} />
                    )) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            Run simulation to view forecast.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                 <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                    <h3 className="font-bold text-rose-700 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" /> Top Critical Risks
                    </h3>
                    <ul className="text-xs space-y-2 text-rose-800">
                        {criticalRisks.length > 0 ? criticalRisks.map((road: any, i: number) => (
                             <li key={i} className="flex justify-between border-b border-rose-200 pb-1">
                                <span>{road.road_id}</span>
                                <span className="font-mono font-bold">IRI {road.iri?.toFixed(1)}</span>
                             </li>
                        )) : <li>No critical risks found.</li>}
                    </ul>
                 </div>
                 
                 <div className="flex flex-col items-center justify-center text-slate-400 border border-slate-100 rounded-xl">
                    <PieChart className="w-8 h-8 opacity-20 mb-2" />
                    <span className="text-xs">Condition Breakdown Chart</span>
                 </div>
            </div>
         </div>
      )}

      {/* VIEW: GIS */}
      {template === "gis" && (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
            <Map className="w-16 h-16 text-indigo-100 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Ready to Export</h3>
            <p className="text-sm">
                Package contains <strong className="text-indigo-600">{displaySegments.length}</strong> spatial features.
            </p>
        </div>
      )}

    </div>
  );
}

const EmptyState = ({ label }: { label: string }) => (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto flex items-center justify-center text-slate-400 text-sm">
        {label}
    </div>
);

const LoadingState = () => (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        Fetching segments...
    </div>
);