import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleModerate, handleQueue, handleStats, handleSubmit, type Deps } from './server/feedbackApi.js';
import { MemoryStore } from './server/store.js';
import { MemoryMailer } from './server/mailer.js';
import { MemoryReminderStore } from './server/reminderStore.js';
import { handleConfirm, handleCreate, handleCron, handleReminderStats, handleUnsubscribe, type ReminderDeps } from './server/reminderApi.js';

/**
 * Content-Security-Policy for the production build. It makes the browser refuse
 * to load scripts or send data anywhere except LexCourt's own origin, which
 * backs up the privacy promise: notices, photos and OCR stay on the device.
 * (Links the user taps, like legal-aid sites, are normal navigation and still work.)
 * Not applied in dev, where Vite needs inline scripts and websockets.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "worker-src 'self' blob:",
  "connect-src 'self' blob: data:",
  "img-src 'self' blob: data:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'lexcourt-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
    },
  };
}

/**
 * Local development only: serve /api/* with in-memory feedback and reminder
 * stores, so they can be tried without Supabase or Resend. Never part
 * of the production build (Vercel runs the functions in /api instead).
 * Admin password: ADMIN_PASSWORD, or "local-dev-password" by default.
 */
function devApiPlugin(): Plugin {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'local-dev-password';
  const deps: Deps = { store: new MemoryStore(), adminPassword, authDelayMs: 200 };
  // Email reminders: kept in memory, and emails go to an outbox you can read at
  // /api/dev/outbox instead of being sent. Daily job: GET /api/cron/reminders
  // with "Authorization: Bearer local-cron-secret".
  const mailer = new MemoryMailer();
  const rdeps: ReminderDeps = {
    store: new MemoryReminderStore(),
    mailer,
    secret: 'local-dev-reminder-secret-not-for-production',
    appUrl: null,
    cronSecret: 'local-cron-secret',
    adminPassword,
    authDelayMs: 200,
  };
  const r = (h: (req: Request, d: ReminderDeps) => Promise<Response>) => (req: Request) => h(req, rdeps);
  const f = (h: (req: Request, d: Deps) => Promise<Response>) => (req: Request) => h(req, deps);
  const routes: Record<string, (r: Request) => Promise<Response>> = {
    '/api/feedback': f(handleSubmit),
    '/api/admin/stats': f(handleStats),
    '/api/admin/queue': f(handleQueue),
    '/api/admin/moderate': f(handleModerate),
    '/api/reminders': r(handleCreate),
    '/api/reminders/confirm': r(handleConfirm),
    '/api/reminders/unsubscribe': r(handleUnsubscribe),
    '/api/cron/reminders': r(handleCron),
    '/api/admin/reminders': r(handleReminderStats),
    '/api/dev/outbox': async () => new Response(JSON.stringify(mailer.outbox), { headers: { 'Content-Type': 'application/json' } }),
  };
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = (req.url ?? '').split('?')[0];
    const handler = routes[path];
    if (!handler) return next();
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: ['GET', 'HEAD'].includes(req.method ?? 'GET') ? undefined : Buffer.concat(chunks),
    });
    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(Buffer.from(await response.arrayBuffer()));
  };
  return {
    name: 'lexcourt-dev-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), cspPlugin(), devApiPlugin()],
  build: {
    rollupOptions: {
      // Two entry pages with the same app: / (English) and /es/ (Spanish), so
      // search engines and the home-screen icon get a description in each language.
      input: { main: 'index.html', es: 'es/index.html' },
    },
  },
  test: {
    environment: 'node',
  },
} as never);
