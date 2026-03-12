"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProjectNavBar } from "../components/ProjectNavBar"; 
import { 
  CheckCircle2, 
  Circle, 
  ShieldAlert, 
  User, 
  Users, 
  History, 
  Loader2,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
};

type ProjectDetails = {
  id: string;
  project_name: string;
  status: 'backlog' | 'planning' | 'review' | 'published' | 'archived';
  assignee_id: string | null;
  user_id: string; // Owner ID
  locked: boolean;
};

type Collaborator = {
  id: string; // The row ID in project_collaborators
  user_id: string;
  user: Profile; // Joined profile data
  role: string;
};

type ActivityLog = {
  id: string;
  action_type: string;
  created_at: string;
  profiles: { first_name: string; last_name: string };
};

export default function ProjectGovernancePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Data State
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]); 
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // UI State
  const [isAddingCollab, setIsAddingCollab] = useState(false);

  // Status Flow Configuration
  const steps = [
    { id: 'backlog', label: 'Backlog', desc: 'Drafting & Setup' },
    { id: 'planning', label: 'Active Planning', desc: 'Data & Simulation' },
    { id: 'review', label: 'In Review', desc: 'Manager Approval' },
    { id: 'published', label: 'Published', desc: 'Locked & Live' },
  ];

  // --- 1. LOAD DATA ---
  useEffect(() => {
    async function loadData() {
      if (!projectId) return;

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);

      const { data: proj } = await supabase
        .from("projects")
        .select("id, project_name, status, assignee_id, user_id, locked")
        .eq("id", projectId)
        .single();
      
      if (proj) setProject(proj as any);

      const { data: collabData } = await supabase
        .from("project_collaborators")
        .select(`
            id, user_id, role,
            user:profiles!user_id ( user_id, first_name, last_name, email, department )
        `)
        .eq("project_id", projectId);
      
      if (collabData) setCollaborators(collabData as any);

      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order('first_name', { ascending: true });
      
      if (users) setAllUsers(users);

      fetchLogs();
      setLoading(false);
    }
    loadData();
  }, [projectId]);

  const fetchLogs = async () => {
      const { data: activity } = await supabase
        .from("project_activity_log")
        .select(`
            id, action_type, created_at,
            profiles:user_id ( first_name, last_name )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (activity) setLogs(activity as any);
  };

  // --- ACTIONS ---
  const updateStatus = async (newStatus: string) => {
    if (!project || !projectId) return;
    setProject({ ...project, status: newStatus as any });

    await supabase
      .from("projects")
      .update({ status: newStatus, locked: newStatus === 'published' })
      .eq("id", projectId);

    await logActivity('status_change', { from: project.status, to: newStatus });
    router.refresh();
  };

  const assignLead = async (userId: string) => {
      if (!project || !projectId) return;
      setProject({ ...project, assignee_id: userId });
      
      await supabase
        .from("projects")
        .update({ assignee_id: userId })
        .eq("id", projectId);
        
      await logActivity('assign_lead', { assignee: userId });
  };

  const addCollaborator = async (userId: string) => {
      if (!projectId || !userId) return;

      const { error } = await supabase
          .from("project_collaborators")
          .insert({ project_id: projectId, user_id: userId, role: 'editor' });

      if (!error) {
          const userProfile = allUsers.find(u => u.user_id === userId);
          if (userProfile) {
              setCollaborators([...collaborators, { 
                  id: 'temp-' + Date.now(), 
                  user_id: userId, 
                  role: 'editor', 
                  user: userProfile 
              }]);
          }
          await logActivity('add_collaborator', { user: userId });
          setIsAddingCollab(false);
      }
  };

  const removeCollaborator = async (userId: string) => {
      if (!projectId) return;
      
      setCollaborators(collaborators.filter(c => c.user_id !== userId));

      await supabase
          .from("project_collaborators")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", userId);
          
      await logActivity('remove_collaborator', { user: userId });
  };

  const logActivity = async (action: string, details: any) => {
      if (!currentUser) return;
      await supabase.from("project_activity_log").insert({
          project_id: projectId,
          user_id: currentUser,
          action_type: action,
          details: details
      });
      fetchLogs();
  };

  if (loading || !project) return <div className="p-12 flex justify-center text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]"><Loader2 className="animate-spin w-8 h-8" /></div>;

  const currentStepIndex = steps.findIndex(s => s.id === project.status);
  const availableUsers = allUsers.filter(u => 
      u.user_id !== project.assignee_id && 
      !collaborators.some(c => c.user_id === u.user_id)
  );

  return (
    <div className="h-full w-full bg-[var(--background)] overflow-y-auto flex flex-col">
        
        {projectId && <ProjectNavBar projectId={projectId} />}

        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20 w-full">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Governance & Settings</h1>
                <p className="text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]">
                    Manage lifecycle, team permissions, and audit trails for <strong className="text-[var(--foreground)]">{project.project_name}</strong>.
                </p>
            </div>

            {/* 1. LIFECYCLE ENGINE */}
            <section className="bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] rounded-lg text-[var(--accent-color)]">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--foreground)]">Project Lifecycle</h2>
                </div>

                <div className="relative flex justify-between items-center mb-8">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] -z-0" />
                    {steps.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const isCompleted = idx < currentStepIndex;
                        return (
                            <button 
                                key={step.id}
                                onClick={() => updateStatus(step.id)}
                                disabled={project.locked && !isActive} 
                                className="relative z-10 flex flex-col items-center group focus:outline-none"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                                    isActive ? "bg-[var(--accent-color)] border-[color:color-mix(in_oklab,var(--accent-color)_20%,transparent)] text-white scale-110 shadow-xl" :
                                    isCompleted ? "bg-emerald-500 border-[var(--surface-bg)] text-white" :
                                    "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] border-[var(--surface-bg)] text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] group-hover:border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-4 h-4 fill-current" />}
                                </div>
                                <div className="mt-3 text-center">
                                    <div className={cn("text-sm font-bold transition-colors", isActive ? "text-[var(--accent-color)]" : "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]")}>{step.label}</div>
                                    <div className="text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] font-mono mt-0.5">{step.desc}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 2. TEAM ROSTER */}
                <section className="bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-2xl p-6 h-full flex flex-col shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--foreground)]">Project Team</h2>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="text-xs font-bold uppercase text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mb-2 block">Project Lead</label>
                            <div className="relative">
                                <select 
                                    value={project.assignee_id || ""}
                                    onChange={(e) => assignLead(e.target.value)}
                                    className="w-full appearance-none bg-[var(--input-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] text-[var(--foreground)] text-sm rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="" disabled>Select a lead...</option>
                                    {allUsers.map(u => (
                                        <option key={u.user_id} value={u.user_id}>
                                            {u.first_name} {u.last_name} ({u.department})
                                        </option>
                                    ))}
                                </select>
                                <User className="absolute right-3 top-3.5 w-4 h-4 text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]">Collaborators</label>
                                <button 
                                    onClick={() => setIsAddingCollab(!isAddingCollab)}
                                    className="text-xs font-bold text-[var(--accent-color)] hover:brightness-110 flex items-center gap-1"
                                >
                                    {isAddingCollab ? <X className="w-3 h-3"/> : <Plus className="w-3 h-3"/>}
                                    {isAddingCollab ? "Cancel" : "Add Member"}
                                </button>
                            </div>

                            {isAddingCollab && (
                                <div className="mb-3 animate-in fade-in slide-in-from-top-2">
                                    <select 
                                        onChange={(e) => addCollaborator(e.target.value)}
                                        value=""
                                        className="w-full bg-[var(--input-bg)] border border-[var(--accent-color)] text-[var(--foreground)] text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                    >
                                        <option value="" disabled>Select user to add...</option>
                                        {availableUsers.map(u => (
                                            <option key={u.user_id} value={u.user_id}>
                                                {u.first_name} {u.last_name} ({u.department})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                {collaborators.length === 0 && !isAddingCollab && (
                                    <div className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] italic p-3 bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] rounded-lg text-center border border-dashed border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]">
                                        No additional collaborators.
                                    </div>
                                )}
                                {collaborators.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] flex items-center justify-center text-xs font-bold text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]">
                                                {c.user?.first_name?.[0]}{c.user?.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--foreground)]">
                                                    {c.user?.first_name} {c.user?.last_name}
                                                </div>
                                                <div className="text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] uppercase">{c.role}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeCollaborator(c.user_id)}
                                            className="p-1.5 text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. AUDIT LOG */}
                <section className="bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-2xl p-6 h-full shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <History className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--foreground)]">Activity Log</h2>
                    </div>

                    <div className="relative border-l border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] ml-2 space-y-6">
                        {logs.length === 0 ? (
                            <div className="pl-6 text-sm text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]">No activity recorded yet.</div>
                        ) : logs.map((log) => (
                            <div key={log.id} className="relative pl-6">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)] border-2 border-[var(--surface-bg)]" />
                                <div className="text-sm font-medium text-[var(--foreground)]">
                                    <span className="font-bold">{log.profiles?.first_name || 'User'}</span> {formatLogAction(log.action_type)}
                                </div>
                                <div className="text-xs text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mt-0.5 font-mono">
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
  );
}

function formatLogAction(action: string) {
    if (action === 'status_change') return 'changed project status';
    if (action === 'assign_lead') return 'updated project lead';
    if (action === 'add_collaborator') return 'added a team member';
    if (action === 'remove_collaborator') return 'removed a team member';
    if (action === 'config_update') return 'updated configuration';
    if (action === 'simulation_run') return 'ran a simulation';
    return 'updated project';
}