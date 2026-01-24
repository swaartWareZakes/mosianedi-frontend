"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const DEPARTMENTS = [
  "Planning",
  "Design",
  "Construction",
  "Maintenance",
  "Asset Management",
];

const JOB_TITLES = [
  "Roads Design Engineer",
  "Pavement Engineer",
  "Transportation Planner",
  "Project Manager",
  "Asset Management Specialist",
];

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [title, setTitle] = useState(JOB_TITLES[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setSubmitting(false);
      setError(signUpError?.message || "Unable to create account.");
      return;
    }

    const user = data.user;

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      department,
      title,
    });

    setSubmitting(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    router.replace("/projects");
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-[var(--surface-bg)]/95 p-8 shadow-lg dark:border-slate-800/70">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        Create account
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Start modeling with <strong>SA Roads Funding Gap Solutions</strong>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Name Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              First name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Last name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
            placeholder="jabu.mosianedi"
          />
        </div>

        {/* Department + Job title */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Job title
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
            >
              {JOB_TITLES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
            placeholder="you@example.com"
          />
        </div>

        {/* Passwords */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 transition"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account? <button type="button" onClick={() => router.push("/login")} className="font-medium text-[var(--accent-color)] hover:underline">Sign in</button>
      </p>
    </div>
  );
}