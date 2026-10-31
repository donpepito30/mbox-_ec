import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-2xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-white shadow-xl shadow-amber-950/40 border border-amber-400/40 animate-bounce">
      <div className="p-1.5 rounded-lg bg-amber-800/80">
        <WifiOff className="w-4 h-4 text-amber-200" />
      </div>
      <div className="leading-tight">
        <span className="font-bold">Modo Sin Conexión:</span>
        <p className="text-[11px] text-amber-100">
          La app sigue activa gracias a la PWA. El stream requerirá conexión activa de red.
        </p>
      </div>
    </div>
  );
};
