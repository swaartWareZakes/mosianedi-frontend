// app/(app)/projects/[projectId]/config/types.ts

// --- Upload / Master Data Types (Legacy/Support) ---

export type UploadStatus = "success" | "processing" | "failed" | "none";

export interface LastUpload {
  id?: string;
  project_id: string;
  file_name: string | null;
  status: UploadStatus;
  row_count?: number | null;
  uploaded_at: string | null;
  validation_errors?: Record<string, any> | null;
  original_filename?: string | null;
}

export interface PreviewResponse {
  preview_data: Record<string, any>[];
  total_rows: number;
  columns: string[];
}

// --- NEW: Forecast & Strategy Types ---

export interface ForecastParameters {
  id: string;
  project_id: string;

  // Section A: Economic Reality
  cpi_percentage: number;       // Default 6.0
  discount_rate: number;        // Default 8.0
  previous_allocation: number;  // Default 0

  // Section B: Engineering Reality
  paved_deterioration_rate: "Slow" | "Medium" | "Fast";
  gravel_loss_rate: number;     // mm per year (Default 20)
  climate_stress_factor: "Low" | "Medium" | "High";

  // Section C: Time
  analysis_duration: number;    // Years (3 to 20)

  updated_at: string;
}

// Helper for partial updates (PATCH)
export type ForecastPatch = Partial<ForecastParameters>;

// --- Simulation Results ---

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
  year_count: number;
  
  // Time Series Data (for charts)
  yearly_data: YearlyResult[];
  
  // Aggregates (for summary cards)
  total_cost_npv: number;
  final_network_condition: number;
  
  generated_at?: string;
}

// --- Proposal Inputs (Green Blocks) ---

export type ProposalData = {
  id: string;
  project_id: string;
  user_id: string;
  data_source: string;

  // Paved Climate Zones
  paved_arid: number;
  paved_semi_arid: number;
  paved_dry_sub_humid: number;
  paved_moist_sub_humid: number;
  paved_humid: number;

  // Gravel Climate Zones
  gravel_arid: number;
  gravel_semi_arid: number;
  gravel_dry_sub_humid: number;
  gravel_moist_sub_humid: number;
  gravel_humid: number;

  // Indicators
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