import { handleReminderStats } from '../../server/reminderApi.js';
import { reminderDeps } from '../../server/env.js';

export function GET(request: Request): Promise<Response> {
  return handleReminderStats(request, reminderDeps());
}
