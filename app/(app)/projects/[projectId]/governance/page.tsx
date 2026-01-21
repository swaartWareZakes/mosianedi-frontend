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

      // Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);

      // A. Fetch Project
      const { data: proj } = await supabase
        .from("projects")
        .select("id, project_name, status, assignee_id, user_id, locked")
        .eq("id", projectId)
        .single();
      
      if (proj) setProject(proj as any);

      // B. Fetch Collaborators (New Table)
      // Note: We use the join syntax here because RLS is now open
      const { data: collabData } = await supabase
        .from("project_collaborators")
        .select(`
            id, user_id, role,
            user:profiles!user_id ( user_id, first_name, last_name, email, department )
        `)
        .eq("project_id", projectId);
      
      if (collabData) setCollaborators(collabData as any);

      // C. Fetch All Profiles (for dropdowns)
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order('first_name', { ascending: true });
      
      if (users) setAllUsers(users);

      // D. Fetch Logs
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

      // 1. Add to DB
      const { error } = await supabase
          .from("project_collaborators")
          .insert({ project_id: projectId, user_id: userId, role: 'editor' });

      if (!error) {
          // 2. Refresh List Locally
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
      
      // Optimistic Remove
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

  if (loading || !project) return <div className="p-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" /></div>;

  const currentStepIndex = steps.findIndex(s => s.id === project.status);
  
  // Filter available users for "Add Collaborator" (Exclude current lead + existing collabs)
  const availableUsers = allUsers.filter(u => 
      u.user_id !== project.assignee_id && 
      !collaborators.some(c => c.user_id === u.user_id)
  );

  return (
    <div className="h-full w-full bg-[var(--background)] overflow-y-auto">
        
        <div className="sticky top-0 z-10 bg-[var(--background)]">
            {projectId && <ProjectNavBar projectId={projectId} />}
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Governance & Settings</h1>
                <p className="text-slate-500">Manage lifecycle, team permissions, and audit trails for <strong className="text-white">{project.project_name}</strong>.</p>
            </div>

            {/* 1. LIFECYCLE ENGINE */}
            <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Lifecycle</h2>
                </div>

                <div className="relative flex justify-between items-center mb-8">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
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
                                    isActive ? "bg-indigo-600 border-indigo-100 dark:border-indigo-900 text-white scale-110 shadow-xl shadow-indigo-500/20" :
                                    isCompleted ? "bg-emerald-500 border-slate-50 dark:border-slate-900 text-white" :
                                    "bg-slate-100 dark:bg-slate-800 border-slate-50 dark:border-slate-900 text-slate-400 group-hover:border-slate-300"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-4 h-4 fill-current" />}
                                </div>
                                <div className="mt-3 text-center">
                                    <div className={cn("text-sm font-bold transition-colors", isActive ? "text-indigo-500" : "text-slate-500")}>{step.label}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{step.desc}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 2. TEAM ROSTER */}
                <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Team</h2>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Lead */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Project Lead</label>
                            <div className="relative">
                                <select 
                                    value={project.assignee_id || ""}
                                    onChange={(e) => assignLead(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="" disabled>Select a lead...</option>
                                    {allUsers.map(u => (
                                        <option key={u.user_id} value={u.user_id}>
                                            {u.first_name} {u.last_name} ({u.department})
                                        </option>
                                    ))}
                                </select>
                                <User className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Collaborators List */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase text-slate-500">Collaborators</label>
                                <button 
                                    onClick={() => setIsAddingCollab(!isAddingCollab)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                                >
                                    {isAddingCollab ? <X className="w-3 h-3"/> : <Plus className="w-3 h-3"/>}
                                    {isAddingCollab ? "Cancel" : "Add Member"}
                                </button>
                            </div>

                            {/* Add Member Dropdown */}
                            {isAddingCollab && (
                                <div className="mb-3 animate-in fade-in slide-in-from-top-2">
                                    <select 
                                        onChange={(e) => addCollaborator(e.target.value)}
                                        value=""
                                        className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
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

                            {/* List */}
                            <div className="space-y-2">
                                {collaborators.length === 0 && !isAddingCollab && (
                                    <div className="text-sm text-slate-400 italic p-3 bg-white dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-800">
                                        No additional collaborators.
                                    </div>
                                )}
                                {collaborators.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {c.user?.first_name?.[0]}{c.user?.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {c.user?.first_name} {c.user?.last_name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 uppercase">{c.role}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeCollaborator(c.user_id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
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
                <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <History className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Log</h2>
                    </div>

                    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-2 space-y-6">
                        {logs.length === 0 ? (
                            <div className="pl-6 text-sm text-slate-500">No activity recorded yet.</div>
                        ) : logs.map((log) => (
                            <div key={log.id} className="relative pl-6">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-slate-50 dark:border-slate-900" />
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    <span className="font-bold">{log.profiles?.first_name || 'User'}</span> {formatLogAction(log.action_type)}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 font-mono">
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