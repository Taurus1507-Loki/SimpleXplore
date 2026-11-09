/** True when real Supabase credentials (not placeholders) are configured. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder') || url.includes('example.supabase.co') || url.includes('your-supabase-project')) return false;
  if (key.includes('dummy') || key.includes('your-')) return false;
  return true;
}
