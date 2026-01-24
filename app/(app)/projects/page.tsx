"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProjectCreateForm } from "./ProjectCreateForm";
import {
  Plus,
  Search,
  Clock,
  FileText,
  AlertCircle,
  User,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type Project = {
  id: string;
  project_name: string;
  province: string;
  start_year: number;
  status: "backlog" | "planning" | "review" | "published" | "archived";
  due_date: string | null;
  created_at: string;
  assignee_id: string | null;
  assignee?: Profile;
};

// --- MODAL COMPONENT ---
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
        className="relative w-full max-w-lg bg-[var(--surface-bg)] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function loadData() {
    setLoading(true);

    // A. Get Current User
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) console.warn("auth.getUser error:", userErr);

    if (!user) {
      setCurrentUser(null);
      setProjects([]);
      setLoading(false);
      router.replace("/login");
      return;
    }

    setCurrentUser(user.id);

    // B. Fetch Projects (Raw)
    const { data: projectsData, error: projError } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projError) {
      console.error("Error loading projects:", projError);
      setLoading(false);
      return;
    }

    // C. Fetch Profiles (for Assignees)
    const { data: profilesData, error: profErr } = await supabase
      .from("profiles")
      .select("*");

    if (profErr) console.warn("Error loading profiles:", profErr);

    const profileMap = new Map<string, Profile>();
    profilesData?.forEach((p: any) => profileMap.set(p.user_id, p));

    // D. Merge Data
    const mergedProjects = (projectsData || []).map((p: any) => ({
      ...p,
      status: (p.status || "backlog") as Project["status"],
      assignee: p.assignee_id ? profileMap.get(p.assignee_id) : undefined,
    }));

    setProjects(mergedProjects);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FILTER LOGIC ---
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        p.project_name.toLowerCase().includes(searchLower) ||
        p.province.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;

      // Note: "My Assignments" only works if assignee_id is populated
      if (activeTab === "mine") return p.assignee_id === currentUser;

      if (activeTab === "planning") return p.status === "planning";
      if (activeTab === "review") return p.status === "review";
      if (activeTab === "backlog") return p.status === "backlog" || !p.status;

      return true;
    });
  }, [projects, activeTab, search, currentUser]);

  const counts = useMemo(() => {
    const planning = projects.filter((p) => p.status === "planning").length;
    const review = projects.filter((p) => p.status === "review").length;
    const backlog = projects.filter((p) => p.status === "backlog" || !p.status).length;
    return { planning, review, backlog };
  }, [projects]);

  return (
    <div className="h-full w-full bg-[var(--background)] p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mission Control
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage province-first road programmes and approval workflows.
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            <Plus className="w-5 h-5" />
            New Provincial Proposal
          </button>
        </div>

        {/* WORKFLOW TABS */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-2 sm:pb-0">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="All Proposals"
              count={projects.length}
            />
            <TabButton
              active={activeTab === "mine"}
              onClick={() => setActiveTab("mine")}
              label="My Assignments"
              icon={<User className="w-4 h-4" />}
            />
            <TabButton
              active={activeTab === "planning"}
              onClick={() => setActiveTab("planning")}
              label="Active Planning"
              icon={<FileText className="w-4 h-4 text-blue-500" />}
              count={counts.planning}
            />
            <TabButton
              active={activeTab === "review"}
              onClick={() => setActiveTab("review")}
              label="Needs Review"
              icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
              count={counts.review}
            />
            <TabButton
              active={activeTab === "backlog"}
              onClick={() => setActiveTab("backlog")}
              label="Backlog"
              icon={<Clock className="w-4 h-4 text-slate-400" />}
              count={counts.backlog}
            />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by province or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* PROJECT GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No proposals found
            </h3>
            <p className="text-slate-500 mt-2">
              Try adjusting your filters or create a new provincial proposal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ProjectCreateForm
          onClose={(created, newProjectId) => {
            setIsFormOpen(false);
            if (created) {
              loadData();
              if (newProjectId) router.push(`/projects/${newProjectId}/config`);
            }
          }}
        />
      </Modal>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, label, count, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-lg",
        active
          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold ml-1",
            active
              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusConfig =
    {
      backlog: {
        color:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        label: "Backlog",
      },
      planning: {
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Planning",
      },
      review: {
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        label: "In Review",
      },
      published: {
        color:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        label: "Published",
      },
      archived: { color: "bg-slate-100 text-slate-400", label: "Archived" },
    }[project.status || "backlog"];

  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : "N/A";

  return (
    <Link
      href={`/projects/${project.id}/config`}
      className="group relative bg-white dark:bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-300">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span
          className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider",
            statusConfig.color
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="mb-4 flex-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
          {project.project_name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {project.province}
          </span>
          <span>•</span>
          <span>FY{project.start_year}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {project.assignee ? (
            <div
              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold"
              title={`${project.assignee.first_name} ${project.assignee.last_name}`}
            >
              {project.assignee.first_name[0]}
              {project.assignee.last_name[0]}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
          )}
          <span className="text-xs text-slate-400">
            {project.assignee ? `${project.assignee.first_name}` : "Unassigned"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </div>
      </div>
    </Link>
  );
}