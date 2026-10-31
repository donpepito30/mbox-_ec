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
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16/9');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

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
        ...prev.slice(0, 49), // Keep latest 50 logs
      ]);
    },
    []
  );

  const clearLogs = () => {
    setLogs([]);
  };

  // Keyboard shortcut listener:
  // 't' or 'T' for theater mode, 'f' or 'F' for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
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

      {/* Top Navigation & App Bar */}
      <Header
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenIOSGuide={() => setIsInstallModalOpen(true)}
        isSandboxed={true}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
        {/* Aviso de Seguridad Informativo Realista */}
        <SecurityNotice />

        {/* Visor del Reproductor Aislado con Detección de Errores */}
        <PlayerWrapper
          currentSource={currentSource}
          aspectRatio={aspectRatio}
          isTheaterMode={isTheaterMode}
          onSelectSource={setCurrentSource}
          onAddLog={addLog}
        />

        {/* Player Controls, Sources & Proportions */}
        <PlayerControls
          currentSource={currentSource}
          aspectRatio={aspectRatio}
          isTheaterMode={isTheaterMode}
          onSelectSource={setCurrentSource}
          onChangeAspectRatio={setAspectRatio}
          onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
          onOpenInspector={() => setIsInspectorOpen(true)}
        />

        {/* Live Security Monitor Log */}
        <ActivityLog logs={logs} onClearLogs={clearLogs} />
      </main>

      {/* Modals */}
      <SecurityInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        onInstall={install}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#334155] bg-[#1e293b] px-4 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© StreamShield App - Plataforma PWA Aislada</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Sandbox Estricto W3C</span>
            <span>•</span>
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
            >
              Auditoría de Seguridad
            </button>
            <span>•</span>
            <span>Atajo: [T] Modo Teatro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
