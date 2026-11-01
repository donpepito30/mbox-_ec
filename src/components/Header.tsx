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
    <header className="sticky top-0 z-40 bg-[#1e293b]/95 backdrop-blur-md border-b border-[#334155] px-3 sm:px-6 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 h-10">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-sm shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-[#0f172a] rounded-[7px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            {isSandboxed && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#0f172a]"></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 truncate">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-200 bg-clip-text text-transparent truncate tracking-tight">
              StreamShield
            </h1>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              PWA v1.0
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Security Status Badge / Trigger */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-[11px] sm:text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Ver auditoría y políticas del Sandbox"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Aislado</span>
            <Info className="w-3 h-3 text-slate-400 hidden xs:inline" />
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
              title="Instalar StreamShield en tu pantalla de inicio"
            >
              {isIOS ? (
                <Smartphone className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">Instalar</span>
            </button>
          )}

          {isInstalled && (
            <div className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              PWA
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
