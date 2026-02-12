// app/(app)/projects/[projectId]/config/components/DataPreviewTable.tsx
"use client";

import React from "react";
import { Table as TableIcon } from "lucide-react";
import type { PreviewResponse } from "../types";

type DataPreviewTableProps = {
  preview: PreviewResponse;
};

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  preview,
}) => {
  const { preview_data, total_rows, columns } = preview;
  const shownCount = preview_data.length;

  return (
    <div className="mt-6 text-xs">
      {/* Header row */}
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold flex items-center gap-2">
          <TableIcon className="h-3.5 w-3.5" />
          <span>Master data preview</span>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-medium">
            {shownCount.toLocaleString("en-ZA")}
          </span>{" "}
          of{" "}
          <span className="font-medium">
            {total_rows.toLocaleString("en-ZA")}
          </span>{" "}
          rows
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-64 border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 text-left font-semibold whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview_data.map((row, i) => (
              <tr
                key={i}
                className={
                  i % 2 === 0
                    ? ""
                    : "bg-slate-50/60 dark:bg-slate-900/30"
                }
              >
                {columns.map((col) => {
                  const value = (row as Record<string, any>)[col];
                  const display =
                    value === null || value === undefined || value === ""
                      ? "—"
                      : String(value);

                  return (
                    <td
                      key={col}
                      className="px-2 py-1 whitespace-nowrap max-w-[160px] truncate"
                      title={display === "—" ? "" : display}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}

            {preview_data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-2 py-3 text-center text-[11px] text-slate-500"
                >
                  No rows available in preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};