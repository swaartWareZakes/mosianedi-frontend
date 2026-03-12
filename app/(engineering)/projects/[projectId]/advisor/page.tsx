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

// Hooks & Components
import { useAdvisor } from "./hooks/useAdvisor";
import { InsightDisplay } from "./components/InsightDisplay";
import { ProjectNavBar } from "../components/ProjectNavBar";
import { useProjectMeta } from "../config/hooks/useProjectMeta";

export default function AIAdvisorPage() {
  const params = useParams();
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

  // 2. Fetch Project Meta for Context Banner
  const { data: projectMeta } = useProjectMeta(projectId || "");

  // 4. Safety Check
  if (!projectId) return <div className="p-8">Error: Project ID missing</div>;

  return (
    <div className="h-full w-full bg-[var(--background)] flex flex-col">
       
       {/* --- AI CONTEXT BANNER --- */}
       <div className="bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] px-6 py-2.5 flex items-center justify-between text-xs border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 opacity-70">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="uppercase tracking-widest font-bold text-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]">AI Context:</span>
             </div>
             <span className="font-bold text-[var(--foreground)] px-2 py-0.5 rounded bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]">
                {projectMeta?.project_name || "Loading..."}
             </span>
             <span className="text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] font-medium">
                {projectMeta?.province || "ZA"} • Scope: {projectMeta?.scope || "Macro"}
             </span>
          </div>

          <div className="flex items-center gap-4">
             <div className="font-mono text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] px-2 py-1 rounded">
                 Engine: GPT-4o
             </div>
          </div>
       </div>

       <div className="sticky top-0 z-30 bg-[var(--background)]">
          <ProjectNavBar projectId={projectId} />
       </div>

       <div className="flex-1 overflow-hidden flex">
          
          {/* LEFT SIDEBAR: HISTORY */}
          <aside className="w-80 border-r border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] flex flex-col shrink-0">
             <div className="p-5 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                <button 
                    onClick={generateInsight}
                    disabled={generating}
                    className="w-full py-3 bg-[var(--accent-color)] hover:brightness-110 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                    {generating ? "Analyzing Matrix..." : "Generate New Report"}
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading && <div className="text-center p-4 text-xs text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]">Loading history...</div>}
                
                {!loading && history.length === 0 && (
                    <div className="text-center p-8 text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] border border-dashed border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-xl m-2 bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)]">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">No insights generated for this workspace yet.</p>
                    </div>
                )}

                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveInsight(item)}
                        className={`w-full text-left p-3 rounded-xl border transition-all group ${
                            activeInsight?.id === item.id 
                                ? "bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] border-[var(--accent-color)]" 
                                : "bg-[var(--surface-bg)] border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] hover:border-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            {activeInsight?.id === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />}
                        </div>
                        <div className="font-bold text-sm text-[var(--foreground)] line-clamp-2 mb-1">
                            {item.content.headline || "Strategic Review"}
                        </div>
                        {item.simulation_summary && (
                            <div className="text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] font-mono bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] px-1.5 py-0.5 rounded inline-block">
                                {item.simulation_summary.run_name}
                            </div>
                        )}
                    </button>
                ))}
             </div>
          </aside>

          {/* RIGHT MAIN: CONTENT */}
          <main className="flex-1 overflow-y-auto p-8 bg-[var(--background)]">
             <div className="max-w-4xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}

                {activeInsight ? (
                    <InsightDisplay insight={activeInsight} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                        <div className="w-20 h-20 bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Strategic Intelligence</h2>
                        <p className="text-sm max-w-md text-center mt-2 font-medium">
                            Select a past analysis from the sidebar, or generate a new one based on the active simulation data in this workspace.
                        </p>
                    </div>
                )}
             </div>
          </main>

       </div>
    </div>
  );
}