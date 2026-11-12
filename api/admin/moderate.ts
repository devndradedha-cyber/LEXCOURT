// POST /api/admin/moderate — approve or reject a comment (admin password required).
import { handleModerate } from '../../server/feedbackApi.js';
import { productionDeps } from '../../server/env.js';

export function POST(request: Request): Promise<Response> {
  return handleModerate(request, productionDeps());
}
