// GET /api/admin/stats — average rating and counts per feature (admin password required).
import { handleStats } from '../../server/feedbackApi.js';
import { productionDeps } from '../../server/env.js';

export function GET(request: Request): Promise<Response> {
  return handleStats(request, productionDeps());
}
