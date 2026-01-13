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

// --- NEW: Scenario & Parameters Types ---

export type BudgetStrategy = "unconstrained" | "fixed_limit" | "percent_baseline";
export type PolicyBias = "preventive" | "balanced" | "reactive";

export interface RonetParameters {
  analysis_duration: number; // 5-30
  budget_strategy: BudgetStrategy;
  annual_budget_cap: number | null;
  budget_percent_baseline: number; // 50-150
  policy_bias: PolicyBias;
  discount_rate: number;
}

export interface Scenario {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  is_baseline: boolean;
  parameters: RonetParameters;
  created_at: string;
  updated_at: string;
}


export interface YearlyResult {
  year: number;
  avg_condition_index: number;
  pct_good: number;
  pct_fair: number;
  pct_poor: number;
  total_maintenance_cost: number;
  asset_value: number;
}

export interface SimulationOutput {
  project_id: string;
  scenario_id: string;
  year_count: number;
  yearly_data: YearlyResult[];
  total_cost_npv: number;
  final_network_condition: number;
}

export type ProposalData = {
  id: string;
  project_id: string;
  user_id: string;
  data_source: string;

  paved_arid: number;
  paved_semi_arid: number;
  paved_dry_sub_humid: number;
  paved_moist_sub_humid: number;
  paved_humid: number;

  gravel_arid: number;
  gravel_semi_arid: number;
  gravel_dry_sub_humid: number;
  gravel_moist_sub_humid: number;
  gravel_humid: number;

  avg_vci_used: number;
  vehicle_km: number;
  pct_vehicle_km_used: number;
  fuel_sales: number;
  pct_fuel_sales_used: number;
  fuel_option_selected: number;
  target_vci: number;

  extra_inputs: Record<string, any>;

  created_at: string;
  updated_at: string;
};

export type ProposalDataPatch = Partial<
  Pick<
    ProposalData,
    | "paved_arid"
    | "paved_semi_arid"
    | "paved_dry_sub_humid"
    | "paved_moist_sub_humid"
    | "paved_humid"
    | "gravel_arid"
    | "gravel_semi_arid"
    | "gravel_dry_sub_humid"
    | "gravel_moist_sub_humid"
    | "gravel_humid"
    | "avg_vci_used"
    | "vehicle_km"
    | "pct_vehicle_km_used"
    | "fuel_sales"
    | "pct_fuel_sales_used"
    | "fuel_option_selected"
    | "target_vci"
    | "extra_inputs"
  >
>;