import React from 'react';
import { Shield, ShieldCheck, Download, Smartphone, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onOpenInspector: () => void;
  onOpenIOSGuide: () => void;
  isSandboxed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenInspector,
  onOpenIOSGuide,
  isSandboxed,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      onOpenIOSGuide();
    } else {
      // General install instructions fallback
      onOpenIOSGuide();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1e293b]/95 backdrop-blur-md border-b border-[#334155] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            {isSandboxed && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0f172a]"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                StreamShield App
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                PWA v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Reproductor aislado con protección contra pop-ups y malware
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Security Status Badge / Trigger */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm"
            title="Ver auditoría y políticas del Sandbox"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Sandbox:</span>
            <span className="text-emerald-400 font-semibold">Aislado</span>
            <Info className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              title="Instalar StreamShield en tu dispositivo"
            >
              {isIOS ? (
                <Smartphone className="w-4 h-4 text-purple-200" />
              ) : (
                <Download className="w-4 h-4 text-purple-200 animate-bounce" />
              )}
              <span>Instalar App</span>
            </button>
          )}

          {isInstalled && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Modo PWA Activo
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
