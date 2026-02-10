"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { TrendingUp, BarChart3, BrainCircuit } from "lucide-react";

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
      router.replace("/projects/recent");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--background)]">
      
      {/* LEFT: SAAS OVERVIEW (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90" />
         
         <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
                 <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                 </div>
                 <span className="font-bold text-lg tracking-tight">SA Roads Funding Gap Solutions</span>
             </div>
             
             <h1 className="text-5xl font-black leading-tight mb-6">
                 Bridge the gap between <span className="text-emerald-400">Engineering</span> & <span className="text-indigo-400">Treasury.</span>
             </h1>
             
             <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
                 The only specialized modeling platform designed to justify provincial road maintenance budgets using actuarial decay simulation.
             </p>
         </div>

         <div className="relative z-10 space-y-6">
             <FeatureItem 
                icon={<BarChart3 className="w-5 h-5 text-indigo-300"/>} 
                title="Scenario Modeling" 
                desc="Visualize the impact of budget cuts on VCI over 10 years." 
             />
             <FeatureItem 
                icon={<BrainCircuit className="w-5 h-5 text-indigo-300"/>} 
                title="AI Strategic Advisor" 
                desc="Generate Treasury-compliant motivation memorandums instantly." 
             />
         </div>

         <div className="relative z-10 text-xs text-indigo-300/60 font-mono">
             v2.4.0 • Secure Government Gateway
         </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
            
            <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-2">Please sign in to your accredited workspace.</p>
            </div>

            <div className="bg-[var(--surface-bg)] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
                    <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--input-text)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 outline-none transition-all"
                        placeholder="engineer@province.gov.za"
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Password</label>
                    <input
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--input-text)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 outline-none transition-all"
                        placeholder="••••••••"
                    />
                    </div>

                    {error && (
                    <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-xs font-medium border border-rose-100">
                        {error}
                    </div>
                    )}

                    <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {submitting ? "Authenticating..." : "Access Workspace"}
                    </button>
                </form>
            </div>

            <p className="text-center text-xs text-slate-400">
                Don't have an account? <button onClick={() => router.push("/register")} className="text-indigo-600 font-bold hover:underline">Request Access</button>
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
    )
}