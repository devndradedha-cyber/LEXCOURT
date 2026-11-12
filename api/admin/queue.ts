// GET /api/admin/queue — moderation queue and private comments (admin password required).
import { handleQueue } from '../../server/feedbackApi.js';
import { productionDeps } from '../../server/env.js';

export function GET(request: Request): Promise<Response> {
  return handleQueue(request, productionDeps());
}
