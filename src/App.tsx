import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import {
  Activity,
  Bell,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  CloudUpload,
  DatabaseZap,
  Download,
  Globe2,
  Loader2,
  Play,
  RadioTower,
  Route,
  Satellite,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import './App.css';
import { DetectionMap } from './components/DetectionMap';
import { MetricCard } from './components/MetricCard';
import { SignalChart } from './components/SignalChart';
import { StatusPill } from './components/StatusPill';
import {
  alertFeed,
  analysisPhases,
  analyzedChangeSignals,
  analyzedDetections,
  analyzedInsightCards,
  analyzedMissionMetrics,
  analyzedModelStats,
  analyzedTimeline,
  changeSignals,
  detections,
  insightCards,
  layerToggles,
  missionMetrics,
  modelStats,
  pipelineSteps,
  timeline,
} from './data/dashboard';

type NavTarget = 'overview' | 'mission' | 'models' | 'pipeline';

const navItems: { id: NavTarget; label: string; detail: string }[] = [
  { id: 'mission', label: 'Mission', detail: 'Mission console selected' },
  { id: 'models', label: 'Models', detail: 'Model confidence stack selected' },
  { id: 'pipeline', label: 'Pipeline', detail: 'Operational pipeline selected' },
];

const sourceOptions = [
  {
    label: 'Landsat 8 + Drone',
    detail: '30 m public imagery paired with local drone frames.',
  },
  {
    label: 'Sentinel-2 MSI',
    detail: '10 m multispectral scene pair for vegetation and water change.',
  },
  {
    label: 'Drone Orthomosaic',
    detail: 'High-resolution orthomosaic mode for local inspection.',
  },
];

const modelDescriptions: Record<string, string> = {
  'U-Net Mask': 'Segments land-cover change into pixel-accurate change masks.',
  'YOLO Objects': 'Detects roads, roof clusters, vehicles, and construction signatures.',
  'NDVI Delta': 'Compares vegetation health and canopy-loss deltas across dates.',
  'Cloud Filter': 'Suppresses haze and cloud-contaminated false positives.',
};

const pipelineDetails: Record<string, string> = {
  Acquire: 'Catalog query, AOI clipping, scene selection, and drone upload intake are ready.',
  Register: 'CRS alignment, resampling, raster bounds checks, and tile normalization are staged.',
  Detect: 'NDVI, NDWI, OpenCV morphology, YOLO, and U-Net passes are connected to the dashboard state.',
  Report: 'Report export creates a JSON artifact; GeoJSON export is available from the map toolbar.',
};

const mapImageUrl = `${import.meta.env.BASE_URL}assets/orbital-change-map.png`;

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [layers, setLayers] = useState(layerToggles);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to compare scene pair');
  const [lastRun, setLastRun] = useState('Awaiting analysis');
  const [lastSync, setLastSync] = useState('Not synced');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [selectedDetection, setSelectedDetection] = useState(detections[0].label);
  const [activeNav, setActiveNav] = useState<NavTarget>('overview');
  const [focusedSection, setFocusedSection] = useState<NavTarget | null>(null);
  const [selectedSignal, setSelectedSignal] = useState(changeSignals[0].name);
  const [selectedModel, setSelectedModel] = useState(modelStats[0].name);
  const [selectedInsight, setSelectedInsight] = useState(insightCards[0].title);
  const [selectedPipeline, setSelectedPipeline] = useState(pipelineSteps[0].title);
  const [mapStatus, setMapStatus] = useState('Map ready: click a layer, finding, or tool.');

  const timers = useRef<number[]>([]);
  const noticeTimer = useRef<number | null>(null);
  const focusTimer = useRef<number | null>(null);

  const activeMetrics = isAnalyzed ? analyzedMissionMetrics : missionMetrics;
  const activeDetections = isAnalyzed ? analyzedDetections : detections;
  const activeSignals = isAnalyzed ? analyzedChangeSignals : changeSignals;
  const activeModels = isAnalyzed ? analyzedModelStats : modelStats;
  const activeTimeline = isAnalyzed ? analyzedTimeline : timeline;
  const activeInsights = isAnalyzed ? analyzedInsightCards : insightCards;
  const dataSource = sourceOptions[sourceIndex];
  const activeLayerNames = useMemo(
    () => layers.filter((layer) => layer.active).map((layer) => layer.label),
    [layers],
  );
  const confidence = isRunning ? `${Math.max(progress, 12)}%` : isAnalyzed ? '98.1%' : '96.4%';
  const selectedModelScore = activeModels.find((model) => model.name === selectedModel)?.score ?? activeModels[0].score;
  const selectedPipelineDetail = pipelineDetails[selectedPipeline] ?? pipelineDetails.Acquire;

  const heroStyle = {
    '--orbital-map-url': `url("${mapImageUrl}")`,
  } as CSSProperties;

  const showNotice = (message: string) => {
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const clearRunTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const goToSection = (id: NavTarget, detail?: string) => {
    const target = document.getElementById(id);
    setActiveNav(id);
    setFocusedSection(id);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (focusTimer.current) {
      window.clearTimeout(focusTimer.current);
    }
    focusTimer.current = window.setTimeout(() => setFocusedSection(null), 1600);

    if (detail) {
      setStatusMessage(detail);
      showNotice(detail);
    }
  };

  const handleNav = (event: MouseEvent<HTMLAnchorElement>, id: NavTarget, detail: string) => {
    event.preventDefault();
    window.history.replaceState(null, '', `#${id}`);
    goToSection(id, detail);
  };

  useEffect(() => {
    return () => {
      clearRunTimers();
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
      if (focusTimer.current) {
        window.clearTimeout(focusTimer.current);
      }
    };
  }, []);

  const handleDetectionSelect = (label: string) => {
    setSelectedDetection(label);
    setMapStatus(`${label} selected for inspection.`);
    showNotice(`${label} selected`);
  };

  const runAnalysis = () => {
    if (isRunning) {
      return;
    }

    clearRunTimers();
    setIsRunning(true);
    setProgress(4);
    setStatusMessage('Preparing geospatial analysis job');
    setMapStatus('Analysis running: refreshing detections and masks.');
    showNotice('Analysis started: scanning latest scene pair');

    analysisPhases.forEach((phase, index) => {
      const timer = window.setTimeout(() => {
        setProgress(phase.progress);
        setStatusMessage(phase.label);

        if (phase.progress === 100) {
          setIsRunning(false);
          setIsAnalyzed(true);
          setLastRun(formatClock(new Date()));
          setSelectedDetection(analyzedDetections[0].label);
          setSelectedSignal(analyzedChangeSignals[0].name);
          setSelectedModel(analyzedModelStats[0].name);
          setSelectedInsight(analyzedInsightCards[0].title);
          setMapStatus('Analysis complete: five change zones are active.');
          showNotice('Analysis complete: change zones updated');
        }
      }, 650 * (index + 1));

      timers.current.push(timer);
    });
  };

  const syncImagery = () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    setStatusMessage('Connecting to imagery catalog');
    showNotice('Syncing public satellite and drone metadata');

    const timer = window.setTimeout(() => {
      const now = formatClock(new Date());
      setIsSyncing(false);
      setLastSync(now);
      setStatusMessage(`${dataSource.label} metadata loaded`);
      showNotice(`Imagery synced at ${now}`);
    }, 1200);

    timers.current.push(timer);
  };

  const selectSource = (index: number) => {
    setSourceIndex(index);
    setShowSourceMenu(false);
    setStatusMessage(`${sourceOptions[index].label} selected`);
    showNotice(`Source switched to ${sourceOptions[index].label}`);
  };

  const toggleLayer = (label: string) => {
    setLayers((currentLayers) => {
      const updatedLayers = currentLayers.map((layer) =>
        layer.label === label ? { ...layer, active: !layer.active } : layer,
      );
      const toggled = updatedLayers.find((layer) => layer.label === label);
      const state = toggled?.active ? 'enabled' : 'disabled';
      setMapStatus(`${label} layer ${state}.`);
      showNotice(`${label} layer ${state}`);
      return updatedLayers;
    });
  };

  const selectSignal = (name: string) => {
    const signal = activeSignals.find((item) => item.name === name);
    setSelectedSignal(name);
    setStatusMessage(`${name} signal selected`);
    showNotice(`${name}: ${signal?.value ?? 'signal selected'}`);
  };

  const selectModel = (name: string) => {
    const model = activeModels.find((item) => item.name === name);
    setSelectedModel(name);
    setStatusMessage(`${name} model selected`);
    showNotice(`${name} confidence ${model?.score ?? 0}%`);
  };

  const selectInsight = (title: string) => {
    setSelectedInsight(title);
    setStatusMessage(`${title} insight opened`);
    showNotice(`${title} insight opened`);
  };

  const selectPipeline = (title: string) => {
    setSelectedPipeline(title);
    setStatusMessage(`${title} pipeline stage opened`);
    showNotice(`${title} stage selected`);
  };

  const exportReport = () => {
    downloadJson(`orbital-change-report-${new Date().toISOString().slice(0, 10)}.json`, {
      project: 'Orbital Change Tracker',
      generatedAt: new Date().toISOString(),
      status: isAnalyzed ? 'analysis_complete' : 'baseline_snapshot',
      region: 'Amazon Basin Delta',
      source: dataSource.label,
      confidence,
      lastRun,
      lastSync,
      activeLayers: activeLayerNames,
      selectedDetection,
      selectedSignal,
      selectedModel,
      selectedPipeline,
      metrics: activeMetrics,
      changeSignals: activeSignals,
      detections: activeDetections,
      modelStats: activeModels,
      timeline: activeTimeline,
      nextSteps: [
        'Validate high-priority polygons with field imagery.',
        'Export GeoJSON zones to a GIS workspace.',
        'Run the Python Rasterio/OpenCV pipeline on real GeoTIFF scene pairs.',
      ],
    });
    setStatusMessage('Report exported to JSON');
    showNotice('Report downloaded');
  };

  const exportGeoJson = () => {
    downloadJson(`change-zones-${new Date().toISOString().slice(0, 10)}.geojson`, {
      type: 'FeatureCollection',
      name: 'orbital_change_zones',
      features: activeDetections.map((detection, index) => ({
        type: 'Feature',
        properties: {
          id: index + 1,
          label: detection.label,
          detail: detection.detail,
          severity: detection.severity,
          score: detection.score,
        },
        geometry: {
          type: 'Point',
          coordinates: [Number((-63.2 + detection.x / 25).toFixed(5)), Number((-8.9 + detection.y / 30).toFixed(5))],
        },
      })),
    });
    setMapStatus('GeoJSON change zones exported.');
    showNotice('GeoJSON downloaded');
  };

  const handleMapAction = (action: string) => {
    if (action === 'recenter') {
      handleDetectionSelect(activeDetections[0].label);
      setMapStatus('AOI recentered on the highest-risk finding.');
      return;
    }

    if (action === 'confidence') {
      setStatusMessage(`Scene confidence ${confidence}`);
      setMapStatus(`Confidence overlay active: ${confidence}.`);
      showNotice(`Confidence overlay ${confidence}`);
      return;
    }

    if (action === 'geojson') {
      exportGeoJson();
      return;
    }

    if (action === 'thermal') {
      setLayers((currentLayers) =>
        currentLayers.map((layer) => (layer.label === 'Thermal' ? { ...layer, active: true } : layer)),
      );
      const thermalFinding =
        activeDetections.find((detection) => detection.label.toLowerCase().includes('thermal')) ?? activeDetections[0];
      handleDetectionSelect(thermalFinding.label);
      setMapStatus('Thermal boost enabled and hottest finding selected.');
    }
  };

  const handleAlertSelect = (title: string) => {
    const normalizedTitle = title.toLowerCase();
    const nextDetection =
      activeDetections.find((detection) => normalizedTitle.includes('reservoir') && detection.label.toLowerCase().includes('reservoir')) ??
      activeDetections.find((detection) => normalizedTitle.includes('settlement') && detection.label.toLowerCase().includes('settlement')) ??
      activeDetections.find((detection) => normalizedTitle.includes('canopy') && detection.label.toLowerCase().includes('clearing')) ??
      activeDetections[0];

    setShowAlerts(false);
    handleDetectionSelect(nextDetection.label);
    goToSection('mission', `${title} alert opened`);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand-lockup"
          href="#overview"
          aria-label="Orbital Change Tracker home"
          onClick={(event) => handleNav(event, 'overview', 'Overview selected')}
        >
          <span className="brand-mark">
            <Satellite size={22} />
          </span>
          <span>
            <strong>Orbital Change Tracker</strong>
            <small>Geospatial CV Console</small>
          </span>
        </a>

        <nav className="topnav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              className={activeNav === item.id ? 'active' : ''}
              href={`#${item.id}`}
              key={item.id}
              onClick={(event) => handleNav(event, item.id, item.detail)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="top-actions">
          <button
            className={`icon-button ${showAlerts ? 'is-active' : ''}`}
            type="button"
            aria-label="Alerts"
            title="Alerts"
            onClick={() => {
              setShowAlerts((current) => !current);
              showNotice(showAlerts ? 'Alerts closed' : 'Alerts opened');
            }}
          >
            <Bell size={18} />
          </button>
          <button className="primary-action" type="button" onClick={syncImagery} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="spin" size={18} /> : <CloudUpload size={18} />}
            {isSyncing ? 'Syncing' : 'Sync Imagery'}
          </button>
        </div>
      </header>

      {showAlerts && (
        <aside className="alert-drawer" aria-label="Active alert feed">
          <div className="drawer-heading">
            <div>
              <span className="eyebrow">Alert Feed</span>
              <h2>Priority Findings</h2>
            </div>
            <button className="icon-button" type="button" aria-label="Close alerts" onClick={() => setShowAlerts(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="alert-list">
            {alertFeed.map((alert) => (
              <button className="alert-item" key={alert.title} onClick={() => handleAlertSelect(alert.title)} type="button">
                <span className={`severity-dot ${alert.severity}`} />
                <div>
                  <strong>{alert.title}</strong>
                  <small>{alert.detail}</small>
                </div>
              </button>
            ))}
          </div>
        </aside>
      )}

      <section className="hero-band scroll-target" id="overview" style={heroStyle}>
        <div className="hero-copy">
          <StatusPill icon={RadioTower} label="Live orbital telemetry" tone="cyan" />
          <h1>Detect land, water, and urban change before it becomes invisible.</h1>
          <p>
            A polished portfolio system for comparing satellite scenes, drone captures,
            vegetation indices, and model-generated change masks across time.
          </p>
          <div className="hero-actions" aria-label="Mission actions">
            <button className="primary-action large" type="button" onClick={runAnalysis} disabled={isRunning}>
              {isRunning ? <Loader2 className="spin" size={19} /> : <Play size={19} />}
              {isRunning ? `Analyzing ${progress}%` : 'Run Analysis'}
            </button>
            <button className="secondary-action large" type="button" onClick={exportReport}>
              <Download size={19} />
              Export Report
            </button>
          </div>
          <div className="analysis-status" aria-live="polite">
            <div className="analysis-status-row">
              <div>
                <span className="eyebrow">Analysis Engine</span>
                <strong>{statusMessage}</strong>
              </div>
              <span className="progress-value">{progress}%</span>
            </div>
            <div className="analysis-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="status-meta">
              <span>Last sync: {lastSync}</span>
              <span>Last run: {lastRun}</span>
              <span>Source: {dataSource.label}</span>
            </div>
          </div>
        </div>

        <div
          className={`mission-console scroll-target ${focusedSection === 'mission' ? 'section-focus' : ''}`}
          id="mission"
          aria-label="Current mission console"
        >
          <div className="console-header">
            <div>
              <span className="eyebrow">Region</span>
              <strong>Amazon Basin Delta</strong>
            </div>
            <div className="source-menu">
              <button
                className="select-button"
                type="button"
                aria-expanded={showSourceMenu}
                aria-haspopup="listbox"
                onClick={() => setShowSourceMenu((current) => !current)}
              >
                {dataSource.label} <ChevronDown size={16} />
              </button>
              {showSourceMenu && (
                <div className="source-list" role="listbox" aria-label="Imagery source">
                  {sourceOptions.map((source, index) => (
                    <button
                      className={index === sourceIndex ? 'selected' : ''}
                      key={source.label}
                      onClick={() => selectSource(index)}
                      role="option"
                      type="button"
                      aria-selected={index === sourceIndex}
                    >
                      <strong>{source.label}</strong>
                      <small>{source.detail}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mission-grid">
            {activeMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Change intelligence dashboard">
        <DetectionMap
          activeLayers={activeLayerNames}
          detections={activeDetections}
          imageSrc={mapImageUrl}
          layers={layers}
          mapStatus={mapStatus}
          selectedDetection={selectedDetection}
          onMapAction={handleMapAction}
          onSelectDetection={handleDetectionSelect}
          onToggleLayer={toggleLayer}
        />

        <aside className="command-stack" aria-label="Command stack">
          <section className="panel compact-panel">
            <div className="panel-heading">
              <StatusPill icon={ScanLine} label="Scene pair" tone="green" />
              <span className="confidence">{confidence}</span>
            </div>
            <div className="date-pair">
              <button type="button" onClick={() => showNotice('Baseline scene Apr 2024 selected')}>
                <CalendarDays size={17} />
                Apr 2024
              </button>
              <Route size={18} />
              <button type="button" onClick={() => showNotice('Comparison scene May 2026 selected')}>
                <CalendarDays size={17} />
                May 2026
              </button>
            </div>
            <div className="range-track" aria-label="Comparison range">
              <span style={{ width: isAnalyzed ? '91%' : '74%' }} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Change Signals</h2>
              <Sparkles size={20} />
            </div>
            <div className="signal-list">
              {activeSignals.map((signal) => (
                <button
                  className={`signal-card ${signal.tone} ${selectedSignal === signal.name ? 'selected' : ''}`}
                  key={signal.name}
                  onClick={() => selectSignal(signal.name)}
                  type="button"
                >
                  <div>
                    <span>{signal.name}</span>
                    <strong>{signal.value}</strong>
                  </div>
                  <small>{signal.detail}</small>
                </button>
              ))}
            </div>
            <div className="selection-readout">Selected signal: {selectedSignal}</div>
          </section>

          <section className={`panel model-panel scroll-target ${focusedSection === 'models' ? 'section-focus' : ''}`} id="models">
            <div className="panel-title-row">
              <h2>Model Stack</h2>
              <BrainCircuit size={20} />
            </div>
            <div className="model-stack">
              {activeModels.map((model) => (
                <button
                  className={`model-row ${selectedModel === model.name ? 'selected' : ''}`}
                  key={model.name}
                  onClick={() => selectModel(model.name)}
                  type="button"
                >
                  <span>{model.name}</span>
                  <div className="model-meter">
                    <span style={{ width: `${model.score}%` }} />
                  </div>
                  <strong>{model.score}%</strong>
                </button>
              ))}
            </div>
            <div className="selection-readout">
              {selectedModel}: {selectedModelScore}% - {modelDescriptions[selectedModel]}
            </div>
          </section>
        </aside>
      </section>

      <section className="insight-layout">
        <div className="panel timeline-panel">
          <div className="panel-title-row">
            <h2>Temporal Drift</h2>
            <Activity size={20} />
          </div>
          <SignalChart timeline={activeTimeline} />
        </div>

        <div className="insight-cards">
          {activeInsights.map((card) => {
            const Icon = card.icon;
            return (
              <button
                className={`insight-card ${card.tone} ${selectedInsight === card.title ? 'selected' : ''}`}
                key={card.title}
                onClick={() => selectInsight(card.title)}
                type="button"
              >
                <Icon size={22} />
                <span>{card.kicker}</span>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className={`pipeline-band scroll-target ${focusedSection === 'pipeline' ? 'section-focus' : ''}`} id="pipeline">
        <div className="pipeline-heading">
          <StatusPill icon={ShieldCheck} label="Operational pipeline" tone="amber" />
          <h2>From raw pixels to auditable change intelligence.</h2>
        </div>

        <div className="pipeline-grid">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                className={`pipeline-card ${selectedPipeline === step.title ? 'selected' : ''}`}
                key={step.title}
                onClick={() => selectPipeline(step.title)}
                type="button"
              >
                <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={23} />
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </button>
            );
          })}
        </div>
        <div className="pipeline-readout">
          <strong>{selectedPipeline}</strong>
          <span>{selectedPipelineDetail}</span>
        </div>
      </section>

      <footer className="footer-strip">
        <span>
          <CheckCircle2 size={17} />
          Interactive run, sync, layer, alert, nav, and export controls
        </span>
        <span>
          <Globe2 size={17} />
          CRS-aware raster workflow
        </span>
        <span>
          <DatabaseZap size={17} />
          GeoTIFF, NDVI, NDWI, YOLO, U-Net
        </span>
        <span>
          <Target size={17} />
          Portfolio-ready GitHub project
        </span>
      </footer>

      {notice && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
    </main>
  );
}

export default App;
