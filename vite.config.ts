import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-check-embed-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const rawUrl = req.url || '';
            const urlPath = rawUrl.split('?')[0];

            // Safely neutralize any stale browser requests for vite-plugin-pwa dev endpoints
            if (rawUrl.includes('@vite-plugin-pwa') || rawUrl.includes('dev-sw')) {
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
              res.setHeader('Cache-Control', 'no-store');
              res.end('export default {}; export const registerDevSW = () => {};');
              return;
            }

            if (urlPath !== '/api/check-embed') {
              return next();
            }
            const TARGET_URL = 'https://officialmoviebox.com/';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            let embeddable = true;
            let reason = 'El sitio remoto parece permitir la incrustación.';

            try {
              const response = await fetch(TARGET_URL, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
              });
              clearTimeout(timeoutId);

              if (!response.ok) {
                embeddable = false;
                reason = `El servidor remoto respondió con estado HTTP no exitoso: ${response.status} ${response.statusText}`;
              } else {
                const xfo = response.headers.get('x-frame-options');
                if (xfo) {
                  const upper = xfo.toUpperCase();
                  if (upper.includes('DENY') || upper.includes('SAMEORIGIN')) {
                    embeddable = false;
                    reason = `El sitio bloquea la incrustación mediante cabecera X-Frame-Options: ${xfo}`;
                  }
                }
                const csp = response.headers.get('content-security-policy');
                if (csp) {
                  const match = csp.match(/frame-ancestors\s+([^;]+)/i);
                  if (match && !match[1].trim().split(/\s+/).includes('*')) {
                    embeddable = false;
                    reason = `El sitio restringe la incrustación mediante CSP frame-ancestors: ${match[1].trim()}`;
                  }
                }
              }
            } catch (err: any) {
              clearTimeout(timeoutId);
              embeddable = false;
              reason =
                err?.name === 'AbortError'
                  ? 'Tiempo de espera agotado (timeout 6 s) al contactar al servidor remoto.'
                  : `Error de red o conexión: ${err?.message || 'Fallo de conexión'}`;
            }

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=600');
            res.end(JSON.stringify({ embeddable, reason }));
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
