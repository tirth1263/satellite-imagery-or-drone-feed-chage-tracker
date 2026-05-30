import { Crosshair, Eye, Gauge, Layers3, MapPinned, Radar, Waves, Zap } from 'lucide-react';
import type { Detection, LayerToggle } from '../data/dashboard';

type DetectionMapProps = {
  activeLayers: string[];
  detections: Detection[];
  imageSrc: string;
  layers: LayerToggle[];
  selectedDetection: string;
  onSelectDetection: (label: string) => void;
  onToggleLayer: (label: string) => void;
};

const layerIcons = [Layers3, Waves, Radar, Eye];

export function DetectionMap({
  activeLayers,
  detections,
  imageSrc,
  layers,
  selectedDetection,
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
          <p>Multispectral tile alignment with CV-generated risk zones.</p>
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
                title={layer.label}
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
        <div className="map-compass" aria-hidden="true">
          <Crosshair size={22} />
          <Gauge size={22} />
          <MapPinned size={22} />
          <Zap size={22} />
        </div>
      </div>
    </section>
  );
}
