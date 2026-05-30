import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
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

const sourceOptions = ['Landsat 8 + Drone', 'Sentinel-2 MSI', 'Drone Orthomosaic'];

const mapImageUrl = `${import.meta.env.BASE_URL}assets/orbital-change-map.png`;

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  const [notice, setNotice] = useState<string | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [selectedDetection, setSelectedDetection] = useState(detections[0].label);

  const timers = useRef<number[]>([]);
  const noticeTimer = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      clearRunTimers();
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  const runAnalysis = () => {
    if (isRunning) {
      return;
    }

    clearRunTimers();
    setIsRunning(true);
    setProgress(4);
    setStatusMessage('Preparing geospatial analysis job');
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
      setStatusMessage('Latest imagery metadata loaded');
      showNotice(`Imagery synced at ${now}`);
    }, 1200);

    timers.current.push(timer);
  };

  const cycleSource = () => {
    setSourceIndex((current) => {
      const next = (current + 1) % sourceOptions.length;
      showNotice(`Source switched to ${sourceOptions[next]}`);
      return next;
    });
  };

  const toggleLayer = (label: string) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.label === label ? { ...layer, active: !layer.active } : layer,
      ),
    );
  };

  const exportReport = () => {
    const report = {
      project: 'Orbital Change Tracker',
      generatedAt: new Date().toISOString(),
      status: isAnalyzed ? 'analysis_complete' : 'baseline_snapshot',
      region: 'Amazon Basin Delta',
      source: dataSource,
      confidence,
      lastRun,
      lastSync,
      activeLayers: activeLayerNames,
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
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orbital-change-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Report exported to JSON');
    showNotice('Report downloaded');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#overview" aria-label="Orbital Change Tracker home">
          <span className="brand-mark">
            <Satellite size={22} />
          </span>
          <span>
            <strong>Orbital Change Tracker</strong>
            <small>Geospatial CV Console</small>
          </span>
        </a>

        <nav className="topnav" aria-label="Primary navigation">
          <a href="#mission">Mission</a>
          <a href="#models">Models</a>
          <a href="#pipeline">Pipeline</a>
        </nav>

        <div className="top-actions">
          <button
            className={`icon-button ${showAlerts ? 'is-active' : ''}`}
            type="button"
            aria-label="Alerts"
            title="Alerts"
            onClick={() => setShowAlerts((current) => !current)}
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
              <article className="alert-item" key={alert.title}>
                <span className={`severity-dot ${alert.severity}`} />
                <div>
                  <strong>{alert.title}</strong>
                  <small>{alert.detail}</small>
                </div>
              </article>
            ))}
          </div>
        </aside>
      )}

      <section className="hero-band" id="overview" style={heroStyle}>
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
            </div>
          </div>
        </div>

        <div className="mission-console" id="mission" aria-label="Current mission console">
          <div className="console-header">
            <div>
              <span className="eyebrow">Region</span>
              <strong>Amazon Basin Delta</strong>
            </div>
            <button className="select-button" type="button" onClick={cycleSource}>
              {dataSource} <ChevronDown size={16} />
            </button>
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
          selectedDetection={selectedDetection}
          onSelectDetection={setSelectedDetection}
          onToggleLayer={toggleLayer}
        />

        <aside className="command-stack" aria-label="Command stack">
          <section className="panel compact-panel">
            <div className="panel-heading">
              <StatusPill icon={ScanLine} label="Scene pair" tone="green" />
              <span className="confidence">{confidence}</span>
            </div>
            <div className="date-pair">
              <span>
                <CalendarDays size={17} />
                Apr 2024
              </span>
              <Route size={18} />
              <span>
                <CalendarDays size={17} />
                May 2026
              </span>
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
                <article className={`signal-card ${signal.tone}`} key={signal.name}>
                  <div>
                    <span>{signal.name}</span>
                    <strong>{signal.value}</strong>
                  </div>
                  <small>{signal.detail}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Model Stack</h2>
              <BrainCircuit size={20} />
            </div>
            <div className="model-stack" id="models">
              {activeModels.map((model) => (
                <div className="model-row" key={model.name}>
                  <span>{model.name}</span>
                  <div className="model-meter">
                    <span style={{ width: `${model.score}%` }} />
                  </div>
                  <strong>{model.score}%</strong>
                </div>
              ))}
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
              <article className={`insight-card ${card.tone}`} key={card.title}>
                <Icon size={22} />
                <span>{card.kicker}</span>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pipeline-band" id="pipeline">
        <div className="pipeline-heading">
          <StatusPill icon={ShieldCheck} label="Operational pipeline" tone="amber" />
          <h2>From raw pixels to auditable change intelligence.</h2>
        </div>

        <div className="pipeline-grid">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article className="pipeline-card" key={step.title}>
                <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={23} />
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="footer-strip">
        <span>
          <CheckCircle2 size={17} />
          Interactive run, sync, layer, and export controls
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
