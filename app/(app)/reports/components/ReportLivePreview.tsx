"use client";

import React from "react";
import { Loader2, TrendingUp, AlertTriangle, Building2, Coins, ArrowUpRight, Calendar, BrainCircuit } from "lucide-react";
import { useReportData } from "../hooks/useReportData";

interface ReportLivePreviewProps {
  config: any;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

const formatMoney = (amount: number) => {
  if (!amount) return "R 0.00";
  if (amount >= 1_000_000_000) return `R ${(amount / 1_000_000_000).toFixed(2)}bn`;
  return `R ${(amount / 1_000_000).toFixed(1)}m`;
};

export default function ReportLivePreview({ config, previewRef }: ReportLivePreviewProps) {
  const { data, loading } = useReportData(config.projectId, config);

  if (!config.projectId) return <EmptyState label="Select a project from the settings sidebar." />;
  if (loading || !data) return <LoadingState />;

  const { meta, summary, narrative, chartData } = data;

  return (
    <div
      id="report-print-root"
      ref={previewRef}
      style={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      className="w-[210mm] min-h-[297mm] mx-auto p-[15mm] flex flex-col gap-8 origin-top text-sm font-sans"
    >
      {/* ROW 1: HEADER (The Hook) */}
      <header className="border-b-4 border-indigo-600 pb-6 flex justify-between items-end">
        <div>
            <div className="text-indigo-600 font-extrabold text-xs uppercase tracking-[0.2em] mb-2">Strategic Infrastructure Submission</div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">{config.title || "Business Case"}</h1>
            <div className="flex items-center gap-3 text-slate-500 font-medium">
                <span>{meta.province}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"/>
                <span>{meta.projectName}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"/>
                <span>{meta.generatedDate}</span>
            </div>
        </div>
        <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Funding Requirement</div>
            <div className="text-3xl font-black text-indigo-600">{formatMoney(summary.budgetAsk)}</div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-1">5 Year Horizon</div>
        </div>
      </header>

      {/* ROW 2: ASSET BASELINE (The Context) */}
      <div className="grid grid-cols-3 gap-6">
         <MetricCard 
            icon={<Building2 className="w-5 h-5 text-slate-400"/>} 
            label="Total Network Asset"
            value={formatMoney(summary.assetValue)}
            sub="Current Replacement Cost"
         />
         <MetricCard 
            icon={<TrendingUp className="w-5 h-5 text-slate-400"/>} 
            label="Current Health"
            value={`VCI ${summary.currentVci.toFixed(0)}`}
            sub="Weighted Average Condition"
            color={summary.currentVci < 50 ? "text-rose-600" : "text-emerald-600"}
         />
         <MetricCard 
            icon={<Coins className="w-5 h-5 text-slate-400"/>} 
            label="Investment Ratio"
            value={`${summary.preservationRatio.toFixed(1)}%`}
            sub="Of Asset Value (Target: 2%)"
         />
      </div>

      {/* ROW 3: THE SCISSORS GRAPH (The Why) */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500"/>
                Impact Analysis: Funding vs. Decay
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600"/> Funded Intervention</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400"/> Do Nothing (Decay)</div>
            </div>
         </div>
         
         <div className="h-48 flex items-end gap-3 px-2">
            {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end relative h-full group">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Year {d.year}: VCI {d.fundedVCI.toFixed(0)} vs {d.doNothingVCI.toFixed(0)}
                    </div>

                    {/* Bars */}
                    <div className="w-full bg-rose-200 rounded-t-sm relative" style={{ height: `${d.doNothingVCI}%` }}>
                        <div className="absolute inset-0 bg-rose-400 opacity-20"/>
                    </div>
                    <div className="w-full bg-indigo-600 rounded-t-sm absolute bottom-0 left-0 right-0 shadow-lg" style={{ height: `${d.fundedVCI}%` }}/>
                    
                    <div className="text-[10px] text-slate-400 text-center mt-2 font-mono">{d.year}</div>
                </div>
            ))}
         </div>
      </div>

      {/* ROW 4: STRATEGIC JUSTIFICATION (The Argument) */}
      {config.showAiNarrative && (
          <div className="flex gap-6">
             <div className="w-1/3">
                <div className="bg-indigo-600 text-white p-6 rounded-xl h-full flex flex-col justify-between">
                    <BrainCircuit className="w-8 h-8 opacity-50 mb-4"/>
                    <div>
                        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Strategic Driver</div>
                        <div className="text-xl font-bold leading-snug">
                            "{narrative.executiveSummary.split('.')[0]}."
                        </div>
                    </div>
                </div>
             </div>
             <div className="w-2/3 space-y-4 text-sm leading-relaxed text-slate-600">
                <h3 className="font-bold text-slate-900 border-b pb-2 mb-2">Treasury Motivation</h3>
                <p>{narrative.executiveSummary}</p>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-medium flex gap-3">
                    <AlertTriangle className="w-4 h-4 shrink-0"/>
                    <div>
                        <strong className="block text-rose-900 mb-1">Fiscal Liability Warning:</strong>
                        {narrative.riskStatement}
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* ROW 5: SCHEDULE (The Plan) */}
      {config.showSchedule && (
          <div className="mt-auto">
             <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-slate-400"/>
                Medium Term Expenditure Framework (MTEF)
             </h3>
             <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold text-left">
                    <tr>
                        <th className="p-3 rounded-l-lg">Financial Year</th>
                        <th className="p-3">Target Condition</th>
                        <th className="p-3">Risk Mitigation</th>
                        <th className="p-3 text-right rounded-r-lg">Allocation Required</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {chartData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                            <td className="p-3 font-mono font-bold text-slate-700">{row.year} / {row.year+1}</td>
                            <td className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{width: `${row.fundedVCI}%`}}/>
                                    </div>
                                    VCI {row.fundedVCI.toFixed(0)}
                                </div>
                            </td>
                            <td className="p-3 text-slate-500">
                                {row.fundedVCI > 50 ? "Preventative Maintenance" : "Critical Rehabilitation"}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900">{formatMoney(row.budget)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      )}

      <footer className="text-[10px] text-slate-300 text-center uppercase tracking-widest mt-4">
        Generated by Mosianedi • {config.author} • {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
}

// --- SUB COMPONENTS ---
function MetricCard({ icon, label, value, sub, color="text-slate-900" }: any) {
    return (
        <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{sub}</div>
        </div>
    )
}

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