import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;  // fetching supabase variables from project environment
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;  // same here

export const supabase = createClient(supabaseUrl, supabaseAnonKey);  // creates a new SupaBase client and exports it
