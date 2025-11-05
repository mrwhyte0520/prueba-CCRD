import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // For browser client, we need to use window location origin as fallback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[v0] Supabase credentials not found, using mock data")
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
