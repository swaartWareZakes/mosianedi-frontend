// ./types/project.ts
export type NewProject = {
    project_name: string;
    description: string;
    start_year: number;
    forecast_duration: number;
    discount_rate: number;
    // user_id will be derived from the session on the backend
  };