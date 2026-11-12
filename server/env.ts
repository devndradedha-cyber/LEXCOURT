/**
 * Server configuration from environment variables (set in Vercel → Project →
 * Settings → Environment Variables). Never sent to the browser.
 *
 *   SUPABASE_URL               https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  service-role key (server only; bypasses row-level security)
 *   ADMIN_PASSWORD             at least 12 characters; protects the admin dashboard
 */
import { SupabaseStore, type FeedbackStore } from './store.js';
import type { Deps } from './feedbackApi.js';

let cached: FeedbackStore | null | undefined;

export function productionDeps(): Deps {
  if (cached === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    cached = url && key ? new SupabaseStore(url, key) : null;
  }
  return { store: cached, adminPassword: process.env.ADMIN_PASSWORD ?? null };
}
