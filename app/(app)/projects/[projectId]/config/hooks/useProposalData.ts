"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import type { ProposalData, ProposalDataPatch } from "../types";

// ✅ FIXED: proposal-data lives under /projects/{projectId}/...
const ENDPOINT = (projectId: string) =>
  `${API_BASE_URL}/api/v1/projects/${projectId}/proposal-data`;

export function useProposalData(projectId: string) {
  const [data, setData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const fetchProposalData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getToken();
    if (!token) {
      setLoading(false);
      setError("Authorization required. Please log in.");
      return;
    }

    try {
      const res = await fetch(ENDPOINT(projectId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to load proposal data (${res.status})`);
      }

      const json = (await res.json()) as ProposalData;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load proposal data");
    } finally {
      setLoading(false);
    }
  }, [projectId, getToken]);

  const patchProposalData = useCallback(
    async (patch: ProposalDataPatch) => {
      setSaving(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setSaving(false);
        setError("Authorization required. Please log in.");
        return;
      }

      try {
        const res = await fetch(ENDPOINT(projectId), {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to save proposal data (${res.status})`);
        }

        const updated = (await res.json()) as ProposalData;
        setData(updated);
      } catch (e: any) {
        setError(e?.message ?? "Failed to save proposal data");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [projectId, getToken]
  );

  useEffect(() => {
    if (!projectId) return;
    fetchProposalData();
  }, [projectId, fetchProposalData]);

  return {
    data,
    loading,
    saving,
    error,
    refetch: fetchProposalData,
    patchProposalData,
  };
}