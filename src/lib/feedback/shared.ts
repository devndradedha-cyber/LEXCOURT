/**
 * Feedback data shared by the app and the server: what a submission looks
 * like, and how it is checked. Pure functions, no I/O.
 */
import { findSensitive, type FeedbackLang } from './moderation.js';

export const FEEDBACK_FEATURES = ['notice_reader', 'rep_check'] as const;
export type FeedbackFeature = (typeof FEEDBACK_FEATURES)[number];

export const FEEDBACK_LANGS: FeedbackLang[] = ['en', 'es', 'hi', 'pa', 'ur'];
export const MAX_COMMENT = 1000;

/** What the app sends. Nothing else is accepted. */
export interface FeedbackSubmission {
  feature: FeedbackFeature;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  lang: FeedbackLang;
  publicConsent: boolean;
}

/**
 * Status of a stored item:
 *  private  — admin review only (no consent, no comment, or not publishable)
 *  pending  — the person allowed sharing; waiting for an admin
 *  approved — an admin approved the public text (not shown anywhere yet)
 *  rejected — an admin decided not to publish it
 */
export type FeedbackStatus = 'private' | 'pending' | 'approved' | 'rejected';

export interface FeedbackRecord {
  id: string;
  created_at: string;
  feature: FeedbackFeature;
  rating: number;
  comment: string | null;
  lang: FeedbackLang;
  public_consent: boolean;
  status: FeedbackStatus;
  public_text: string | null;
  flags: string[];
  reviewed_at: string | null;
}

export type ValidationResult = { ok: true; value: FeedbackSubmission } | { ok: false; error: string };

export function validateSubmission(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid_body' };
  const b = body as Record<string, unknown>;
  const allowed = new Set(['feature', 'rating', 'comment', 'lang', 'publicConsent', 'website']);
  if (Object.keys(b).some((k) => !allowed.has(k))) return { ok: false, error: 'unexpected_field' };
  // Hidden field that people never see; bots fill it in.
  if (typeof b.website === 'string' && b.website.trim()) return { ok: false, error: 'rejected' };
  if (!FEEDBACK_FEATURES.includes(b.feature as FeedbackFeature)) return { ok: false, error: 'invalid_feature' };
  if (!Number.isInteger(b.rating) || (b.rating as number) < 1 || (b.rating as number) > 5) return { ok: false, error: 'invalid_rating' };
  if (!FEEDBACK_LANGS.includes(b.lang as FeedbackLang)) return { ok: false, error: 'invalid_lang' };
  const comment = typeof b.comment === 'string' ? b.comment.trim() : '';
  if (b.comment !== undefined && typeof b.comment !== 'string') return { ok: false, error: 'invalid_comment' };
  if (comment.length > MAX_COMMENT) return { ok: false, error: 'comment_too_long' };
  if (typeof b.publicConsent !== 'boolean') return { ok: false, error: 'invalid_consent' };
  return {
    ok: true,
    value: {
      feature: b.feature as FeedbackFeature,
      rating: b.rating as FeedbackSubmission['rating'],
      comment,
      lang: b.lang as FeedbackLang,
      publicConsent: b.publicConsent,
    },
  };
}

/** Sensitive details found in a comment (the app asks the person to remove them). */
export function sensitiveIn(comment: string) {
  return findSensitive(comment);
}
