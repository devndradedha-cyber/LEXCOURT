// POST /api/feedback — submit a rating (and optional comment). See server/feedbackApi.ts.
import { handleSubmit } from '../server/feedbackApi.js';
import { productionDeps } from '../server/env.js';

export function POST(request: Request): Promise<Response> {
  return handleSubmit(request, productionDeps());
}
