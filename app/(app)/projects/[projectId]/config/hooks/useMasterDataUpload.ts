// app/(app)/projects/[projectId]/config/hooks/useMasterDataUpload.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LastUpload, PreviewResponse, UploadStatus } from "../types";

// const API_BASE = "http://127.0.0.1:8000";
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

/**
 * Map whatever the API gives us to our UI status.
 * Handles things like "validated", "ready", "failed", etc.
 */
function mapApiStatusToUiStatus(
  rawStatus: string | null | undefined,
  rowCount?: number | null
): UploadStatus {
  const s = rawStatus?.toLowerCase();

  if (s === "success" || s === "validated" || s === "ready") {
    return "success";
  }

  if (s === "processing" || s === "uploading" || s === "pending") {
    return "processing";
  }

  if (
    s === "failed" ||
    s === "validation_failed" ||
    s === "error" ||
    s === "invalid"
  ) {
    return "failed";
  }

  // Fallback: if we clearly have rows, treat as success
  if (typeof rowCount === "number" && rowCount > 0) {
    return "success";
  }

  return "none";
}

export function useMasterDataUpload(projectId: string) {
  // -------------------------------------------------------------
  // File + upload state
  // -------------------------------------------------------------
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "ready"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Last-upload + history
  // -------------------------------------------------------------
  const [lastUpload, setLastUpload] = useState<LastUpload | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [uploadsHistory, setUploadsHistory] = useState<LastUpload[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Which upload is currently selected in the dropdown
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Preview
  // -------------------------------------------------------------
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const isUploading = status === "uploading" || status === "processing";
  const isReady = status === "ready";

  // -------------------------------------------------------------
  // Auth helper
  // -------------------------------------------------------------
  const getAuthToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // -------------------------------------------------------------
  // Preview fetcher (by upload ID)
  // -------------------------------------------------------------
  const fetchPreview = useCallback(
    async (token: string, uploadId?: string) => {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreview(null);

      try {
        const targetUploadId =
          uploadId ||
          selectedUploadId ||
          (lastUpload && lastUpload.id) ||
          undefined;

        if (!targetUploadId) {
          setPreviewError("No upload selected for preview.");
          return;
        }

        const res = await fetch(
          `${API_BASE}/api/v1/projects/${projectId}/master-data/uploads/${targetUploadId}/preview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 404) {
          setPreviewError(
            "File preview could not be generated (maybe archived or removed)."
          );
          return;
        }

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.detail || `Preview failed: ${res.status}`);
        }

        const data: PreviewResponse = await res.json();
        setPreview(data);
      } catch (err: any) {
        console.error("Preview failed:", err);
        setPreviewError(err.message || "Could not load preview.");
      } finally {
        setPreviewLoading(false);
      }
    },
    [projectId, selectedUploadId, lastUpload]
  );

  // -------------------------------------------------------------
  // Fetch ALL uploads (history)
  // -------------------------------------------------------------
  const fetchUploadsHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setHistoryError("Please log in to see upload history.");
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/master-data/uploads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 404) {
        // No uploads yet
        setUploadsHistory([]);
        setLastUpload(null);
        setSelectedUploadId(null);
        return;
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || `History error: ${res.status}`);
      }

      const data = (await res.json()) as any[];

      const mapped: LastUpload[] = data.map((item) => {
        const uiStatus = mapApiStatusToUiStatus(
          item.status,
          item.row_count
        );

        return {
          id: item.id,
          project_id: item.project_id,
          file_name: item.file_name ?? item.original_filename ?? null,
          status: uiStatus,
          row_count:
            typeof item.row_count === "number" ? item.row_count : null,
          uploaded_at: item.uploaded_at ?? item.created_at ?? null,
          validation_errors: item.validation_errors || null,
          original_filename: item.original_filename || null,
        } as LastUpload;
      });

      setUploadsHistory(mapped);

      // Default selection: most recent upload
      if (mapped.length > 0) {
        const mostRecent = mapped[0];
        setLastUpload(mostRecent);
        setSelectedUploadId(mostRecent.id ?? null);
      } else {
        setLastUpload(null);
        setSelectedUploadId(null);
      }
    } catch (err: any) {
      console.error("fetchUploadsHistory failed:", err);
      setHistoryError(err.message || "Could not load upload history.");
      setUploadsHistory([]);
      setLastUpload(null);
      setSelectedUploadId(null);
    } finally {
      setHistoryLoading(false);
    }
  }, [projectId]);

  // -------------------------------------------------------------
  // Initial load
  // -------------------------------------------------------------
  useEffect(() => {
    fetchUploadsHistory();
    setFile(null);
    setPreview(null);
  }, [fetchUploadsHistory]);

  // -------------------------------------------------------------
  // File change + upload
  // -------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setError(null);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setStatus("uploading");

    try {
      const token = await getAuthToken();
      if (!token) {
        setStatus("idle");
        setError("You need to be logged in to upload data.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `${API_BASE}/api/v1/projects/${projectId}/master-data/upload`;

      setStatus("processing");

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type; browser does it for FormData
        },
        body: formData,
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        const detail =
          (payload && (payload.detail || payload.message)) ||
          `Upload failed with status ${res.status}`;
        throw new Error(detail);
      }

      if (payload.status === "failed") {
        setStatus("idle");
        throw new Error(
          `Validation Failed: Missing required columns: ${
            payload.validation_errors?.missing_columns?.join(", ") ||
            "See status card."
          }`
        );
      }

      setStatus("ready");
      setFile(null);

      // Refresh history & lastUpload after a successful upload
      await fetchUploadsHistory();
    } catch (e: any) {
      console.error("Upload failed", e);
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again."
      );
      setStatus("idle");
    }
  };

  // -------------------------------------------------------------
  // Handlers for preview + selecting uploads in dropdown
  // -------------------------------------------------------------
  const handlePreview = async (uploadId?: string) => {
    setPreviewError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setPreviewError("You need to be logged in to view data.");
        return;
      }

      await fetchPreview(token, uploadId);
    } catch (e: any) {
      console.error("handlePreview error:", e);
      setPreviewError(
        e instanceof Error ? e.message : "Could not load preview."
      );
    }
  };

  const handleSelectUpload = (uploadId: string) => {
    setSelectedUploadId(uploadId);

    const selected = uploadsHistory.find((u) => u.id === uploadId);
    if (selected) {
      setLastUpload(selected);
    }

    // Optionally, auto-refresh preview when selection changes:
    // getAuthToken().then(token => token && fetchPreview(token, uploadId));
  };

  // -------------------------------------------------------------
  // Public API of the hook
  // -------------------------------------------------------------
  return {
    // file + upload flow
    file,
    status,
    error,
    isUploading,
    isReady,

    // last upload + history
    lastUpload,
    statusLoading,
    statusError,
    uploadsHistory,
    historyLoading,
    historyError,
    selectedUploadId,

    // preview
    preview,
    previewLoading,
    previewError,

    // handlers
    handleFileChange,
    handleUpload,
    handlePreview,
    handleSelectUpload,

    // utilities
    refreshHistory: fetchUploadsHistory,
  };
}