import React, { useState } from 'react';
import {
  Tv,
  Globe,
  Plus,
  PlaySquare,
  Check
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
        badge: 'Personalizado',
        description: 'Fuente manual en sandbox.',
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
    <div className="bg-[#1e293b]/90 border border-[#334155] rounded-xl px-3 py-2 shadow-lg flex flex-wrap items-center justify-between gap-2.5 transition-all">
      {/* Stream Source Selector: Compact Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
          Fuente:
        </span>
        {PRESET_STREAMS.map((source) => {
          const isSelected = currentSource.url === source.url;
          return (
            <button
              key={source.id}
              onClick={() => onSelectSource(source)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />}
              <span>{source.id === 'moviebox' ? 'Movie Box (Predet.)' : source.name.split(' (')[0]}</span>
            </button>
          );
        })}

        {/* Custom URL Button */}
        <button
          onClick={() => setShowCustomModal(true)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-dashed border-slate-700 transition cursor-pointer flex items-center gap-1 shrink-0"
          title="Cargar URL personalizada"
        >
          <Plus className="w-3 h-3" />
          <span>URL</span>
        </button>
      </div>

      {/* Proporción & Teatro: Compact Controls */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
          {(['fill', '16/9', '21/9', '4/3'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onChangeAspectRatio(ratio)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                aspectRatio === ratio
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Proporción ${ratio === 'fill' ? 'Adaptable (ocupa pantalla)' : ratio}`}
            >
              {ratio === 'fill' ? 'Adaptable' : ratio}
            </button>
          ))}
        </div>

        {/* Theater Mode Button */}
        <button
          onClick={onToggleTheaterMode}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
            isTheaterMode
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
              : 'bg-slate-900/70 border-slate-700/70 text-slate-400 hover:text-white'
          }`}
          title="Modo Teatro (Atajo: [T])"
        >
          <Tv className="w-3 h-3" />
          <span className="hidden sm:inline">Teatro</span>
        </button>
      </div>

      {/* Custom Stream URL Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-2xl p-5 sm:p-6 shadow-2xl text-left space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Cargar Stream en Sandbox Seguro</span>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              Introduce cualquier URL de reproductor o video web para aislarla en sandbox W3C estricto contra pop-ups.
            </p>

            <form onSubmit={handleAddCustomStream} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nombre o Título (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Servidor 2 / En Vivo"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
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
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  Cargar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
