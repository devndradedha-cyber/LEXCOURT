import { handleUnsubscribe } from '../../server/reminderApi.js';
import { reminderDeps } from '../../server/env.js';

/** One-click unsubscribe (RFC 8058): mail apps POST here; the link in the email opens a page that POSTs. */
export function POST(request: Request): Promise<Response> {
  return handleUnsubscribe(request, reminderDeps());
}
