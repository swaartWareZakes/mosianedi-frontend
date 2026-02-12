"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { LayoutGrid } from "lucide-react";

// Components
import { ProjectCard, Project } from "./components/ProjectCard";
import { ProjectListHeader } from "./components/ProjectListHeader";
import { ProjectCreateForm } from "./ProjectCreateForm";

// Shared tokens (variable-friendly)
const BORDER_SOFT =
  "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const DIVIDER_SOFT =
  "divide-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const BG_SOFT =
  "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]";
const BG_SOFT_2 =
  "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED =
  "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT =
  "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";

// Simple Modal Wrapper
function Modal({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg bg-[var(--surface-bg)] rounded-xl shadow-2xl overflow-hidden border ${BORDER_SOFT}`}
        onClick={(e) => e.stopPropagation()}
      >
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user.id);

    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: profilesData } = await supabase.from("profiles").select("*");

    const profileMap = new Map(profilesData?.map((p: any) => [p.user_id, p]));

    const merged: Project[] = (projectsData || []).map((p: any) => ({
      ...p,
      status: p.status || "backlog",
      assignee: p.assignee_id ? profileMap.get(p.assignee_id) : undefined,
      assignee_id: p.assignee_id,
      user_id: p.user_id,
    }));

    setProjects(merged);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Delete Action
  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure? This deletes the project and all simulations."))
      return;
    setDeletingId(projectId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.detail || "Delete failed");
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
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
      const matchesSearch = (p.project_name + p.province)
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "mine") return p.assignee_id === currentUser;
      if (activeTab === "backlog") return !p.status || p.status === "backlog";

      return p.status === activeTab;
    });
  }, [projects, activeTab, search, currentUser]);

  const counts = useMemo(
    () => ({
      planning: projects.filter((p) => p.status === "planning").length,
      review: projects.filter((p) => p.status === "review").length,
      backlog: projects.filter((p) => !p.status || p.status === "backlog").length,
    }),
    [projects]
  );

  return (
    <div className="h-full w-full bg-[var(--background)] p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        <ProjectListHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={setSearch}
          onNewProject={() => setIsFormOpen(true)}
          counts={counts}
          totalCount={projects.length}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-48 rounded-2xl animate-pulse border ${BORDER_SOFT} ${BG_SOFT_2}`}
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            className={`py-20 text-center rounded-3xl border-2 border-dashed ${BORDER_SOFT}`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${BG_SOFT} ${TEXT_SOFT}`}
            >
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              No proposals found
            </h3>
            <p className={`text-sm mt-2 ${TEXT_MUTED}`}>
              Try changing filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onDelete={handleDelete}
                isDeleting={deletingId === p.id}
                currentUserId={currentUser}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ProjectCreateForm
          onClose={(created) => {
            setIsFormOpen(false);
            if (created) loadData();
          }}
        />
      </Modal>
    </div>
  );
}