/**
 * StreamShield App - Lógica del Cliente PWA y Control del Sandbox
 * Entorno de reproducción 100% aislado: sin enlaces externos ni salidas del sandbox.
 */

const TARGET_STREAM_URL = "https://officialmoviebox.com/";
const SECURE_BLOCKED_MESSAGE = "Este contenido no está disponible en modo seguro. Por tu protección, StreamShield no abre sitios fuera del entorno aislado.";

let deferredPrompt = null;
let loadTimer = null;
let isLoaded = false;
let embedCheckResult = null;

// Elementos del DOM
const overlay = document.getElementById('shieldOverlay');
const initialCard = document.getElementById('initialCard');
const loadingCard = document.getElementById('loadingCard');
const errorCard = document.getElementById('errorCard');
const errorReasonText = document.getElementById('errorReasonText');
const iframe = document.getElementById('mainPlayer');
const pwaBtn = document.getElementById('pwaInstallBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const offlineBanner = document.getElementById('offlineBanner');
const embedDiagnosticText = document.getElementById('embedDiagnosticText');

// 1. Diagnóstico de Incrustabilidad (GET /api/check-embed)
async function performEmbedCheck() {
  try {
    const res = await fetch('/api/check-embed', {
      headers: { 'Accept': 'application/json' },
      cache: 'default'
    });

    if (res.ok) {
      embedCheckResult = await res.json();
      if (embedDiagnosticText) {
        if (embedCheckResult.embeddable) {
          embedDiagnosticText.textContent = "Servidor remoto: Incrustación permitida";
          embedDiagnosticText.style.color = "#34d399";
        } else {
          embedDiagnosticText.textContent = "Servidor remoto: Restricciones de marco detectadas";
          embedDiagnosticText.style.color = "#fbbf24";
        }
      }

      // Si la API confirma que no es incrustable, aplicar el bloqueo seguro de inmediato
      if (!embedCheckResult.embeddable) {
        showErrorState();
      }
    }
  } catch (err) {
    console.info('[StreamShield] Nota: /api/check-embed no disponible en entorno actual o sin red:', err);
  }
}

// 2. Iniciar Reproducción Segura
function loadProtectedStream() {
  // Si la verificación ya confirmó bloqueo de incrustación, no iniciar el marco
  if (embedCheckResult && embedCheckResult.embeddable === false) {
    showErrorState();
    return;
  }

  isLoaded = false;

  // Actualizar UI a estado de carga
  if (initialCard) initialCard.style.display = 'none';
  if (errorCard) errorCard.style.display = 'none';
  if (loadingCard) loadingCard.style.display = 'block';

  if (statusDot) {
    statusDot.className = 'status-dot';
    statusText.textContent = 'Verificando y cargando stream...';
  }

  // Cargar origen seguro en el iframe aislado
  if (iframe) {
    iframe.src = TARGET_STREAM_URL;

    // Escuchar el evento de carga del marco
    iframe.onload = function () {
      isLoaded = true;
      if (loadTimer) clearTimeout(loadTimer);

      if (statusDot) {
        statusDot.className = 'status-dot active';
        statusText.textContent = 'En reproducción (Sandbox Activo)';
      }

      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
          if (loadingCard) loadingCard.style.display = 'none';
        }, 300);
      }
    };
  }

  // Temporizador de guardia (8 segundos) ante bloqueo de X-Frame-Options o timeout
  if (loadTimer) clearTimeout(loadTimer);
  loadTimer = setTimeout(() => {
    if (!isLoaded) {
      if (iframe) iframe.src = "about:blank";
      showErrorState();
    }
  }, 8000);
}

// 3. Mostrar Estado de Error Estrictamente Aislado
function showErrorState() {
  if (loadingCard) loadingCard.style.display = 'none';
  if (initialCard) initialCard.style.display = 'none';
  if (errorCard) {
    errorCard.style.display = 'block';
    if (errorReasonText) {
      errorReasonText.textContent = SECURE_BLOCKED_MESSAGE;
    }
  }

  if (statusDot) {
    statusDot.className = 'status-dot blocked';
    statusText.textContent = 'No disponible en modo seguro';
  }

  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  }
}

// 4. Reiniciar Marco y Escudo (Botón de reinicio)
function resetPlayerSandbox() {
  if (loadTimer) clearTimeout(loadTimer);
  isLoaded = false;

  if (iframe) {
    iframe.src = "about:blank";
  }

  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  }

  if (initialCard) initialCard.style.display = 'block';
  if (loadingCard) loadingCard.style.display = 'none';
  if (errorCard) errorCard.style.display = 'none';

  if (statusDot) {
    statusDot.className = 'status-dot';
    statusText.textContent = 'Listo para reproducir';
  }
}

// 5. Pantalla Completa
function togglePlayerFullscreen() {
  const container = document.getElementById('playerWrapper');
  if (!container) return;

  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => {
      console.warn('Error al activar pantalla completa:', err);
    });
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// 6. Registro del Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[StreamShield SW] Registrado en ámbito:', reg.scope))
      .catch((err) => console.warn('[StreamShield SW] Error al registrar:', err));
  });
}

// 7. Instalación PWA (beforeinstallprompt)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaBtn) {
    pwaBtn.style.display = 'inline-flex';
  }
});

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      if (pwaBtn) pwaBtn.style.display = 'none';
    });
  } else {
    alert("Para instalar en iOS: Pulsa el botón 'Compartir' en Safari y luego 'Añadir a la pantalla de inicio'.");
  }
}

// 8. Control de Estado Offline
function updateOnlineStatus() {
  if (offlineBanner) {
    if (!navigator.onLine) {
      offlineBanner.style.display = 'block';
    } else {
      offlineBanner.style.display = 'none';
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Ejecutar verificación inicial de incrustabilidad y estado de conexión
document.addEventListener('DOMContentLoaded', () => {
  updateOnlineStatus();
  performEmbedCheck();
});
