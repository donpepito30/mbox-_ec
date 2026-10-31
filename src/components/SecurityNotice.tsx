import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Lock, CheckCircle2, XCircle } from 'lucide-react';

export const SecurityNotice: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#451a03]/90 border border-[#78350f] rounded-xl p-3 sm:p-4 text-[#fde68a] text-xs sm:text-sm shadow-lg shadow-black/20 transition-all">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-900/50 border border-amber-700/60 shrink-0 text-amber-400 mt-0.5">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="leading-relaxed">
            <p>
              <strong className="text-amber-200 font-bold">Aviso de Seguridad:</strong> El reproductor corre aislado sin acceso a cámara, micrófono, descargas automáticas ni ventanas emergentes (pop-ups).{' '}
              <em className="text-amber-300/90 not-italic">
                Nota: Este sandbox no bloquea los anuncios que el proveedor muestre internamente dentro de la pantalla del video.
              </em>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-white px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/40 transition cursor-pointer"
        >
          <span>{isExpanded ? 'Menos' : 'Políticas'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-800/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-200/90">
          <div className="bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-300">Bloqueado por Sandbox:</span>
              <p className="text-[11px] text-amber-100/80 mt-0.5">
                Ventanas emergentes (popups), formularios intrusivos, redirección de pestaña superior (`allow-top-navigation` OFF), descargas directas de archivos.
              </p>
            </div>
          </div>
          <div className="bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">Permitido para Reproducción:</span>
              <p className="text-[11px] text-amber-100/80 mt-0.5">
                Ejecución de scripts del reproductor (`allow-scripts`), almacenamiento de sesión (`allow-same-origin`), proyección y pantalla completa (`allow-presentation`).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
