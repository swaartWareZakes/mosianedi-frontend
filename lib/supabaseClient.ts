// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return null;
  
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
  
    if (error) {
      console.error("Error fetching profile", error);
      return null;
    }
  
    return data;
  }