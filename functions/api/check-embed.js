/**
 * Cloudflare Pages Function
 * Ruta: GET /api/check-embed
 * 
 * Evalúa si la URL fija objetivo permite incrustación en marcos (iframe).
 * No acepta parámetros ni URLs del cliente para evitar riesgos de SSRF.
 */

const TARGET_URL = 'https://officialmoviebox.com/';

export async function onRequestGet(context) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let embeddable = true;
  let reason = 'El sitio remoto permite la incrustación.';

  try {
    const response = await fetch(TARGET_URL, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    // 1. Comprobar si el estado es 2xx
    if (!response.ok) {
      embeddable = false;
      reason = `El servidor remoto respondió con estado HTTP no exitoso: ${response.status} ${response.statusText}`;
    } else {
      // 2. Comprobar cabecera X-Frame-Options
      const xfo = response.headers.get('x-frame-options');
      if (xfo) {
        const xfoUpper = xfo.toUpperCase();
        if (xfoUpper.includes('DENY') || xfoUpper.includes('SAMEORIGIN')) {
          embeddable = false;
          reason = `El sitio bloquea la incrustación mediante cabecera X-Frame-Options: ${xfo}`;
        }
      }

      // 3. Comprobar directiva frame-ancestors en Content-Security-Policy
      const csp = response.headers.get('content-security-policy');
      if (csp) {
        const match = csp.match(/frame-ancestors\s+([^;]+)/i);
        if (match) {
          const frameAncestorsValue = match[1].trim();
          const tokens = frameAncestorsValue.split(/\s+/);
          // Si no incluye '*', no permite incrustación libre
          if (!tokens.includes('*')) {
            embeddable = false;
            reason = `El sitio restringe la incrustación mediante CSP frame-ancestors: ${frameAncestorsValue}`;
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    embeddable = false;
    if (error.name === 'AbortError') {
      reason = 'Tiempo de espera agotado (timeout 8 s) al intentar contactar al servidor remoto.';
    } else {
      reason = `Error de red o conexión al servidor remoto: ${error.message}`;
    }
  }

  return new Response(JSON.stringify({
    embeddable,
    reason,
    target: TARGET_URL,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
