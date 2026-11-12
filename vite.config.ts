import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleModerate, handleQueue, handleStats, handleSubmit, type Deps } from './server/feedbackApi.js';
import { MemoryStore } from './server/store.js';

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
 * Local development only: serve /api/* with an in-memory feedback store, so the
 * feedback prompt and admin dashboard can be tried without Supabase. Never part
 * of the production build (Vercel runs the functions in /api instead).
 * Admin password: ADMIN_PASSWORD, or "local-dev-password" by default.
 */
function devApiPlugin(): Plugin {
  const deps: Deps = { store: new MemoryStore(), adminPassword: process.env.ADMIN_PASSWORD ?? 'local-dev-password', authDelayMs: 200 };
  const routes: Record<string, (r: Request, d: Deps) => Promise<Response>> = {
    '/api/feedback': handleSubmit,
    '/api/admin/stats': handleStats,
    '/api/admin/queue': handleQueue,
    '/api/admin/moderate': handleModerate,
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
    const response = await handler(request, deps);
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
