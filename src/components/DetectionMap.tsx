import { Crosshair, Eye, Gauge, Layers3, MapPinned, Radar, Waves, Zap } from 'lucide-react';
import type { Detection, LayerToggle } from '../data/dashboard';

type DetectionMapProps = {
  activeLayers: string[];
  detections: Detection[];
  imageSrc: string;
  layers: LayerToggle[];
  mapStatus: string;
  selectedDetection: string;
  onMapAction: (action: string) => void;
  onSelectDetection: (label: string) => void;
  onToggleLayer: (label: string) => void;
};

const layerIcons = [Layers3, Waves, Radar, Eye];

const mapActions = [
  { id: 'recenter', label: 'Recenter AOI', icon: Crosshair },
  { id: 'confidence', label: 'Show confidence', icon: Gauge },
  { id: 'geojson', label: 'Export GeoJSON', icon: MapPinned },
  { id: 'thermal', label: 'Thermal boost', icon: Zap },
];

export function DetectionMap({
  activeLayers,
  detections,
  imageSrc,
  layers,
  mapStatus,
  selectedDetection,
  onMapAction,
  onSelectDetection,
  onToggleLayer,
}: DetectionMapProps) {
  const activeLayerClass = activeLayers
    .map((layer) => `layer-${layer.toLowerCase().replace(/\s+/g, '-')}`)
    .join(' ');

  return (
    <section className="panel map-panel" aria-label="Satellite change map">
      <div className="map-toolbar">
        <div>
          <h2>Change Detection Surface</h2>
          <p>
            Active layers: {activeLayers.length > 0 ? activeLayers.join(', ') : 'none selected'}
          </p>
        </div>
        <div className="map-tools" aria-label="Map layers">
          {layers.map((layer, index) => {
            const Icon = layerIcons[index] ?? Layers3;
            return (
              <button
                className={`tool-toggle ${layer.active ? 'active' : ''}`}
                key={layer.label}
                type="button"
                aria-pressed={layer.active}
                onClick={() => onToggleLayer(layer.label)}
                title={`${layer.active ? 'Hide' : 'Show'} ${layer.label} layer`}
              >
                <Icon size={15} />
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`map-viewport ${activeLayerClass}`}>
        <img src={imageSrc} alt="Futuristic multispectral satellite map" />
        <span className="scan-beam" aria-hidden="true" />
        <div className="map-status" aria-live="polite">
          <span className="eyebrow">Map Console</span>
          <strong>{mapStatus}</strong>
        </div>
        {detections.map((detection) => (
          <button
            aria-label={`${detection.label}: ${detection.detail}`}
            aria-pressed={selectedDetection === detection.label}
            className={`detection-point ${detection.severity} ${
              selectedDetection === detection.label ? 'selected' : ''
            }`}
            key={detection.label}
            onClick={() => onSelectDetection(detection.label)}
            style={{ left: `${detection.x}%`, top: `${detection.y}%` }}
            title={`${detection.label} - ${detection.score}`}
            type="button"
          />
        ))}
        <div className="detection-label">
          {detections.slice(0, 4).map((detection) => (
            <button
              className={selectedDetection === detection.label ? 'selected' : ''}
              key={detection.label}
              onClick={() => onSelectDetection(detection.label)}
              type="button"
            >
              <span className={`severity-dot ${detection.severity}`} />
              <div>
                <strong>{detection.label}</strong>
                <small>{detection.detail}</small>
              </div>
              <strong>{detection.score}</strong>
            </button>
          ))}
        </div>
        <div className="map-compass" aria-label="Map quick actions">
          {mapActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                className="icon-button"
                key={action.id}
                onClick={() => onMapAction(action.id)}
                title={action.label}
                type="button"
                aria-label={action.label}
              >
                <Icon size={22} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
