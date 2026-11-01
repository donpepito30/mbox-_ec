import React from 'react';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Lock,
  EyeOff,
  AlertOctagon,
  FileCode,
  ExternalLink
} from 'lucide-react';

interface SecurityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetNotice?: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  isOpen,
  onClose,
  onResetNotice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-[#1e293b] border border-[#334155] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#334155] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Auditoría del Sandbox StreamShield</h2>
              <p className="text-xs text-slate-400">
                Parámetros de aislamiento e ingeniería de seguridad activa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Security Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Amenazas Neutralizadas</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Pop-ups publicitarios:</strong> Sin `allow-popups`.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Robo de pestaña:</strong> Sin `allow-top-navigation`.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Phishing por formulario:</strong> Sin `allow-forms`.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Descargas silenciosas:</strong> Sin `allow-downloads`.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Acceso a hardware:</strong> Cámara, micrófono y GPS vetados.</span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Privilegios Autorizados</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>allow-scripts:</strong> Necesario para el reproductor de video.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>allow-same-origin:</strong> Para el buffer de video local.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>allow-presentation:</strong> Proyección a Chromecast o AirPlay.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>allowfullscreen:</strong> Modo pantalla completa sin interrupciones.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code representation */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Atributos HTML del Reproductor
            </span>
            <span className="text-emerald-400 font-semibold">Strict Standard W3C</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto p-2 bg-black/40 rounded-lg text-[11px] leading-relaxed">
{`<iframe
  id="mainPlayer"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allow="fullscreen; autoplay; encrypted-media"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>`}
          </pre>
        </div>

        {/* X-Frame-Options notice */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            ¿Por qué algunos sitios muestran la pantalla de error tras 8 segundos?
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Plataformas de streaming comerciales a menudo envían la cabecera HTTP <code className="text-cyan-300">X-Frame-Options: SAMEORIGIN</code> o la directiva CSP <code className="text-cyan-300">frame-ancestors 'self'</code>. Cuando esto ocurre, tu navegador web rechaza el renderizado dentro del marco para protegerte. En ese caso, StreamShield te proporciona inmediatamente el botón <strong className="text-white">Abrir en el navegador</strong> para continuar de forma directa y segura.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {onResetNotice ? (
            <button
              onClick={() => {
                onResetNotice();
                onClose();
              }}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition cursor-pointer"
            >
              Restablecer aviso de seguridad inicial
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
