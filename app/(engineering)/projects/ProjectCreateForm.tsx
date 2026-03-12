"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { X, Loader2, FolderPlus, Map, Building2, MapPin, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectScope } from "./components/ProjectCard";

interface ProjectCreateFormProps {
  onClose: (success?: boolean, newProjectId?: string) => void;
}

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

const CLIMATE_ZONES = [
  { id: "arid", label: "Arid" },
  { id: "semi_arid", label: "Semi-Arid" },
  { id: "dry_sub_humid", label: "Dry Sub-Humid" },
  { id: "moist_sub_humid", label: "Moist Sub-Humid" },
  { id: "humid", label: "Humid" },
];

export function ProjectCreateForm({ onClose }: ProjectCreateFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Fields
  const [scope, setScope] = useState<ProjectScope>("provincial");
  const [projectName, setProjectName] = useState("");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [startYear, setStartYear] = useState(new Date().getFullYear() + 1);
  
  // Location Fields
  const [municipality, setMunicipality] = useState("");
  const [localArea, setLocalArea] = useState("");
  
  // Route Specific Fields
  const [routeName, setRouteName] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [routeLength, setRouteLength] = useState<number | "">("");
  const [surfaceType, setSurfaceType] = useState("paved");
  const [climateZone, setClimateZone] = useState("dry_sub_humid");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (scope !== 'provincial' && scope !== 'route' && !municipality.trim()) {
        setError("Municipality name is required.");
        setLoading(false); return;
    }
    if (scope === 'local' && !localArea.trim()) {
        setError("Local Area / Ward name is required.");
        setLoading(false); return;
    }
    if (scope === 'route' && (!routeName.trim() || !routeLength || Number(routeLength) <= 0)) {
        setError("Route name and a valid length are required.");
        setLoading(false); return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated. Please log in again.");

      const payload = {
        project_name: projectName,
        province,
        start_year: startYear,
        scope,
        municipality: (scope === 'municipal' || scope === 'local') ? municipality : null,
        local_area: scope === 'local' ? localArea : null,
        
        // Linear Asset Data
        route_name: scope === 'route' ? routeName : null,
        start_point: scope === 'route' ? startPoint : null,
        end_point: scope === 'route' ? endPoint : null,
        route_length_km: scope === 'route' ? Number(routeLength) : 0,
        surface_type: scope === 'route' ? surfaceType : 'paved',
        climate_zone: scope === 'route' ? climateZone : 'dry_sub_humid',
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create project (${res.status})`);
      }

      const created = await res.json().catch(() => null);
      const newProjectId = created?.id || created?.project_id || created?.data?.id || undefined;

      onClose(true, newProjectId);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all";
  const labelClass = "text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)] block mb-1.5";

  return (
    <div className="w-full text-[var(--foreground)]">
      <div className="flex items-center justify-between p-5 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-indigo-500" />
          Initialize Project
        </h2>
        <button onClick={() => onClose(false)} className="p-1 rounded-lg hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] transition-colors">
          <X className="w-5 h-5 text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {error && <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg font-medium">{error}</div>}

        <div>
            <label className={labelClass}>Network Scope</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ScopeCard id="provincial" label="Provincial" icon={<Map className="w-4 h-4" />} active={scope === 'provincial'} onClick={() => setScope('provincial')} />
                <ScopeCard id="municipal" label="Municipal" icon={<Building2 className="w-4 h-4" />} active={scope === 'municipal'} onClick={() => setScope('municipal')} />
                <ScopeCard id="local" label="Ward" icon={<MapPin className="w-4 h-4" />} active={scope === 'local'} onClick={() => setScope('local')} />
                <ScopeCard id="route" label="Route" icon={<RouteIcon className="w-4 h-4" />} active={scope === 'route'} onClick={() => setScope('route')} />
            </div>
        </div>

        <div className="space-y-4">
            <div>
              <label className={labelClass}>Project / Tender Title</label>
              <input type="text" required placeholder="e.g. N12 Section 3 Rehabilitation" className={inputClass} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Province</label>
                    <select className={inputClass} value={province} onChange={(e) => setProvince(e.target.value)}>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                  <label className={labelClass}>Fiscal Year Start</label>
                  <select className={inputClass} value={startYear} onChange={(e) => setStartYear(Number(e.target.value))}>
                      {[2024, 2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>FY {y}/{y+1}</option>)}
                  </select>
                </div>
            </div>

            {/* ROUTE FIELDS */}
            {scope === 'route' && (
              <div className="space-y-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 animate-in fade-in duration-300">
                <div>
                  <label className={labelClass}>Official Route Name</label>
                  <input type="text" required placeholder="e.g. R554 (Main Reef Road)" className={inputClass} value={routeName} onChange={(e) => setRouteName(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className={labelClass}>Length (km)</label>
                    <input type="number" step="0.001" required placeholder="12.5" className={inputClass} value={routeLength} onChange={(e) => setRouteLength(e.target.value ? Number(e.target.value) : "")} />
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>Start Marker</label>
                    <input type="text" placeholder="e.g. km 10.0" className={inputClass} value={startPoint} onChange={(e) => setStartPoint(e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>End Marker</label>
                    <input type="text" placeholder="e.g. km 22.5" className={inputClass} value={endPoint} onChange={(e) => setEndPoint(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className={labelClass}>Surface Type</label>
                        <select className={inputClass} value={surfaceType} onChange={(e) => setSurfaceType(e.target.value)}>
                            <option value="paved">Paved (Bitumen/Concrete)</option>
                            <option value="gravel">Gravel / Unpaved</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Climate Zone</label>
                        <select className={inputClass} value={climateZone} onChange={(e) => setClimateZone(e.target.value)}>
                            {CLIMATE_ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                        </select>
                    </div>
                </div>
              </div>
            )}

            {/* MUNICIPAL/LOCAL FIELDS */}
            {(scope === 'municipal' || scope === 'local') && (
               <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClass}>Municipality</label>
                  <input type="text" required placeholder="e.g. City of Ekurhuleni" className={inputClass} value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
               </div>
            )}

            {scope === 'local' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={labelClass}>Local Area / Ward</label>
                    <input type="text" required placeholder="e.g. Brakpan Ward 11" className={inputClass} value={localArea} onChange={(e) => setLocalArea(e.target.value)} />
                </div>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
          <button type="button" onClick={() => onClose(false)} className="px-5 py-2.5 text-sm font-bold text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[var(--accent-color)] hover:brightness-110 rounded-xl shadow-lg transition-all disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Workspace
          </button>
        </div>
      </form>
    </div>
  );
}

function ScopeCard({ label, icon, active, onClick }: any) {
    return (
        <button type="button" onClick={onClick} className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
            active ? "border-[var(--accent-color)] bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] text-[var(--accent-color)]" : "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] hover:border-[color:color-mix(in_oklab,var(--foreground)_25%,transparent)]"
        )}>
            <div className="mb-1">{icon}</div>
            <div className="font-bold text-[10px] uppercase tracking-tighter">{label}</div>
        </button>
    )
}