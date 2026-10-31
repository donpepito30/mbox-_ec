import React, { useState } from 'react';
import { Terminal, Shield, AlertTriangle, Info, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { SecurityEvent } from '../types';

interface ActivityLogProps {
  logs: SecurityEvent[];
  onClearLogs: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs, onClearLogs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl overflow-hidden shadow-md text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Monitor de Seguridad y Registro del Sandbox ({logs.length})</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {isOpen && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Limpiar registro"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="max-h-56 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic py-2 text-center">No hay eventos registrados aún.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded-lg border flex items-start gap-2 ${
                  log.level === 'shield'
                    ? 'bg-cyan-950/40 border-cyan-800/40 text-cyan-200'
                    : log.level === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/40 text-amber-200'
                    : log.level === 'error'
                    ? 'bg-red-950/40 border-red-800/40 text-red-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {log.level === 'shield' ? (
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  ) : log.level === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{log.message}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                  {log.details && (
                    <p className="text-[10px] text-slate-400 mt-0.5 break-all">{log.details}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
