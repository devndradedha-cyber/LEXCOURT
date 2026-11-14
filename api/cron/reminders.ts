import { handleCron } from '../../server/reminderApi.js';
import { reminderDeps } from '../../server/env.js';

/** Runs once a day (see "crons" in vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET". */
export function GET(request: Request): Promise<Response> {
  return handleCron(request, reminderDeps());
}
