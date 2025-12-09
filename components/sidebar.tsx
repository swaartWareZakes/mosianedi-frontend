/* --- ./components/sidebar.tsx --- */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  FolderKanban,
  User2,
  Settings,
  Menu,
  ChevronLeft,
  Map,
  BarChart2,
  LogOut, // 👈 new icon
} from "lucide-react";

type Profile = {
  first_name: string;
  last_name: string;
  username: string;
  department: string;
  title: string;
};

const getInitials = (first?: string, last?: string) => {
  const f = first?.trim()?.[0] ?? "";
  const l = last?.trim()?.[0] ?? "";
  return (f + l).toUpperCase();
};

function SidebarComponent() {
  const [open, setOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = getInitials(profile?.first_name, profile?.last_name);

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-[var(--sidebar-bg)] shadow-lg rounded-2xl transition-all",
        open ? "w-68 max-w-xs" : "w-20"
      )}
    >
      {/* Profile + collapse */}
      <div className="flex items-center justify-between px-4 py-4">
        {open ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-color)] text-[12px] font-semibold text-white shrink-0">
              {initials || "?"}
            </div>
            <div className="truncate">
              <div className="truncate text-sm font-semibold text-[var(--foreground)]">
                {profile
                  ? `${profile.first_name} ${profile.last_name}`
                  : "Loading…"}
              </div>
              <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {profile ? `${profile.title} · ${profile.department}` : ""}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-color)] text-[12px] font-semibold text-white shrink-0">
            {initials || "?"}
          </div>
        )}

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0",
            open ? "ml-2" : "ml-auto"
          )}
          aria-label="Toggle sidebar"
        >
          {open ? (
            <ChevronLeft className="h-4 w-4 text-[var(--foreground)]/70 dark:text-slate-300" />
          ) : (
            <Menu className="h-4 w-4 text-[var(--foreground)]/70 dark:text-slate-300" />
          )}
        </button>
      </div>

      {/* Nav (scrollable if needed) */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <NavLink
          href="/projects"
          icon={<FolderKanban className="h-4 w-4" />}
          label={open ? "Projects" : ""}
        />
        <NavLink
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label={open ? "Dashboard" : ""}
        />
        <NavLink
          href="/network"
          icon={<Map className="h-4 w-4" />}
          label={open ? "Network" : ""}
        />
        <NavLink
          href="/reports"
          icon={<BarChart2 className="h-4 w-4" />}
          label={open ? "Reports" : ""}
        />
        <NavLink
          href="/profile"
          icon={<User2 className="h-4 w-4" />}
          label={open ? "Profile" : ""}
        />
        <NavLink
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
          label={open ? "Settings" : ""}
        />

        {/* Logout nav item */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            "mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            "text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
            loggingOut && "opacity-60 cursor-not-allowed"
          )}
        >
          <LogOut className="h-4 w-4" />
          {open && <span>{loggingOut ? "Logging out…" : "Logout"}</span>}
        </button>
      </nav>

      {/* Branding */}
      <div className="border-t border-slate-200/10 px-4 py-3 text-center text-[11px] text-slate-500 dark:border-slate-800/10 dark:text-slate-400">
        Mosianedi · Road Investment Studio
      </div>
    </aside>
  );
}

export default SidebarComponent;
export { SidebarComponent as Sidebar };