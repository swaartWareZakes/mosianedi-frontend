// lib/config.ts

// 1. Get the base URL from environment or default to localhost
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// 2. Helper to ensure no trailing slash problems
// This prevents errors like "https://api.com//api/v1"
export const API_BASE_URL = BASE_URL.endsWith("/") 
  ? BASE_URL.slice(0, -1) 
  : BASE_URL;