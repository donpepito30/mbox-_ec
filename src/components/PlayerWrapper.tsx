import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Play,
  RefreshCw,
  AlertTriangle,
  Lock,
  Maximize2,
  Minimize2,
  CheckCircle2
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
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract pure hostname without path
  const sourceHostname = (() => {
    try {
      const parsed = new URL(currentSource.url);
      return parsed.hostname || currentSource.url;
    } catch {
      return currentSource.url;
    }
  })();

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

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsPseudoFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

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

      onAddLog(
        'warning',
        'Tiempo de espera excedido (8s) o restricción X-Frame-Options detectada',
        'El servidor de destino probablemente impide la incrustación mediante X-Frame-Options o CSP frame-ancestors.'
      );
      setOverlayState('error');
    }, 8000);
  };

  const handleIframeLoad = () => {
    if (iframeSrc === 'about:blank' || overlayState === 'initial') {
      return;
    }

    const elapsed = Date.now() - loadStartTime;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    onAddLog('info', `Marco de iframe cargado en ${elapsed}ms`, 'Aislamiento de sandbox activo');
    setTimeout(() => {
      setOverlayState('hidden');
    }, 300);
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
    if (!document.fullscreenElement && !isPseudoFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsPseudoFullscreen(true);
        });
      } else {
        // Fallback for iOS Safari
        setIsPseudoFullscreen(true);
      }
      try {
        if (screen.orientation && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch (_) {}
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsPseudoFullscreen(false);
    }
  };

  // Determine aspect ratio class / height
  const getAspectRatioStyle = () => {
    if (isTheaterMode) return { height: '80vh', minHeight: '480px' };
    switch (aspectRatio) {
      case '21/9':
        return { aspectRatio: '21 / 9', minHeight: '220px' };
      case '4/3':
        return { aspectRatio: '4 / 3', minHeight: '320px' };
      case '16/9':
        return { aspectRatio: '16 / 9', minHeight: '260px' };
      case 'fill':
      default:
        // Adaptable: Llena el alto disponible en pantalla móvil con prioridad protagonista (+40% de espacio)
        return { minHeight: '440px', height: 'calc(100dvh - 190px)', maxHeight: '760px' };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-black border border-[#334155] shadow-2xl transition-all duration-300 flex flex-col ${
        isPseudoFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none max-w-none h-screen w-screen'
          : isTheaterMode
          ? 'max-w-none shadow-cyan-900/20'
          : 'max-w-7xl mx-auto'
      }`}
    >
      {/* Player Top Bar: Sandbox Status, Hostname, Reload & Fullscreen */}
      <div className="bg-[#0f172a]/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 border-b border-[#334155] flex items-center justify-between gap-2 text-xs shrink-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/70 font-semibold text-[10px] sm:text-[11px] shrink-0">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Sandbox W3C</span>
          </span>
          <span className="text-slate-300 font-mono text-[11px] sm:text-xs truncate" title={currentSource.url}>
            {sourceHostname}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRetry}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
            title="Recargar marco aislado"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
            title={isPseudoFullscreen ? 'Salir de pantalla completa' : 'Pantalla Completa'}
          >
            {isPseudoFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Player Display (Protagonist area with smooth overflow containment) */}
      <div
        className="relative w-full bg-black flex-1 flex items-center justify-center overflow-hidden"
        style={getAspectRatioStyle()}
      >
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
            className={`absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-3 sm:p-6 transition-all duration-300 ${
              overlayState === 'loading'
                ? 'bg-[#0f172a]/90 backdrop-blur-md'
                : 'bg-[#0f172a]/95 backdrop-blur-lg'
            }`}
          >
            {/* INITIAL CARD: Centrado y sin scroll interno */}
            {overlayState === 'initial' && (
              <div
                id="initialCard"
                className="max-w-[380px] w-full bg-[#1e293b]/95 border border-[#334155] p-5 sm:p-7 rounded-2xl shadow-2xl text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
              >
                {/* Botón Play Protagonista */}
                <button
                  id="btnLaunchStream"
                  onClick={loadProtectedStream}
                  className="group relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 shadow-xl shadow-cyan-500/35 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all cursor-pointer mb-3.5 focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
                  title="Reproducir Contenido Seguro"
                >
                  <Play className="w-9 h-9 sm:w-10 sm:h-10 text-slate-950 fill-current ml-1 group-hover:scale-110 transition-transform" />
                  <span className="absolute -inset-1 rounded-full border-2 border-cyan-300/40 animate-ping opacity-60 pointer-events-none"></span>
                </button>

                <h2 className="text-lg sm:text-xl font-bold text-white mb-1 tracking-tight">
                  Reproductor Seguro
                </h2>

                <p className="text-xs text-slate-300 mb-4 max-w-xs leading-snug">
                  Entorno aislado W3C sin ventanas emergentes ni redirecciones.
                </p>

                {/* Badges de seguridad compactos */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/80">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Sin pop-ups
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/80">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Sin descargas
                  </span>
                </div>

                <button
                  onClick={loadProtectedStream}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar Reproducción Segura</span>
                </button>
              </div>
            )}

            {/* LOADING STATE: Detección y Conexión Activa */}
            {overlayState === 'loading' && (
              <div className="max-w-[360px] w-full bg-[#1e293b]/95 border border-[#334155] p-5 rounded-2xl shadow-2xl text-center space-y-3.5">
                <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                  <Shield className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Iniciando Sandbox Seguro</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Cargando stream y verificando aislamiento...
                  </p>
                </div>

                {/* Countdown progress */}
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>Límite de verificación:</span>
                    <span className="font-mono text-cyan-300 font-bold">{loadCountdown}s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-1000"
                      style={{ width: `${((8 - loadCountdown) / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setOverlayState('initial');
                      setIframeSrc('about:blank');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setOverlayState('hidden')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-xs font-semibold text-cyan-300 transition cursor-pointer"
                  >
                    Ver Marco
                  </button>
                </div>
              </div>
            )}

            {/* ERROR CARD: Fallo por Tiempo de Espera / X-Frame-Options */}
            {overlayState === 'error' && (
              <div
                id="errorCard"
                className="max-w-[400px] w-full bg-[#451212]/95 border border-[#7f1d1d] text-[#fca5a5] p-5 rounded-2xl shadow-2xl text-center space-y-3 animate-in fade-in duration-200"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-red-900/60 border border-red-700/60 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">Incrustación no disponible</h4>
                  <p className="text-xs text-red-200/90 mt-1 leading-snug">
                    El sitio remoto restringe la incrustación mediante X-Frame-Options. Puedes probar el video de prueba seguro.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={handleRetry}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar</span>
                  </button>
                  <button
                    onClick={handleSwitchToDemo}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <span>Ver Demo Seguro</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Player Bar: Status Indicator & Reset Shield */}
      <div className="bg-[#1e293b] px-3 sm:px-4 py-1.5 sm:py-2 border-t border-[#334155] flex items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              overlayState === 'hidden'
                ? 'bg-emerald-400 animate-pulse'
                : overlayState === 'loading'
                ? 'bg-amber-400 animate-ping'
                : overlayState === 'error'
                ? 'bg-red-400'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-slate-200 font-medium text-[11px] sm:text-xs truncate">
            {overlayState === 'hidden'
              ? 'Reproduciendo en Sandbox'
              : overlayState === 'loading'
              ? 'Sincronizando stream...'
              : overlayState === 'error'
              ? 'Restricción detectada'
              : 'Aislamiento listo para iniciar'}
          </span>

          <span className="hidden sm:inline-block text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400 text-[11px] truncate">
            Sin acceso a pop-ups ni APIs de hardware
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setOverlayState('initial');
              setIframeSrc('about:blank');
            }}
            className="text-[11px] sm:text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer active:scale-95"
          >
            Reiniciar escudo
          </button>
        </div>
      </div>
    </div>
  );
};
