"use client";

import { FormEvent, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { TrendingUp, BarChart3, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

// Theme-safe tokens (no dark: classes)
const BG = "bg-[var(--background)]";
const SURFACE = "bg-[var(--surface-bg)]";
const TEXT = "text-[var(--foreground)]";
const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const INPUT_BG = "bg-[var(--input-bg)]";
const INPUT_TEXT = "text-[var(--input-text)]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorBox = useMemo(
    () =>
      cn(
        "p-3 rounded-lg text-xs font-medium border",
        "bg-[color:color-mix(in_oklab,crimson_10%,transparent)]",
        "text-[color:color-mix(in_oklab,crimson_70%,black)]",
        "border-[color:color-mix(in_oklab,crimson_22%,transparent)]"
      ),
    []
  );

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
      router.replace("/portal");
    }
  };

  return (
    <div className={cn("min-h-screen w-full flex", BG, TEXT)}>
      {/* LEFT: OVERVIEW (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-indigo-950" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-950/90" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              SA Roads Funding Gap Solutions
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight mb-6">
            Bridge the gap between{" "}
            <span className="text-emerald-400">Engineering</span> &{" "}
            <span className="text-indigo-300">Finance Decisioning.</span>
          </h1>

          <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
            A modelling platform designed to justify road maintenance budgets using consistent
            condition + cost simulation.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <FeatureItem
            icon={<BarChart3 className="w-5 h-5 text-indigo-300" />}
            title="Scenario Modeling"
            desc="Visualize the impact of budget choices on network condition over 10 years."
          />
          <FeatureItem
            icon={<BrainCircuit className="w-5 h-5 text-indigo-300" />}
            title="AI Strategic Advisor"
            desc="Generate decision-maker-ready motivation and risk narratives."
          />
        </div>

        <div className="relative z-10 text-xs text-indigo-300/60 font-mono">
          v2.4.0 • Secure Workspace Gateway
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className={cn("text-2xl font-black", TEXT)}>Welcome back</h2>
            <p className={cn("text-sm mt-2", MUTED)}>
              Sign in to access your workspace.
            </p>
          </div>

          <div className={cn("p-8 rounded-3xl border shadow-xl", SURFACE, BORDER)}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={cn("block text-xs font-black uppercase mb-1.5", MUTED)}>
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all",
                    BORDER,
                    INPUT_BG,
                    INPUT_TEXT,
                    "focus:ring-2 focus:ring-indigo-200/50 focus:border-[color:color-mix(in_oklab,indigo_40%,transparent)]"
                  )}
                  placeholder="engineer@province.gov.za"
                />
              </div>

              <div>
                <label className={cn("block text-xs font-black uppercase mb-1.5", MUTED)}>
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all",
                    BORDER,
                    INPUT_BG,
                    INPUT_TEXT,
                    "focus:ring-2 focus:ring-indigo-200/50 focus:border-[color:color-mix(in_oklab,indigo_40%,transparent)]"
                  )}
                  placeholder="••••••••"
                />
              </div>

              {error && <div className={errorBox}>{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]",
                  "disabled:opacity-70 disabled:cursor-not-allowed"
                )}
              >
                {submitting ? "Authenticating..." : "Access Workspace"}
              </button>
            </form>
          </div>

          <p className={cn("text-center text-xs", MUTED)}>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-indigo-600 font-black hover:underline"
              type="button"
            >
              Request Access
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4 items-start">
      <div className="p-2 bg-white/5 rounded-lg border border-white/10">{icon}</div>
      <div>
        <div className="font-bold text-white text-sm">{title}</div>
        <div className="text-xs text-indigo-200 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}