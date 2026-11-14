import { handleConfirm } from '../../server/reminderApi.js';
import { reminderDeps } from '../../server/env.js';

export function POST(request: Request): Promise<Response> {
  return handleConfirm(request, reminderDeps());
}
