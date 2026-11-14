import { handleCreate } from '../../server/reminderApi.js';
import { reminderDeps } from '../../server/env.js';

export function POST(request: Request): Promise<Response> {
  return handleCreate(request, reminderDeps());
}
