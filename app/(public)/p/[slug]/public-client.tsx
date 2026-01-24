"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

type PublicBundle = {
  title: string;
  province: string;
  slides: {
    context?: boolean;
    decay?: boolean;
    finance?: boolean;
    corridors?: boolean;
    implementation?: boolean;
    end?: boolean;
  };
  projectId: string;
};

export default function PublicPresentationClient() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : (params?.slug as string);

  const [bundle, setBundle] = useState<PublicBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/public/presentations/${slug}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Unable to load presentation");
        }
        const data = await res.json();
        setBundle(data);
      } catch (e: any) {
        setError(e?.message || "Unable to load presentation");
      }
    }
    if (slug) load();
  }, [slug]);

  const redirectUrl = useMemo(() => {
    if (!bundle) return "";
    const query = new URLSearchParams({
      title: bundle.title,
      province: bundle.province,
      slides: JSON.stringify(bundle.slides || {}),
      public: "1",
    }).toString();

    return `/projects/${bundle.projectId}/presentation/live?${query}`;
  }, [bundle]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="max-w-lg p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <AlertTriangle className="w-5 h-5" />
            Public link unavailable
          </div>
          <div className="mt-3 text-sm text-white/70 whitespace-pre-wrap">{error}</div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (typeof window !== "undefined") {
    window.location.replace(redirectUrl);
  }

  return null;
}