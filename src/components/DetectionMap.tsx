import { Crosshair, Eye, Gauge, Layers3, MapPinned, Radar, Waves, Zap } from 'lucide-react';

type Detection = {
  label: string;
  detail: string;
  severity: 'hot' | 'warn' | 'cool';
  x: number;
  y: number;
  score: string;
};

type LayerToggle = {
  label: string;
  active: boolean;
};

type DetectionMapProps = {
  detections: Detection[];
  layers: LayerToggle[];
};

const layerIcons = [Layers3, Waves, Radar, Eye];

export function DetectionMap({ detections, layers }: DetectionMapProps) {
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
                title={layer.label}
              >
                <Icon size={15} />
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="map-viewport">
        <img src="/assets/orbital-change-map.png" alt="Futuristic multispectral satellite map" />
        <span className="scan-beam" aria-hidden="true" />
        {detections.map((detection) => (
          <span
            aria-label={`${detection.label}: ${detection.detail}`}
            className={`detection-point ${detection.severity}`}
            key={detection.label}
            style={{ left: `${detection.x}%`, top: `${detection.y}%` }}
            title={`${detection.label} - ${detection.score}`}
          />
        ))}
        <div className="detection-label">
          {detections.slice(0, 3).map((detection) => (
            <article key={detection.label}>
              <span className={`severity-dot ${detection.severity}`} />
              <div>
                <strong>{detection.label}</strong>
                <small>{detection.detail}</small>
              </div>
              <strong>{detection.score}</strong>
            </article>
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
