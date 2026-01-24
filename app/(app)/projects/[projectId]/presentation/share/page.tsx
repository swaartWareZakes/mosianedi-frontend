"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Share2, Copy, Check, ExternalLink, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function PresentationSharePage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId)
    ? params?.projectId[0]
    : (params?.projectId as string | undefined);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ SSR/Next-safe origin
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const publicUrl = useMemo(() => {
    return slug && origin ? `${origin}/p/${slug}` : "";
  }, [slug, origin]);

  // Optional: load existing slug if backend supports it (doesn't break if 404)
  const loadExisting = async () => {
    if (!projectId) return;
    setChecking(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      // ✅ Optional endpoint:
      // GET /api/v1/projects/:id/presentation/share -> { slug } (or 404 if none)
      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/presentation/share`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 404) {
        setSlug(null);
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to load existing share link");
      }

      const data = await res.json();
      if (data?.slug) setSlug(data.slug);
    } catch (e: any) {
      // keep non-fatal so page still works even if you haven't built GET
      setError(e?.message || "Failed to load existing link");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const generateLink = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      // ✅ Backend should create/update share slug
      // POST /api/v1/projects/:id/presentation/share -> { slug }
      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/presentation/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Later you can persist title/province/slides here (and have public endpoint return them)
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to generate link");
      }

      const data = await res.json();
      if (!data?.slug) throw new Error("Share link created but no slug returned");
      setSlug(data.slug);
    } catch (e: any) {
      setError(e?.message || "Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: select/copy would need an input; keep simple
      setError("Clipboard permission blocked. Please copy the link manually.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 rounded-3xl bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Share2 className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Public Share Link
                </h1>
                <p className="text-sm text-slate-500">
                  Generate a view-only link that anyone can open (no login).
                </p>
              </div>
            </div>

            <button
              onClick={loadExisting}
              disabled={checking || !projectId}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-semibold",
                (checking || !projectId) && "opacity-60"
              )}
              title="Re-check existing share link"
            >
              <RefreshCcw className={cn("w-4 h-4", checking && "animate-spin")} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col md:flex-row gap-3">
            <button
              onClick={generateLink}
              disabled={loading || !projectId}
              className={cn(
                "px-5 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2",
                (loading || !projectId) && "opacity-70"
              )}
            >
              <Share2 className="w-4 h-4" />
              {loading ? "Generating..." : slug ? "Regenerate Link" : "Generate Public Link"}
            </button>

            <button
              onClick={copyLink}
              disabled={!slug || !publicUrl}
              className="px-5 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </button>

            {slug && publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            )}
          </div>

          {slug && (
            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                View-only URL
              </div>
              <div className="text-xs text-slate-500 font-mono break-all p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {publicUrl}
              </div>
              <div className="text-[11px] text-slate-500">
                Anyone with this link can view the presentation. No login required.
              </div>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          <strong>Backend note:</strong> the public page expects{" "}
          <span className="font-mono">GET /api/v1/public/presentations/:slug</span>{" "}
          returning config (title/province/slides) and a resolvable{" "}
          <span className="font-mono">projectId</span>.
          <div className="mt-2 text-xs text-amber-700/80 dark:text-amber-300/80">
            Optional but recommended: also implement{" "}
            <span className="font-mono">GET /api/v1/projects/:id/presentation/share</span>{" "}
            to fetch existing slugs (this page already supports it).
          </div>
        </div>
      </div>
    </div>
  );
}