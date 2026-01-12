/* --- ./app/(app)/projects/page.tsx (FINAL CONSOLIDATED FIX) --- */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectCreateForm } from './ProjectCreateForm';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";

// Define the Project type based on the data returned from the FastAPI endpoint
interface Project {
  id: string;
  project_name: string;
  province: string;
  start_year: number;
  proposal_title?: string | null;
  proposal_status?: string | null;
  created_at: string;
}

const PROJECTS_ENDPOINT = `${API_BASE_URL}/api/v1/projects`;

// Placeholder component for a simple modal backdrop
function Modal({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: (success?: boolean) => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={() => onClose(false)}
    >
      <div
        className="relative max-h-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Project Card Component
const ProjectCard = ({ project }: { project: Project }) => (
  <Link
    href={`/projects/${project.id}/config`}
    className="block p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-xl hover:shadow-md transition-shadow bg-[var(--surface-bg)]"
  >
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-lg hover:text-[var(--accent-color)] transition-colors">
        {project.project_name}
      </h3>
      <FolderKanban className="h-5 w-5 text-slate-500 dark:text-slate-400" />
    </div>

    {/* Keep styling the same; just show new info instead of description */}
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
      {project.province} • {project.start_year}
    </p>

    <div className="mt-3 flex text-xs text-slate-500 dark:text-slate-500 space-x-4">
      {/* Kept your original commented section intact */}
      {/* <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Duration: {project.forecast_duration} Years
      </span>
      <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" /> Discount Rate: {project.discount_rate}%
      </span> */}
    </div>
  </Link>
);

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      setLoading(false);
      setError('Authorization required. Please log in.');
      return;
    }

    try {
      const response = await fetch(PROJECTS_ENDPOINT, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired or the token is invalid.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) setProjects(data as Project[]);
      else setProjects([]);

    } catch (err) {
      console.error("Fetch Projects Failed:", err);
      setError(`Could not load projects: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // IMPORTANT: accept optional boolean so TS matches Modal + Form
  const handleFormClose = (projectCreated?: boolean) => {
    setIsFormOpen(false);
    if (projectCreated) fetchProjects();
  };

  let content;
  const isAuthError = error && error.includes('Authorization required');

  if (loading) {
    content = (
      <div className="text-center py-20 text-slate-400 dark:text-slate-600">
        <p>Loading projects...</p>
      </div>
    );
  } else if (isAuthError) {
    content = (
      <div className="text-center py-20 text-red-500">
        <p>⚠️ {error}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Please navigate back to the sign-in page to log in.
        </p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="text-center py-20 text-red-500">
        <p>{error}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Check console and FastAPI logs for details.
        </p>
      </div>
    );
  } else if (projects.length === 0) {
    content = (
      <div className="text-center py-20 text-slate-400 dark:text-slate-600">
        <p>No projects found. Click "New Scenario" to get started.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl bg-[var(--surface-bg)] shadow-lg p-6",
        "text-[var(--foreground)]"
      )}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            List of scenarios and road programmes will go here.
          </p>
        </div>

        {/* Create Project Button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition"
        >
          <Plus className="h-4 w-4" />
          New Scenario
        </button>
      </div>

      {/* Project List/Content Area */}
      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
        {content}
      </div>

      {/* Project Creation Modal */}
      <Modal isOpen={isFormOpen} onClose={handleFormClose}>
        <ProjectCreateForm onClose={handleFormClose} />
      </Modal>
    </div>
  );
}