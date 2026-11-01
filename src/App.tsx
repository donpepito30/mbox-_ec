/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SecurityNotice } from './components/SecurityNotice';
import { PlayerWrapper } from './components/PlayerWrapper';
import { PlayerControls } from './components/PlayerControls';
import { SecurityInspectorModal } from './components/SecurityInspectorModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineBanner } from './components/OfflineBanner';
import { ActivityLog } from './components/ActivityLog';
import { usePWAInstall } from './hooks/usePWAInstall';
import { AspectRatio, StreamSource, PRESET_STREAMS, SecurityEvent } from './types';

export default function App() {
  const [currentSource, setCurrentSource] = useState<StreamSource>(PRESET_STREAMS[0]);
  // Default to 'fill' (Adaptable) so the player acts as the true protagonist and fills the viewport (+40% space)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('fill');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Check if security notice was already acknowledged
  const [isNoticeDismissed, setIsNoticeDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('streamshield_aviso_v1') === 'accepted';
    } catch {
      return false;
    }
  });

  const { isInstallable, install } = usePWAInstall();

  // Security logs stream
  const [logs, setLogs] = useState<SecurityEvent[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'shield',
      message: 'Sandbox StreamShield inicializado con aislamiento estricto W3C',
      details: 'allow-scripts allow-same-origin allow-presentation (allow-forms y popups BLOQUEADOS)',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Destino predeterminado configurado',
      details: PRESET_STREAMS[0].url,
    },
  ]);

  const addLog = useCallback(
    (level: 'info' | 'shield' | 'warning' | 'error', message: string, details?: string) => {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          level,
          message,
          details,
        },
        ...prev.slice(0, 49),
      ]);
    },
    []
  );

  const clearLogs = () => {
    setLogs([]);
  };

  const handleDismissNotice = () => {
    try {
      localStorage.setItem('streamshield_aviso_v1', 'accepted');
    } catch {}
    setIsNoticeDismissed(true);
  };

  const handleResetNotice = () => {
    try {
      localStorage.removeItem('streamshield_aviso_v1');
    } catch {}
    setIsNoticeDismissed(false);
  };

  // Keyboard shortcut listener:
  // 't' or 'T' for theater mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        setIsTheaterMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Offline banner */}
      <OfflineBanner />

      {/* Top Navigation Bar: Compact 48px Header */}
      {!isTheaterMode && (
        <Header
          onOpenInspector={() => setIsInspectorOpen(true)}
          onOpenIOSGuide={() => setIsInstallModalOpen(true)}
          isSandboxed={true}
        />
      )}

      {/* Main Container: Compact vertical rhythm prioritizing the player */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex flex-col gap-2.5 sm:gap-3">
        {/* Aviso de Seguridad Descartable: Ocupa 0px cuando fue aceptado */}
        {!isTheaterMode && !isNoticeDismissed && (
          <SecurityNotice
            onDismiss={handleDismissNotice}
            onOpenInspector={() => setIsInspectorOpen(true)}
          />
        )}

        {/* Visor del Reproductor Aislado (PROTAGONISTA) */}
        <PlayerWrapper
          currentSource={currentSource}
          aspectRatio={aspectRatio}
          isTheaterMode={isTheaterMode}
          onSelectSource={setCurrentSource}
          onAddLog={addLog}
        />

        {/* Controles de Reproducción y Fuentes: Barra compacta */}
        {!isTheaterMode && (
          <PlayerControls
            currentSource={currentSource}
            aspectRatio={aspectRatio}
            isTheaterMode={isTheaterMode}
            onSelectSource={setCurrentSource}
            onChangeAspectRatio={setAspectRatio}
            onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
            onOpenInspector={() => setIsInspectorOpen(true)}
          />
        )}

        {/* Monitor de Registro Plegable (Quiet footer drawer) */}
        {!isTheaterMode && (
          <ActivityLog logs={logs} onClearLogs={clearLogs} />
        )}
      </main>

      {/* Modales Accesibles */}
      <SecurityInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onResetNotice={handleResetNotice}
      />

      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        onInstall={install}
      />

      {/* Footer Compacto */}
      {!isTheaterMode && (
        <footer className="mt-auto border-t border-[#334155] bg-[#1e293b] px-3 py-2 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px]">
            <p>© StreamShield App · Sandbox Estricto W3C</p>
            <div className="flex items-center gap-3 text-slate-500">
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
              >
                Auditoría
              </button>
              <span>•</span>
              <button
                onClick={() => setIsTheaterMode((prev) => !prev)}
                className="hover:text-slate-300 cursor-pointer"
              >
                Teatro [T]
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
