export interface StreamSource {
  id: string;
  name: string;
  url: string;
  badge: string;
  description: string;
  isExternalTarget?: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'shield' | 'warning' | 'error';
  message: string;
  details?: string;
}

export type AspectRatio = '16/9' | '21/9' | '4/3' | 'fill';

export const DEFAULT_STREAM_URL = 'https://officialmoviebox.com/';

export const PRESET_STREAMS: StreamSource[] = [
  {
    id: 'moviebox',
    name: 'Official Movie Box (Predeterminado)',
    url: 'https://officialmoviebox.com/',
    badge: 'Destino Principal',
    description: 'Proveedor externo especificado. Ejecutado bajo sandbox estricto sin pop-ups.',
    isExternalTarget: true,
  },
  {
    id: 'demo-player',
    name: 'StreamShield Sandbox Demo (HTML5 Seguro)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    badge: 'Verificación 100% Funcional',
    description: 'Secuencia de prueba segura para verificar el reproductor, controles, pantalla completa y PWA.',
    isExternalTarget: false,
  },
  {
    id: 'wikimedia-demo',
    name: 'Tears of Steel (Video Abierto)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    badge: '4K Open Source',
    description: 'Video de prueba de alta definición con soporte de audio y subtítulos en entorno seguro.',
    isExternalTarget: false,
  },
];
