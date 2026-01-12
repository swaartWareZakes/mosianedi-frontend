"use client";

import React, { useEffect, useState } from "react";
import { Upload, Save, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ProvincialStat {
  province_name: string;
  km_arid: number;
  km_semi_arid: number;
  km_dry_sub_humid: number;
  km_moist_sub_humid: number;
  km_humid: number;
  avg_vci: number;
  vehicle_km: number;
  fuel_sales: number;
}

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "Kwazulu Natal", 
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function ProvincialStatsCard({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState<"manual" | "upload">("manual");
  const [stats, setStats] = useState<ProvincialStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- 1. Fetch Data on Load ---
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchStats() {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/provincial-stats/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Sort specifically to match the user's expected order
        const sorted = data.sort((a: any, b: any) => a.province_name.localeCompare(b.province_name));
        setStats(sorted);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  }

  // --- 2. Handle Manual Grid Updates ---
  const handleInputChange = (index: number, field: keyof ProvincialStat, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: Number(value) || 0 };
    setStats(newStats);
  };

  async function saveManualChanges() {
    setSaving(true);
    setMessage(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/provincial-stats/${projectId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(stats),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      setMessage({ type: "success", text: "Updates saved successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Could not save changes." });
    } finally {
      setSaving(false);
    }
  }

  // --- 3. Handle CSV Upload ---
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setSaving(true);
    setMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/provincial-stats/${projectId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      setMessage({ type: "success", text: "Spreadsheet imported! Grid updated." });
      fetchStats(); // Refresh grid with new data
      setActiveTab("manual"); // Switch user back to grid to see results
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      // Reset input
      e.target.value = ""; 
    }
  }

  return (
    <div className="bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            Provincial Data Inputs
          </h3>
          <p className="text-sm text-slate-500">
            Define the base parameters (Climate, Condition, Traffic) for the 9 provinces.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === "manual" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Grid Input
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === "upload" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Upload CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
            {message.text}
          </div>
        )}

        {activeTab === "manual" ? (
          <div className="space-y-4">
             {loading ? (
               <div className="h-40 flex items-center justify-center text-slate-400">Loading data...</div>
             ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">Province</th>
                      <th className="px-2 py-2 text-center" colSpan={5}>Climate Zone (km)</th>
                      <th className="px-2 py-2 border-l border-slate-200 dark:border-slate-800">Avg VCI</th>
                      <th className="px-2 py-2">Veh Km</th>
                      <th className="px-2 py-2">Fuel Sales</th>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="sticky left-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"></th>
                      <th className="px-2 py-1 font-normal text-[10px] text-slate-400">Arid</th>
                      <th className="px-2 py-1 font-normal text-[10px] text-slate-400">Semi</th>
                      <th className="px-2 py-1 font-normal text-[10px] text-slate-400">DrySub</th>
                      <th className="px-2 py-1 font-normal text-[10px] text-slate-400">MoistSub</th>
                      <th className="px-2 py-1 font-normal text-[10px] text-slate-400">Humid</th>
                      <th className="border-l border-slate-200 dark:border-slate-800"></th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {stats.map((row, idx) => (
                      <tr key={row.province_name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-medium sticky left-0 bg-[var(--surface-bg)] border-r border-slate-200 dark:border-slate-800 z-10">
                          {row.province_name}
                        </td>
                        {/* Climate Inputs */}
                        {(['km_arid', 'km_semi_arid', 'km_dry_sub_humid', 'km_moist_sub_humid', 'km_humid'] as const).map(field => (
                          <td key={field} className="p-1">
                            <input 
                              type="number" 
                              value={row[field]}
                              onChange={(e) => handleInputChange(idx, field, e.target.value)}
                              className="w-16 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-right outline-none transition-all"
                            />
                          </td>
                        ))}
                        {/* Other Inputs */}
                        <td className="p-1 border-l border-slate-200 dark:border-slate-800">
                           <input type="number" value={row.avg_vci} onChange={(e) => handleInputChange(idx, 'avg_vci', e.target.value)} className="w-14 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-right outline-none" />
                        </td>
                        <td className="p-1">
                           <input type="number" value={row.vehicle_km} onChange={(e) => handleInputChange(idx, 'vehicle_km', e.target.value)} className="w-20 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-right outline-none" />
                        </td>
                        <td className="p-1">
                           <input type="number" value={row.fuel_sales} onChange={(e) => handleInputChange(idx, 'fuel_sales', e.target.value)} className="w-24 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-right outline-none" />
                        </td>
                      </tr>
                    ))}
                    {stats.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          No provincial data found. (Did the automatic seed run?)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
             )}

             <div className="flex justify-end pt-2">
               <button 
                 onClick={saveManualChanges}
                 disabled={saving || loading}
                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
               >
                 {saving ? <span className="animate-spin">⏳</span> : <Save className="w-4 h-4" />}
                 Save Changes
               </button>
             </div>
          </div>
        ) : (
          /* Upload Tab */
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-10 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-full mb-4">
              <Upload className="w-8 h-8 text-indigo-500" />
            </div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Upload Provincial Spreadsheet</h4>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
              Upload the CSV or Excel file containing the "Green Blocks" (Climate, Condition, Traffic, Fuel).
            </p>
            
            <label className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 px-6 rounded-lg shadow-sm transition-all">
              <span>Select File</span>
              <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
            </label>
            
            <p className="mt-4 text-xs text-slate-400">Supported: .csv, .xlsx</p>
          </div>
        )}
      </div>
    </div>
  );
}