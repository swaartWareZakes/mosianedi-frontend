/* --- ./app/(auth)/layout.tsx (NO CHANGES) --- */
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}