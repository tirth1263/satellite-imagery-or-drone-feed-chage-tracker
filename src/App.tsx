import {
  Activity,
  Bell,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  CloudUpload,
  Crosshair,
  DatabaseZap,
  Download,
  Eye,
  Gauge,
  Globe2,
  Layers3,
  MapPinned,
  Play,
  Radar,
  RadioTower,
  Route,
  Satellite,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Waves,
  Zap,
} from 'lucide-react';
import './App.css';
import { DetectionMap } from './components/DetectionMap';
import { MetricCard } from './components/MetricCard';
import { SignalChart } from './components/SignalChart';
import { StatusPill } from './components/StatusPill';
import {
  changeSignals,
  detections,
  insightCards,
  layerToggles,
  missionMetrics,
  modelStats,
  pipelineSteps,
  timeline,
} from './data/dashboard';

function App() {
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
          <button className="icon-button" type="button" aria-label="Alerts" title="Alerts">
            <Bell size={18} />
          </button>
          <button className="primary-action" type="button">
            <CloudUpload size={18} />
            Sync Imagery
          </button>
        </div>
      </header>

      <section className="hero-band" id="overview">
        <div className="hero-copy">
          <StatusPill icon={RadioTower} label="Live orbital telemetry" tone="cyan" />
          <h1>Detect land, water, and urban change before it becomes invisible.</h1>
          <p>
            A polished portfolio system for comparing satellite scenes, drone captures,
            vegetation indices, and model-generated change masks across time.
          </p>
          <div className="hero-actions" aria-label="Mission actions">
            <button className="primary-action large" type="button">
              <Play size={19} />
              Run Analysis
            </button>
            <button className="secondary-action large" type="button">
              <Download size={19} />
              Export Report
            </button>
          </div>
        </div>

        <div className="mission-console" id="mission" aria-label="Current mission console">
          <div className="console-header">
            <div>
              <span className="eyebrow">Region</span>
              <strong>Amazon Basin Delta</strong>
            </div>
            <button className="select-button" type="button">
              Landsat 8 + Drone <ChevronDown size={16} />
            </button>
          </div>

          <div className="mission-grid">
            {missionMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Change intelligence dashboard">
        <DetectionMap detections={detections} layers={layerToggles} />

        <aside className="command-stack" aria-label="Command stack">
          <section className="panel compact-panel">
            <div className="panel-heading">
              <StatusPill icon={ScanLine} label="Scene pair" tone="green" />
              <span className="confidence">96.4%</span>
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
              <span style={{ width: '74%' }} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Change Signals</h2>
              <Sparkles size={20} />
            </div>
            <div className="signal-list">
              {changeSignals.map((signal) => (
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
              {modelStats.map((model) => (
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
          <SignalChart timeline={timeline} />
        </div>

        <div className="insight-cards">
          {insightCards.map((card) => {
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
    </main>
  );
}

export default App;
