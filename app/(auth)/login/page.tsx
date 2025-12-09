/* --- ./app/(auth)/login/page.tsx (FULLY UPDATED - Input Fix) --- */
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.replace("/projects");
    }
  };

  return (
    // Card Container: Use surface-bg variable
    <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-[var(--surface-bg)]/95 p-8 shadow-lg dark:border-slate-800/70">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Access the Mosianedi road investment studio.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full rounded-xl border border-slate-300
              // FIX: Use explicit variable for background and text
              bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)]
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100
              dark:border-slate-700 dark:focus:ring-sky-800/40
            "
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full rounded-xl border border-slate-300 
              // FIX: Use explicit variable for background and text
              bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)]
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100
              dark:border-slate-700 dark:focus:ring-sky-800/40
            "
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="
            mt-2 inline-flex w-full items-center justify-center
            rounded-xl bg-[var(--accent-color)] px-4 py-2.5
            text-sm font-semibold text-white
            shadow-sm hover:brightness-110
            disabled:cursor-not-allowed disabled:opacity-70
            transition
          "
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="font-medium text-[var(--accent-color)] hover:underline"
        >
          Create one
        </button>
      </p>
    </div>
  );
}