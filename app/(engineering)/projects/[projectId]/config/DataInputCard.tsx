/* --- app/(app)/projects/[projectId]/config/DataInputCard.tsx --- */
"use client";

import React from "react";
import { Upload, CheckCircle, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMasterDataUpload } from "./hooks/useMasterDataUpload";
import { UploadStatusCard } from "./components/UploadStatusCard";
import { DataPreviewTable } from "./components/DataPreviewTable";

export function DataInputCard({ projectId }: { projectId: string }) {
  const {
    // state
    file,
    status,
    error,
    lastUpload,
    statusLoading,
    statusError,
    uploadsHistory,
    historyLoading,
    historyError,
    selectedUploadId,
    preview,
    previewLoading,
    previewError,
    isUploading,
    isReady,
    // handlers
    handleFileChange,
    handleUpload,
    handlePreview,
    handleSelectUpload,
  } = useMasterDataUpload(projectId);

  // --- Render -----------------------------------------------------
  return (
    <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Database className="h-5 w-5 text-[var(--accent-color)]" />
            1. Master Data Input
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload the road inventory/condition data (Excel/CSV) to set the
            baseline for this project ({projectId}).
          </p>
        </div>

        <UploadStatusCard
          lastUpload={lastUpload}
          statusLoading={statusLoading}
          statusError={statusError}
          uploadsHistory={uploadsHistory}
          historyLoading={historyLoading}
          historyError={historyError}
          selectedUploadId={selectedUploadId}
          previewLoading={previewLoading}
          onPreview={handlePreview}
          onSelectUpload={handleSelectUpload}
        />
      </div>

      {/* Upload area */}
      <div
        className={cn(
          "p-6 border-2 border-dashed rounded-xl transition-colors",
          isReady
            ? "border-green-400 dark:border-green-600"
            : "border-slate-300 dark:border-slate-700"
        )}
      >
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${projectId}`}
          disabled={isUploading}
        />

        <label
          htmlFor={`file-upload-${projectId}`}
          className={cn(
            "block p-4 text-center rounded-lg cursor-pointer transition-colors",
            isReady
              ? "bg-green-50 dark:bg-green-900/20"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-slate-500" />
          {file ? (
            <span className="font-medium text-[var(--foreground)]">
              {file.name}
            </span>
          ) : (
            <span className="text-slate-500">
              Click to select file or drag here
            </span>
          )}
        </label>

        {/* General upload error */}
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="mt-4 flex justify-between items-center gap-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Later we’ll add <span className="font-semibold">manual edits</span>{" "}
            on top of this uploaded baseline (hybrid mode).
          </p>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
              isReady
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[var(--accent-color)] hover:brightness-110",
              "disabled:cursor-not-allowed disabled:opacity-70"
            )}
          >
            {isReady ? (
              <>
                <CheckCircle className="h-4 w-4" /> Data Ready
              </>
            ) : isUploading ? (
              "Processing data..."
            ) : (
              <>
                <Upload className="h-4 w-4" /> Upload &amp; Validate
              </>
            )}
          </button>
        </div>

        {/* Preview error */}
        {previewError && (
          <p className="text-xs text-red-500 mt-3">{previewError}</p>
        )}

        {/* Inline preview */}
        {preview && (
          <div className="mt-6">
            <DataPreviewTable preview={preview} />
          </div>
        )}
      </div>
    </div>
  );
}