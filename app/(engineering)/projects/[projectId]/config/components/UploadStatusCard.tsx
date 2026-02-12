// app/(app)/projects/[projectId]/config/components/UploadStatusCard.tsx
"use client";

import React from "react";
import { CheckCircle, AlertTriangle, Clock, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LastUpload, UploadStatus } from "../types";

interface UploadStatusCardProps {
  // current / selected upload
  lastUpload: LastUpload | null;

  // loading + error for the "last upload" / status fetch
  statusLoading: boolean;
  statusError: string | null;

  // optional: full history of uploads for dropdown
  uploadsHistory?: LastUpload[];
  historyLoading?: boolean;
  historyError?: string | null;

  // which upload ID is selected in the dropdown
  selectedUploadId?: string | null;

  // preview state
  previewLoading: boolean;

  // handlers
  onPreview: (uploadId?: string) => void;
  onSelectUpload?: (uploadId: string) => void;
}

function statusColorFromStatus(status: UploadStatus | undefined): string {
  if (status === "success") return "bg-green-500";
  if (status === "processing") return "bg-amber-400";
  if (status === "failed") return "bg-red-500";
  return "bg-slate-300";
}

function statusLabelFromStatus(
  status: UploadStatus | undefined,
  statusLoading: boolean
): string {
  if (status === "success") return "Last upload OK";
  if (status === "processing") return "Upload processing";
  if (status === "failed") return "Last upload failed";
  if (statusLoading) return "Checking status…";
  return "No data uploaded yet";
}

function statusIconFromStatus(status: UploadStatus | undefined) {
  if (status === "success") return CheckCircle;
  if (status === "processing") return Clock;
  if (status === "failed") return AlertTriangle;
  return Clock;
}

function formatTimestamp(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const UploadStatusCard: React.FC<UploadStatusCardProps> = ({
  lastUpload,
  statusLoading,
  statusError,
  uploadsHistory,
  historyLoading,
  historyError,
  selectedUploadId,
  previewLoading,
  onPreview,
  onSelectUpload,
}) => {
  const status = lastUpload?.status;
  const StatusIcon = statusIconFromStatus(status);
  const statusColor = statusColorFromStatus(status);
  const statusLabel = statusLabelFromStatus(status, statusLoading);

  const hasHistoryDropdown =
    uploadsHistory && uploadsHistory.length > 1 && !!onSelectUpload;

  const effectiveSelectedId =
    selectedUploadId || lastUpload?.id || (uploadsHistory?.[0]?.id ?? "");

  const canPreview =
    !!lastUpload && lastUpload.status === "success" && !previewLoading;

  const handlePreviewClick = () => {
    if (!lastUpload?.id) return;
    onPreview(lastUpload.id);
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newId = e.target.value;
    if (onSelectUpload && newId) {
      onSelectUpload(newId);
    }
  };

  return (
    <div className="min-w-[260px]">
      <div className="rounded-xl border border-slate-200/40 dark:border-slate-800/60 px-3 py-2 text-xs bg-white/60 dark:bg-slate-900/40 shadow-sm">
        {/* Top row: status dot + label */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full shadow-sm",
                statusColor
              )}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {statusLabel}
            </span>
          </div>
          <StatusIcon className="h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* History dropdown (optional) */}
        {hasHistoryDropdown && (
          <div className="mt-2">
            <label className="block text-[10px] mb-1 text-slate-500 dark:text-slate-400">
              Upload history
            </label>
            <select
              className={cn(
                "w-full rounded-lg border border-slate-300 dark:border-slate-700",
                "bg-white/80 dark:bg-slate-900/60",
                "px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-400"
              )}
              value={effectiveSelectedId}
              onChange={handleSelectChange}
              disabled={!!historyLoading}
            >
              {uploadsHistory!.map((u) => (
                <option key={u.id} value={u.id ?? ""}>
                  {u.file_name || u.original_filename || "Untitled file"} •{" "}
                  {formatTimestamp(u.uploaded_at)} •{" "}
                  {typeof u.row_count === "number"
                    ? `${u.row_count} rows`
                    : "rows ?"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-1 space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
          {/* Error messages */}
          {statusError && (
            <div className="text-red-500 text-[10px]">{statusError}</div>
          )}
          {historyError && (
            <div className="text-red-500 text-[10px]">{historyError}</div>
          )}

          {/* Last upload details */}
          {lastUpload ? (
            <>
              <div className="truncate">
                File:{" "}
                <span className="font-medium">
                  {lastUpload.file_name ||
                    lastUpload.original_filename ||
                    "—"}
                </span>
              </div>
              <div>
                When:{" "}
                <span className="font-medium">
                  {formatTimestamp(lastUpload.uploaded_at)}
                </span>
              </div>
              {typeof lastUpload.row_count === "number" && (
                <div>Rows: {lastUpload.row_count}</div>
              )}

              {/* Validation errors summary (if failed) */}
              {lastUpload.status === "failed" &&
                lastUpload.validation_errors && (
                  <div className="mt-1 text-[10px] text-red-500">
                    Validation errors detected. Check missing columns or file
                    format.
                  </div>
                )}
            </>
          ) : !statusError && !statusLoading ? (
            <div>No uploads yet for this project.</div>
          ) : null}
        </div>

        {/* View data button */}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled={!canPreview}
            onClick={handlePreviewClick}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium border",
              "border-slate-300 dark:border-slate-700",
              "text-slate-700 dark:text-slate-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Table className="h-3 w-3" />
            {previewLoading ? "Loading…" : "View data"}
          </button>
        </div>
      </div>
    </div>
  );
};