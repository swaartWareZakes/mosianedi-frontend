"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { ProjectCard, Project, ProjectScope } from "./components/ProjectCard";
import { ProjectListHeader } from "./components/ProjectListHeader";
import { ProjectCreateForm } from "./ProjectCreateForm";

const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BG_SOFT_2 = "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";

function Modal({ children, isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`relative w-full max-w-xl bg-[var(--surface-bg)] rounded-2xl shadow-2xl overflow-hidden border ${BORDER_SOFT}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [scopeFilter, setScopeFilter] = useState<ProjectScope | "all">("all");

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user.id);

    const { data: projectsData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    const { data: profilesData } = await supabase.from("profiles").select("*");

    const profileMap = new Map(profilesData?.map((p: any) => [p.user_id, p]));

    const merged: Project[] = (projectsData || []).map((p: any) => ({
      ...p,
      status: p.status || "backlog",
      scope: p.scope || "provincial", 
      assignee: p.assignee_id ? profileMap.get(p.assignee_id) : undefined,
    }));

    setProjects(merged);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure? This deletes the project and all simulations.")) return;
    setDeletingId(projectId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert("Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Search Filter (Now includes route_name)
      const searchable = `${p.project_name} ${p.province} ${p.municipality || ''} ${p.local_area || ''} ${p.route_name || ''}`.toLowerCase();
      if (!searchable.includes(search.toLowerCase())) return false;

      // 2. Scope Filter
      if (scopeFilter !== "all" && p.scope !== scopeFilter) return false;

      // 3. Tab Filter
      if (activeTab === "all") return true;
      if (activeTab === "mine") return p.assignee_id === currentUser;
      if (activeTab === "backlog") return !p.status || p.status === "backlog";
      return p.status === activeTab;
    });
  }, [projects, activeTab, search, currentUser, scopeFilter]);

  const counts = useMemo(() => ({
    planning: projects.filter((p) => p.status === "planning").length,
    review: projects.filter((p) => p.status === "review").length,
    backlog: projects.filter((p) => !p.status || p.status === "backlog").length,
  }), [projects]);

  return (
    <div className="h-full w-full bg-[var(--background)] p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        <ProjectListHeader
          activeTab={activeTab} setActiveTab={setActiveTab}
          search={search} setSearch={setSearch}
          onNewProject={() => setIsFormOpen(true)}
          counts={counts} totalCount={projects.length}
          viewMode={viewMode} setViewMode={setViewMode}
          scopeFilter={scopeFilter} setScopeFilter={setScopeFilter}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className={`h-48 rounded-2xl animate-pulse border ${BORDER_SOFT} ${BG_SOFT_2}`} />)}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`py-20 text-center rounded-3xl border-2 border-dashed ${BORDER_SOFT}`}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">No proposals found</h3>
            <p className={`text-sm mt-2 ${TEXT_MUTED}`}>Try changing filters or search keywords.</p>
          </div>
        ) : (
          <div className={cn("animate-in fade-in duration-500", viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3")}>
            {filteredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onDelete={handleDelete} isDeleting={deletingId === p.id} currentUserId={currentUser} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ProjectCreateForm onClose={(created) => { setIsFormOpen(false); if (created) loadData(); }} />
      </Modal>
    </div>
  );
}