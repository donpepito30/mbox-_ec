import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Check, XCircle, CheckCircle2 } from 'lucide-react';

interface SecurityNoticeProps {
  onDismiss: () => void;
  onOpenInspector: () => void;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({ onDismiss, onOpenInspector }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#451a03]/90 border border-[#78350f] rounded-xl px-3 py-2 sm:py-2.5 text-[#fde68a] text-xs shadow-md shadow-black/20 transition-all animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[11px] sm:text-xs leading-tight truncate sm:whitespace-normal text-amber-200/95">
            <strong>Sandbox activo:</strong> Sin pop-ups ni descargas. Anuncios en video son del proveedor.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-0.5 text-[11px] font-medium text-amber-300 hover:text-white px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/50 transition cursor-pointer"
            title="Ver detalle de políticas"
          >
            <span>{isExpanded ? 'Ocultar' : 'Políticas'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={onDismiss}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded shadow-sm hover:shadow transition cursor-pointer active:scale-95"
            title="Aceptar y descartar aviso para ganar espacio"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Entiendo y acepto</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-amber-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-200/90 animate-in slide-in-from-top-1 duration-150">
          <div className="bg-amber-950/50 p-2 rounded-lg border border-amber-800/40 flex items-start gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-300">Bloqueado:</span>
              <p className="text-[10px] text-amber-100/80 mt-0.5 leading-snug">
                Pop-ups, formularios externos, redirección de pestaña y descargas de archivos.
              </p>
            </div>
          </div>
          <div className="bg-amber-950/50 p-2 rounded-lg border border-amber-800/40 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">Permitido:</span>
              <p className="text-[10px] text-amber-100/80 mt-0.5 leading-snug">
                Scripts de video, buffer local y pantalla completa segura en sandbox W3C.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
