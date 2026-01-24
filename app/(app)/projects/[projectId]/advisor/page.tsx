"use client";

import React from "react";
import { useParams } from "next/navigation";
import { 
  Sparkles, 
  Plus, 
  Loader2, 
  Clock, 
  AlertTriangle
} from "lucide-react";

// Ensure these imports point to the files you created
import { useAdvisor } from "./hooks/useAdvisor";
import { InsightDisplay } from "./components/InsightDisplay";

// Fix: Corrected path to point to the sibling 'components' folder inside [projectId]
import { ProjectNavBar } from "../components/ProjectNavBar";

export default function AIAdvisorPage() {
  const params = useParams();
  // Safe extraction of projectId from URL
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  // 1. Hook Call
  const { 
    history, 
    activeInsight, 
    setActiveInsight, 
    generateInsight, 
    loading, 
    generating,
    error 
  } = useAdvisor(projectId || "");

  // 2. Safety Check
  if (!projectId) return <div className="p-8">Error: Project ID missing</div>;

  // 3. Render
  return (
    <div className="h-full w-full bg-[var(--background)] flex flex-col">
       
       <div className="sticky top-0 z-10 bg-[var(--background)]">
          <ProjectNavBar projectId={projectId} />
       </div>

       <div className="flex-1 overflow-hidden flex">
          
          {/* LEFT SIDEBAR: HISTORY */}
          <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] flex flex-col shrink-0">
             <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <button 
                    onClick={generateInsight}
                    disabled={generating}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                    {generating ? "Thinking..." : "New Analysis"}
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading && <div className="text-center p-4 text-xs text-slate-400">Loading history...</div>}
                
                {!loading && history.length === 0 && (
                    <div className="text-center p-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No insights generated yet.</p>
                    </div>
                )}

                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveInsight(item)}
                        className={`w-full text-left p-3 rounded-xl border transition-all group ${
                            activeInsight?.id === item.id 
                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800" 
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            {activeInsight?.id === item.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        </div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-1">
                            {item.content.headline || "Strategic Review"}
                        </div>
                        {item.simulation_summary && (
                            <div className="text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block">
                                {item.simulation_summary.run_name}
                            </div>
                        )}
                    </button>
                ))}
             </div>
          </aside>

          {/* RIGHT MAIN: CONTENT */}
          <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
             <div className="max-w-4xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}

                {activeInsight ? (
                    <InsightDisplay insight={activeInsight} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300">AI Strategic Advisor</h2>
                        <p className="text-sm max-w-md text-center mt-2">
                            Select a past analysis from the sidebar, or generate a new one based on your active simulation data.
                        </p>
                    </div>
                )}
             </div>
          </main>

       </div>
    </div>
  );
}