// app/(app)/dashboard/types.ts

export type Project = {
  id: string;
  project_name: string;
  description?: string | null;
  start_year?: number | null;
  forecast_duration?: number | null;
};

export type Dashboard = {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  description?: string | null;
  isFavorite: boolean;
  layout?: any | null;
  overrides?: any | null;
  createdAt: string;
  updatedAt: string;
};