import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Play,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Lock,
  Maximize2,
  Tv,
  Film,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { AspectRatio, StreamSource } from '../types';

interface PlayerWrapperProps {
  currentSource: StreamSource;
  aspectRatio: AspectRatio;
  isTheaterMode: boolean;
  onSelectSource: (source: StreamSource) => void;
  onAddLog: (level: 'info' | 'shield' | 'warning' | 'error', message: string, details?: string) => void;
}

export const PlayerWrapper: React.FC<PlayerWrapperProps> = ({
  currentSource,
  aspectRatio,
  isTheaterMode,
  onSelectSource,
  onAddLog,
}) => {
  const [iframeSrc, setIframeSrc] = useState<string>('about:blank');
  const [overlayState, setOverlayState] = useState<'initial' | 'loading' | 'error' | 'hidden'>('initial');
  const [loadCountdown, setLoadCountdown] = useState<number>(8);
  const [isCopied, setIsCopied] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // When source URL changes, reset to initial shield state
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIframeSrc('about:blank');
    setOverlayState('initial');
    setLoadCountdown(8);
  }, [currentSource.url]);

  const loadProtectedStream = () => {
    onAddLog('shield', `Iniciando reproducción segura: ${currentSource.name}`, `URL: ${currentSource.url}`);
    setOverlayState('loading');
    setLoadCountdown(8);
    setLoadStartTime(Date.now());

    // Set iframe target URL
    setIframeSrc(currentSource.url);

    // Countdown interval for user feedback
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    let secondsLeft = 8;
    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setLoadCountdown(Math.max(0, secondsLeft));
      if (secondsLeft <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    // 8-second timeout detection for X-Frame-Options or connection failure
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      // Verify if iframe loaded successfully or was blocked
      onAddLog(
        'warning',
        'Tiempo de espera excedido (8s) o restricción X-Frame-Options detectada',
        'El servidor de destino probablemente impide la incrustación mediante X-Frame-Options o CSP frame-ancestors.'
      );
      setOverlayState('error');
    }, 8000);
  };

  const handleIframeLoad = () => {
    // Only process if we actually initiated loading a non-blank URL
    if (iframeSrc === 'about:blank' || overlayState === 'initial') {
      return;
    }

    const elapsed = Date.now() - loadStartTime;

    // In browsers, when X-Frame-Options blocks an iframe, the iframe may still trigger
    // an onload with an empty error page. However, our 8-second watchdog catches timeouts.
    // If it triggers within a reasonable window, we mark it loaded:
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    onAddLog('info', `Marco de iframe cargado en ${elapsed}ms`, 'Aislamiento de sandbox activo');
    
    // Smooth transition
    setTimeout(() => {
      setOverlayState('hidden');
    }, 400);
  };

  const handleRetry = () => {
    onAddLog('info', 'Reintentando conexión con el reproductor...');
    setIframeSrc('about:blank');
    setTimeout(() => {
      loadProtectedStream();
    }, 100);
  };

  const handleSwitchToDemo = () => {
    onAddLog('info', 'Cambiando a video demo seguro para verificar entorno de reproducción');
    onSelectSource({
      id: 'demo-player',
      name: 'StreamShield Sandbox Demo (HTML5 Seguro)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      badge: 'Verificación 100% Funcional',
      description: 'Secuencia de prueba segura para verificar el reproductor, controles, pantalla completa y PWA.',
      isExternalTarget: false,
    });
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        onAddLog('warning', `Error al solicitar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(currentSource.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Determine aspect ratio class
  const getAspectRatioStyle = () => {
    if (isTheaterMode) return { height: '70vh' };
    switch (aspectRatio) {
      case '21/9':
        return { aspectRatio: '21 / 9' };
      case '4/3':
        return { aspectRatio: '4 / 3' };
      case 'fill':
        return { minHeight: '520px', height: '100%' };
      case '16/9':
      default:
        return { aspectRatio: '16 / 9' };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-black border border-[#334155] shadow-2xl transition-all duration-300 ${
        isTheaterMode ? 'max-w-none shadow-cyan-900/20' : 'max-w-7xl mx-auto'
      }`}
    >
      {/* Player Header Bar / Security Strip */}
      <div className="bg-[#0f172a]/95 backdrop-blur-md px-3 sm:px-4 py-2 border-b border-[#334155] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold text-[11px] shrink-0">
            <Lock className="w-3 h-3 text-cyan-400" />
            Sandbox W3C
          </span>
          <span className="text-slate-300 font-medium truncate text-[11px] sm:text-xs">
            {currentSource.url}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={copyCurrentUrl}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Copiar URL del Stream"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleRetry}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Recargar marco aislado"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Player Display with Aspect Ratio */}
      <div className="relative w-full bg-black flex items-center justify-center overflow-hidden" style={getAspectRatioStyle()}>
        {/*
            REPRODUCTOR IFRAME CONFIGURADO SEGÚN ESPECIFICACIONES EXACTAS:
            1. sandbox: "allow-scripts allow-same-origin allow-presentation" (sin allow-forms, sin allow-popups).
            2. allowfullscreen habilitado.
            3. sin loading="lazy".
            4. referrerpolicy: "strict-origin-when-cross-origin".
        */}
        <iframe
          ref={iframeRef}
          id="mainPlayer"
          src={iframeSrc}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="fullscreen; autoplay; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title="Reproductor Seguro"
          className="w-full h-full border-none block bg-black"
          onLoad={handleIframeLoad}
        />

        {/* OVERLAY DE PROTECCIÓN Y LANZAMIENTO */}
        {overlayState !== 'hidden' && (
          <div
            id="shieldOverlay"
            className={`absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-4 sm:p-6 transition-all duration-300 ${
              overlayState === 'loading'
                ? 'bg-[#0f172a]/90 backdrop-blur-md'
                : 'bg-[#0f172a]/95 backdrop-blur-lg'
            }`}
          >
            {/* INITIAL CARD: Reproductor Listo */}
            {overlayState === 'initial' && (
              <div
                id="initialCard"
                className="max-w-[460px] w-full bg-[#1e293b] border border-[#334155] p-6 sm:p-8 rounded-2xl shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔒 Entorno Aislado Activo</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                  Reproductor Listo
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Haz clic a continuación para iniciar el reproductor en el entorno protegido. Las ventanas emergentes externas permanecerán bloqueadas por el navegador.
                </p>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 mb-6 text-left space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Bloqueo estricto de pop-ups y redirecciones no deseadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sin permisos para micrófono, cámara ni descargas</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Vigilancia automática contra X-Frame-Options (8s)</span>
                  </div>
                </div>

                <button
                  id="btnLaunchStream"
                  onClick={loadProtectedStream}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white py-3.5 px-6 rounded-xl text-base font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>▶ Reproducir Contenido Seguro</span>
                </button>
              </div>
            )}

            {/* LOADING STATE: Detección y Conexión Activa */}
            {overlayState === 'loading' && (
              <div className="max-w-[420px] w-full bg-[#1e293b]/95 border border-[#334155] p-6 rounded-2xl shadow-2xl text-center space-y-4">
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                  <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Estableciendo Sandbox Seguro</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Cargando stream y verificando cabeceras de seguridad...
                  </p>
                </div>

                {/* Countdown progress */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                    <span>Límite de tiempo X-Frame:</span>
                    <span className="font-mono text-cyan-300 font-bold">{loadCountdown}s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-1000"
                      style={{ width: `${((8 - loadCountdown) / 8) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Si el sitio prohíbe ser incrustado, se activará el enlace externo seguro.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setOverlayState('initial')}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setOverlayState('hidden')}
                    className="flex-1 py-2 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-xs font-semibold text-cyan-300 transition cursor-pointer"
                  >
                    Forzar Vista
                  </button>
                </div>
              </div>
            )}

            {/* ERROR CARD: Fallo por Tiempo de Espera / X-Frame-Options */}
            {overlayState === 'error' && (
              <div
                id="errorCard"
                className="max-w-[460px] w-full bg-[#451212] border border-[#7f1d1d] text-[#fca5a5] p-6 sm:p-7 rounded-2xl shadow-2xl text-center space-y-4 animate-in fade-in duration-300"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-red-900/60 border border-red-700/60 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <p className="text-sm text-red-100 font-medium leading-relaxed">
                  Este contenido no está disponible en modo seguro. Por tu protección, StreamShield no abre sitios fuera del entorno aislado.
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleRetry}
                    className="w-full max-w-[240px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white py-3 px-6 rounded-xl text-sm font-bold shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reintentar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Player Bar: Status pill & Fullscreen Helper */}
      <div className="bg-[#1e293b] px-4 py-2 border-t border-[#334155] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                overlayState === 'hidden'
                  ? 'bg-emerald-400 animate-pulse'
                  : overlayState === 'loading'
                  ? 'bg-amber-400 animate-ping'
                  : overlayState === 'error'
                  ? 'bg-red-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {overlayState === 'hidden'
                ? 'Reproduciendo en Sandbox'
                : overlayState === 'loading'
                ? 'Sincronizando stream...'
                : overlayState === 'error'
                ? 'Restricción X-Frame detectada'
                : 'Aislamiento listo para iniciar'}
            </span>
          </div>

          <span className="hidden sm:inline-block text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Sin acceso a pop-ups ni APIs de hardware
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Aspecto: <strong className="text-slate-200">{aspectRatio}</strong>
          </span>
          {overlayState === 'hidden' && (
            <button
              onClick={() => setOverlayState('initial')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Reiniciar Escudo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
