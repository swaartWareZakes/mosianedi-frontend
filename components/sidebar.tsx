"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import {
  FolderKanban,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Presentation,
  Clock,
  FileText,
  ShieldAlert,
  Briefcase,
  LayoutDashboard,
  Layers,
  FileCheck,
  Sparkles,
  Wallet,
  Map,
  TrendingUp // Added for the Logo
} from "lucide-react";

type Profile = {
  first_name: string;
  last_name: string;
  username: string;
  department: string;
  title: string;
};

// --- 1. NAV GROUP (Accordion) ---
function NavGroup({ label, icon, active, expanded, onToggle, children, sidebarOpen }: any) {
    if (!sidebarOpen) {
        return (
            <div className="relative group">
                <button onClick={onToggle} className={cn("flex w-full items-center justify-center p-3 rounded-xl transition-colors", active ? "bg-[var(--accent-color)] text-white shadow-md" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400")}>
                    {icon}
                </button>
                <div className="absolute left-16 top-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">{label}</div>
            </div>
        );
    }
    return (
        <div className="space-y-1">
            <button onClick={onToggle} className={cn("w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200")}>
                <div className="flex items-center gap-3">
                    {icon && <span className={cn("shrink-0", active ? "text-[var(--accent-color)]" : "")}>{icon}</span>}
                    <span className="truncate">{label}</span>
                </div>
                {expanded ? <ChevronDown className="h-4 w-4 opacity-50"/> : <ChevronRight className="h-4 w-4 opacity-50"/>}
            </button>
            {expanded && <div className="ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 mt-1 animate-in slide-in-from-left-1 duration-200">{children}</div>}
        </div>
    );
}

// --- 2. NAV ITEM (Sub-Link) ---
function NavItem({ href, label, icon }: any) {
    const pathname = usePathname();
    const isActive = href ? pathname === href : false;
    return (
        <Link href={href} className={cn("flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors", isActive ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)]" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200")}>
            {icon && <span className="w-3 h-3 opacity-70">{icon}</span>}
            {label}
        </Link>
    );
}

// --- 3. SIMPLE LINK (Single Level) ---
function SimpleLink({ href, icon, label, active, open }: any) {
    return (
        <Link href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative", active ? "bg-[var(--accent-color)] text-white shadow-md shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200", !open && "justify-center")}>
            {icon}
            {open ? <span>{label}</span> : <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">{label}</div>}
        </Link>
    );
}

// --- MAIN COMPONENT ---
export function Sidebar() {
  const [open, setOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  // Extract projectId if we are in a project context
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [reportingOpen, setReportingOpen] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) setProfile(data as Profile);
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const initials = profile ? (profile.first_name[0] + profile.last_name[0]).toUpperCase() : "U";

  const toggleSidebar = () => {
      setOpen(!open);
      if (open) { setProjectsOpen(false); setReportingOpen(false); }
  };

  // ✅ DYNAMIC ROUTES
  const dashboardHref = projectId ? `/projects/${projectId}/dashboard` : "/dashboard";
  const advisorHref = projectId ? `/projects/${projectId}/advisor` : "/advisor";

  // ✅ REPORT LINKS
  const executiveCaseHref = "/reports/treasury-view";
  const engineeringProgHref = "/reports/budget";
  const reportsBuilderHref = "/reports";

  return (
    <aside className={cn("flex h-full flex-col bg-[var(--sidebar-bg)] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 shrink-0", open ? "w-64" : "w-20")}>
      
      {/* HEADER - UPDATED BRANDING */}
      <div className={cn("flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-800/50", open ? "justify-between" : "justify-center")}>
        {open ? (
             <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <span className="leading-tight">SA Roads Funding Gap Solutions</span>
             </div>
        ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <TrendingUp className="w-5 h-5" />
            </div>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto no-scrollbar">
        {/* PROJECTS */}
        <NavGroup 
            label="Projects" 
            icon={<FolderKanban className="w-5 h-5"/>} 
            active={pathname.includes("/projects") || pathname.includes("/advisor")}
            expanded={projectsOpen}
            onToggle={() => { if (!open) setOpen(true); setProjectsOpen(!projectsOpen); }}
            sidebarOpen={open}
        >
            <NavItem href="/projects/recent" label="Recent Activity" icon={<Clock className="w-3 h-3"/>} />
            <NavItem href="/projects" label="All Proposals" icon={<FileText className="w-3 h-3"/>} />
            <NavItem href={advisorHref} label="AI Advisor" icon={<Sparkles className="w-3 h-3 text-purple-500"/>} />
            <NavItem href={projectId ? `/projects/${projectId}/governance` : "/projects/governance"} label="Governance" icon={<ShieldAlert className="w-3 h-3"/>} />
        </NavGroup>

        {/* DASHBOARD */}
        <SimpleLink href={dashboardHref} icon={<LayoutDashboard className="w-5 h-5"/>} label="Dashboard" active={pathname.includes("/dashboard")} open={open} />
        
        {/* NETWORK & GIS */}
        <SimpleLink href="/network" icon={<Map className="w-5 h-5"/>} label="Network & GIS" active={pathname.includes("/network")} open={open} />

        {/* PROVINCIAL REPORTING */}
        <NavGroup 
            label="Provincial Reporting" 
            icon={<Briefcase className="w-5 h-5"/>} 
            active={pathname.includes("/reports")}
            expanded={reportingOpen}
            onToggle={() => { if (!open) setOpen(true); setReportingOpen(!reportingOpen); }}
            sidebarOpen={open}
        >
            <NavItem href={executiveCaseHref} label="Executive Case" icon={<Presentation className="w-3 h-3"/>} />
            <NavItem href={engineeringProgHref} label="Engineering Prog." icon={<Wallet className="w-3 h-3"/>} />
            <NavItem href={reportsBuilderHref} label="Submission Builder" icon={<FileCheck className="w-3 h-3"/>} />
        </NavGroup>

        <SimpleLink href="/presentationmode" icon={<Presentation className="w-5 h-5"/>} label="Boardroom Mode" active={pathname === "/presentationmode"} open={open} />
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className={cn("flex items-center gap-3 mb-4", !open && "justify-center")}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">{initials}</div>
              {open && (
                  <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{profile ? `${profile.first_name} ${profile.last_name}` : "User"}</div>
                      <div className="truncate text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile?.department || "Admin"}</div>
                  </div>
              )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogout} disabled={loggingOut} className={cn("flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-colors border", "border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 text-slate-500")}>
                <LogOut className="w-3.5 h-3.5" />{open && "Log Out"}
            </button>
            <button onClick={toggleSidebar} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                {open ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
            </button>
          </div>
      </div>
    </aside>
  );
}