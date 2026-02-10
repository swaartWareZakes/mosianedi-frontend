"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { LayoutGrid, Loader2 } from "lucide-react";

// Components
import { ProjectCard, Project } from "./components/ProjectCard";
import { ProjectListHeader } from "./components/ProjectListHeader";
import { ProjectCreateForm } from "./ProjectCreateForm";

// Simple Modal Wrapper
function Modal({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[var(--surface-bg)] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load Data
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

    // Map DB rows to Project type
    const merged: Project[] = (projectsData || []).map((p: any) => ({
      ...p,
      status: p.status || "backlog",
      assignee: p.assignee_id ? profileMap.get(p.assignee_id) : undefined,
      assignee_id: p.assignee_id, // Ensure this maps correctly
      user_id: p.user_id
    }));

    setProjects(merged);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  // Delete Action
  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure? This deletes the project and all simulations.")) return;
    setDeletingId(projectId);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        
        if (!res.ok) {
            const errBody = await res.json();
            throw new Error(errBody.detail || "Delete failed");
        }
        
        setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
        alert("Failed to delete project. Ensure database permissions are correct.");
        console.error(err);
    } finally {
        setDeletingId(null);
    }
  };

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = (p.project_name + p.province).toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "mine") return p.assignee_id === currentUser;
      if (activeTab === "backlog") return !p.status || p.status === "backlog";
      
      return p.status === activeTab;
    });
  }, [projects, activeTab, search, currentUser]);

  const counts = useMemo(() => ({
    planning: projects.filter(p => p.status === "planning").length,
    review: projects.filter(p => p.status === "review").length,
    backlog: projects.filter(p => !p.status || p.status === "backlog").length,
  }), [projects]);

  return (
    <div className="h-full w-full bg-[var(--background)] p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        <ProjectListHeader 
            activeTab={activeTab} setActiveTab={setActiveTab}
            search={search} setSearch={setSearch}
            onNewProject={() => setIsFormOpen(true)}
            counts={counts}
            totalCount={projects.length}
        />

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
           </div>
        ) : filteredProjects.length === 0 ? (
           <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><LayoutGrid className="w-8 h-8" /></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">No proposals found</h3>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
             {filteredProjects.map(p => (
               <ProjectCard 
                 key={p.id} project={p} 
                 onDelete={handleDelete} isDeleting={deletingId === p.id} 
                 currentUserId={currentUser} 
               />
             ))}
           </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ProjectCreateForm onClose={(created) => { setIsFormOpen(false); if(created) loadData(); }} />
      </Modal>
    </div>
  );
}