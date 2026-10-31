import React, { useState } from 'react';
import {
  Tv,
  Film,
  Globe,
  Maximize2,
  Ratio,
  Sliders,
  Check,
  Plus,
  Compass,
  PlaySquare
} from 'lucide-react';
import { AspectRatio, StreamSource, PRESET_STREAMS } from '../types';

interface PlayerControlsProps {
  currentSource: StreamSource;
  aspectRatio: AspectRatio;
  isTheaterMode: boolean;
  onSelectSource: (source: StreamSource) => void;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  onToggleTheaterMode: () => void;
  onOpenInspector: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSource,
  aspectRatio,
  isTheaterMode,
  onSelectSource,
  onChangeAspectRatio,
  onToggleTheaterMode,
  onOpenInspector,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');

  const handleAddCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customUrl.trim()) {
      setCustomError('Por favor introduce una dirección URL válida.');
      return;
    }

    try {
      const parsed = new URL(customUrl.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        setCustomError('La URL debe comenzar con https:// o http://');
        return;
      }

      const newSource: StreamSource = {
        id: `custom-${Date.now()}`,
        name: customName.trim() || parsed.hostname,
        url: customUrl.trim(),
        badge: 'Stream Personalizado',
        description: 'Fuente agregada manualmente por el usuario en sandbox protegido.',
        isExternalTarget: true,
      };

      onSelectSource(newSource);
      setShowCustomModal(false);
      setCustomUrl('');
      setCustomName('');
    } catch {
      setCustomError('El formato de la URL no es válido. Ejemplo: https://ejemplo.com/embed');
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Stream Source Selector */}
        <div className="w-full lg:w-auto flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <PlaySquare className="w-3.5 h-3.5 text-cyan-400" />
              Seleccionar Fuente de Reproducción
            </span>
            <button
              onClick={() => setShowCustomModal(true)}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Ingresar URL externa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_STREAMS.map((source) => {
              const isSelected = currentSource.url === source.url;
              return (
                <button
                  key={source.id}
                  onClick={() => onSelectSource(source)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-900/30'
                      : 'bg-slate-900/60 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {source.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <h4 className="text-xs font-semibold truncate">{source.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{source.url}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* View & Aspect Ratio Controls */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-3 pt-3 lg:pt-0 lg:border-l lg:border-slate-700/60 lg:pl-4">
          {/* Theater Mode Toggle */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Modo Teatro
            </span>
            <button
              onClick={onToggleTheaterMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isTheaterMode
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-900/20'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isTheaterMode ? 'Teatro Activo' : 'Modo Teatro'}</span>
            </button>
          </div>

          {/* Aspect Ratio Buttons */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Ratio className="w-3 h-3 text-cyan-400" />
              Proporción
            </span>
            <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-700">
              {(['16/9', '21/9', '4/3', 'fill'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => onChangeAspectRatio(ratio)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio === 'fill' ? 'Adaptable' : ratio}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Stream URL Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>Cargar Stream en Sandbox</span>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Introduce cualquier URL de reproductor o video web. StreamShield la aislará con políticas de sandbox estrictas impidiendo pop-ups y redirecciones.
            </p>

            <form onSubmit={handleAddCustomStream} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre o Título (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Servidor 2 / Canal en Vivo"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL del Stream / Embed
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                {customError && (
                  <p className="text-[11px] text-red-400 mt-1">{customError}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/30"
                >
                  Cargar en Sandbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
