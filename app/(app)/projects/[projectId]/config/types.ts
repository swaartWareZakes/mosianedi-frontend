// app/(app)/projects/[projectId]/config/types.ts

// High-level upload status that the UI understands
export type UploadStatus = "success" | "processing" | "failed" | "none";

// Shape of the “last upload” that we show in the status card
export interface LastUpload {
  id?: string;
  project_id: string;
  file_name: string | null;
  status: UploadStatus;
  row_count?: number | null;
  uploaded_at: string | null;

  // Extra metadata from backend
  validation_errors?: Record<string, any> | null;
  original_filename?: string | null;
}

// Response from /master-data/preview
export interface PreviewResponse {
  preview_data: Record<string, any>[]; // array of row objects
  total_rows: number;
  columns: string[];
}

// (For future “history” view – list of past uploads)
export interface UploadHistoryItem {
  id: string;
  project_id: string;
  user_id: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  status: string | null;
  row_count: number | null;
  validation_errors?: Record<string, any> | null;
  created_at: string | null;
}