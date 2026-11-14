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

/*
 * Email reminders (all optional; without them, "Email reminders" says it is unavailable):
 *
 *   RESEND_API_KEY    Resend API key (free tier: 3,000 emails/month, 100/day)
 *   REMINDER_FROM     sender, e.g. "LexCourt <reminders@your-domain.org>" (domain verified in Resend)
 *   REMINDER_SECRET   random string, at least 32 characters; signs the links in emails
 *   CRON_SECRET       random string, at least 16 characters; Vercel sends it to the daily job
 *   APP_URL           public address, e.g. https://lexcourt.example.org (defaults to the Vercel production URL)
 */
import { ResendMailer, type Mailer } from './mailer.js';
import { SupabaseReminderStore, type ReminderStore } from './reminderStore.js';
import type { ReminderDeps } from './reminderApi.js';

let reminderStore: ReminderStore | null | undefined;
let mailer: Mailer | null | undefined;

export function reminderDeps(): ReminderDeps {
  if (reminderStore === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    reminderStore = url && key ? new SupabaseReminderStore(url, key) : null;
  }
  if (mailer === undefined) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.REMINDER_FROM;
    mailer = key && from ? new ResendMailer(key, from) : null;
  }
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return {
    store: reminderStore,
    mailer,
    secret: process.env.REMINDER_SECRET ?? null,
    appUrl: process.env.APP_URL ?? (prod ? `https://${prod}` : null),
    cronSecret: process.env.CRON_SECRET ?? null,
    adminPassword: process.env.ADMIN_PASSWORD ?? null,
  };
}
