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
  Truck,
  TrendingUp,
} from "lucide-react";

type Profile = {
  first_name: string;
  last_name: string;
  username: string;
  department: string;
  title: string;
};

const SIDEBAR = {
  bg: "bg-[var(--sidebar-bg)]",
  surface: "bg-[var(--surface-bg)]",
  canvas: "bg-[var(--background)]",
  text: "text-[var(--foreground)]",
  muted: "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]",
  border: "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]",
  hover: "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]",
  activeSoft:
    "bg-[color:color-mix(in_oklab,var(--accent-color)_14%,transparent)] text-[var(--accent-color)]",
  activeSolid: "bg-[var(--accent-color)] text-white",
};

function NavGroup({
  label,
  icon,
  active,
  expanded,
  onToggle,
  children,
  sidebarOpen,
}: any) {
  if (!sidebarOpen) {
    return (
      <div className="relative group">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-center p-3 rounded-xl transition-colors",
            active ? `${SIDEBAR.activeSolid} shadow-md` : `${SIDEBAR.muted} ${SIDEBAR.hover}`
          )}
        >
          {icon}
        </button>

        <div
          className={cn(
            "absolute left-16 top-2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap",
            "bg-[var(--foreground)] text-[var(--background)]"
          )}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? `${SIDEBAR.hover} ${SIDEBAR.text}`
            : `${SIDEBAR.muted} ${SIDEBAR.hover} hover:text-[var(--foreground)]`
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className={cn("shrink-0", active ? "text-[var(--accent-color)]" : "")}>
              {icon}
            </span>
          )}
          <span className="truncate">{label}</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 opacity-60" />
        ) : (
          <ChevronRight className="h-4 w-4 opacity-60" />
        )}
      </button>

      {expanded && (
        <div
          className={cn(
            "ml-4 pl-3 border-l-2 space-y-1 mt-1 animate-in slide-in-from-left-1 duration-200",
            "border-[color:color-mix(in_oklab,var(--foreground)_12%,transparent)]"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function NavItem({ href, label, icon }: any) {
  const pathname = usePathname();
  const isActive = href ? pathname === href || pathname.startsWith(`${href}?`) : false;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
        isActive ? SIDEBAR.activeSoft : `${SIDEBAR.muted} ${SIDEBAR.hover} hover:text-[var(--foreground)]`
      )}
    >
      {icon && <span className="w-3 h-3 opacity-80">{icon}</span>}
      {label}
    </Link>
  );
}

function SimpleLink({ href, icon, label, active, open }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative",
        active
          ? `${SIDEBAR.activeSolid} shadow-md`
          : `${SIDEBAR.muted} ${SIDEBAR.hover} hover:text-[var(--foreground)]`,
        !open && "justify-center"
      )}
    >
      {icon}
      {open ? (
        <span>{label}</span>
      ) : (
        <div
          className={cn(
            "absolute left-14 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity",
            "bg-[var(--foreground)] text-[var(--background)]"
          )}
        >
          {label}
        </div>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : (params?.projectId as string | undefined);

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [reportingOpen, setReportingOpen] = useState(true);
  const [networkOpen, setNetworkOpen] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    if (open) {
      setProjectsOpen(false);
      setReportingOpen(false);
      setNetworkOpen(false);
    }
  };

  const dashboardHref = projectId ? `/projects/${projectId}/dashboard` : "/dashboard";
  const advisorHref = projectId ? `/projects/${projectId}/advisor` : "/advisor";

  const executiveCaseHref = "/reports/treasury-view";
  const engineeringProgHref = "/reports/budget";
  const reportsBuilderHref = "/reports";

  return (
    <aside
      className={cn(
        "flex h-full flex-col transition-all duration-300 ease-in-out z-20 shrink-0 border-r",
        SIDEBAR.bg,
        SIDEBAR.border,
        open ? "w-64" : "w-20"
      )}
    >
      {/* HEADER */}
      <div className={cn("flex items-center h-16 px-4 border-b", SIDEBAR.border, open ? "justify-between" : "justify-center")}>
        {open ? (
          <div className={cn("flex items-center gap-2 font-bold text-sm tracking-tight leading-none", SIDEBAR.text)}>
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)] flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="leading-tight">SA Roads Funding Gap Solutions</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)] flex items-center justify-center text-white font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto no-scrollbar">
        <NavGroup
          label="Projects"
          icon={<FolderKanban className="w-5 h-5" />}
          active={pathname.includes("/projects") || pathname.includes("/advisor")}
          expanded={projectsOpen}
          onToggle={() => {
            if (!open) setOpen(true);
            setProjectsOpen(!projectsOpen);
          }}
          sidebarOpen={open}
        >
          <NavItem href="/projects/recent" label="Recent Activity" icon={<Clock className="w-3 h-3" />} />
          <NavItem href="/projects" label="All Proposals" icon={<FileText className="w-3 h-3" />} />
          <NavItem href={advisorHref} label="AI Advisor" icon={<Sparkles className="w-3 h-3" />} />
          <NavItem
            href={projectId ? `/projects/${projectId}/governance` : "/projects/governance"}
            label="Governance"
            icon={<ShieldAlert className="w-3 h-3" />}
          />
        </NavGroup>

        <SimpleLink
          href={dashboardHref}
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Dashboard"
          active={pathname.includes("/dashboard")}
          open={open}
        />

        <NavGroup
          label="Network & GIS"
          icon={<Map className="w-5 h-5" />}
          active={pathname.includes("/network")}
          expanded={networkOpen}
          onToggle={() => {
            if (!open) setOpen(true);
            setNetworkOpen(!networkOpen);
          }}
          sidebarOpen={open}
        >
          <NavItem href="/network/inventory" label="Network Inventory" icon={<Layers className="w-3 h-3" />} />
          <NavItem href="/network/digital-twin" label="3D Simulation" icon={<Truck className="w-3 h-3" />} />
        </NavGroup>

        <NavGroup
          label="Provincial Reporting"
          icon={<Briefcase className="w-5 h-5" />}
          active={pathname.includes("/reports")}
          expanded={reportingOpen}
          onToggle={() => {
            if (!open) setOpen(true);
            setReportingOpen(!reportingOpen);
          }}
          sidebarOpen={open}
        >
          <NavItem href={executiveCaseHref} label="Executive Case" icon={<Presentation className="w-3 h-3" />} />
          <NavItem href={engineeringProgHref} label="Engineering Prog." icon={<Wallet className="w-3 h-3" />} />
          <NavItem href={reportsBuilderHref} label="Submission Builder" icon={<FileCheck className="w-3 h-3" />} />
        </NavGroup>

        <SimpleLink
          href="/presentationmode"
          icon={<Presentation className="w-5 h-5" />}
          label="Boardroom Mode"
          active={pathname === "/presentationmode"}
          open={open}
        />
      </nav>

      {/* FOOTER */}
      <div className={cn("p-4 border-t", SIDEBAR.border, SIDEBAR.surface)}>
        <div className={cn("flex items-center gap-3 mb-4", !open && "justify-center")}>
          <div className="w-9 h-9 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
            {initials}
          </div>

          {open && (
            <div className="flex-1 overflow-hidden">
              <div className={cn("truncate text-sm font-bold", SIDEBAR.text)}>
                {profile ? `${profile.first_name} ${profile.last_name}` : "User"}
              </div>
              <div className={cn("truncate text-[10px] uppercase font-bold tracking-wider", SIDEBAR.muted)}>
                {profile?.department || "Admin"}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-colors border",
              SIDEBAR.border,
              SIDEBAR.muted,
              "hover:text-[color:color-mix(in_oklab,var(--accent-color)_70%,white)] hover:bg-[color:color-mix(in_oklab,var(--accent-color)_12%,transparent)]"
            )}
          >
            <LogOut className="w-3.5 h-3.5" />
            {open && "Log Out"}
          </button>

          <button
            onClick={toggleSidebar}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors",
              SIDEBAR.border,
              SIDEBAR.muted,
              SIDEBAR.hover
            )}
          >
            {open ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}