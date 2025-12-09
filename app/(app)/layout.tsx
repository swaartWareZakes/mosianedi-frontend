/* --- ./app/(app)/layout.tsx (UPDATED) --- */
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    };

    checkSession();
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        Checking session...
      </div>
    );
  }

  return (
    // Outer container uses a gap for margin and sets the page background
    // Removed outer shadow for cleaner look based on the reference
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] gap-6 p-6">
      <Sidebar />
      <div className="flex h-full flex-1 flex-col gap-6">
        <Topbar />
        {/* Removed bg-[var(--surface-bg)] from main to show page background */}
        {/* Added rounded-2xl to main for visual consistency with topbar/sidebar */}
        <main className="flex-1 overflow-y-auto rounded-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}