/* --- ./components/nav-link.tsx (UPDATED - Icon Color) --- */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon?: ReactNode;
  label: string;
}

export function NavLink({ href, icon, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Define classes for icon color based on active state
  const iconClasses = isActive
    ? "" // Active state icon color is inherited from parent (text-white)
    : "text-slate-500 dark:text-slate-400"; // Inactive state uses fixed slate colors

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-[var(--accent-color)] text-white shadow-sm"
          // Inactive state uses explicit fixed colors for the specific muted look
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
      )}
    >
      {icon && <span className={cn("shrink-0", iconClasses)}>{icon}</span>}
      {label && <span className="truncate">{label}</span>}
    </Link>
  );
}