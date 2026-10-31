import React from 'react';
import { Smartphone, Share, PlusSquare, Check, X, Shield } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onInstall: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-3xl p-6 sm:p-7 shadow-2xl text-left space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instalar StreamShield App</h3>
              <p className="text-[11px] text-slate-400">Acceso directo como aplicación nativa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isInstallable ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Tu navegador soporta la instalación directa con un solo clic. Haz clic en el botón inferior para añadir StreamShield a tu pantalla de inicio o escritorio con soporte offline y pantalla completa.
            </p>
            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Instalar ahora en este dispositivo</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-slate-300 leading-relaxed">
              Para instalar StreamShield en tu <strong>iPhone, iPad o Safari</strong>, sigue estos dos sencillos pasos:
            </p>

            <div className="space-y-2.5 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Toca el botón Compartir</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    En la barra inferior de Safari, pulsa el icono de compartir
                    <Share className="w-3.5 h-3.5 inline text-sky-400" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Añadir a la pantalla de inicio</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    Baja en las opciones y selecciona
                    <strong className="text-slate-200">"Añadir a pantalla de inicio"</strong>
                    <PlusSquare className="w-3.5 h-3.5 inline text-purple-400" />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-300">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Listo! Se abrirá sin barra de navegador como una app nativa independiente.</span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
