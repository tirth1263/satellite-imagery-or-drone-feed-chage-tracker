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

const assetUrl = (filename: string) => `${import.meta.env.BASE_URL}assets/${filename}`;

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

const sourceOptions = [
  {
    label: 'Landsat 8 + Drone',
    region: 'Amazon Basin Delta',
    detail: '30 m public imagery paired with local drone frames.',
    image: assetUrl('orbital-change-map.png'),
    baselineMetrics: missionMetrics,
    analyzedMetrics: analyzedMissionMetrics,
    baselineDetections: detections,
    analyzedDetections,
    baselineSignals: changeSignals,
    analyzedSignals: analyzedChangeSignals,
    baselineModels: modelStats,
    analyzedModels: analyzedModelStats,
    baselineTimeline: timeline,
    analyzedTimeline,
  },
  {
    label: 'Sentinel-2 MSI',
    region: 'Sahara Urban Edge',
    detail: '10 m multispectral scene pair for desert-edge expansion.',
    image: assetUrl('desert-urban-change-map.png'),
    baselineMetrics: [
      { label: 'Area Scanned', value: '2,930 km2', detail: '11 desert-edge tiles aligned' },
      { label: 'Change Mask', value: '11.6%', detail: 'Urban and heat-risk pixels flagged' },
      { label: 'Processing', value: '2.1 min', detail: 'Sentinel-2 multispectral pass' },
      { label: 'Alerts', value: '18', detail: 'Expansion zones awaiting review' },
    ],
    analyzedMetrics: [
      { label: 'Area Scanned', value: '3,240 km2', detail: '13 Sentinel-2 tiles processed' },
      { label: 'Change Mask', value: '16.8%', detail: 'Construction and heat zones confirmed' },
      { label: 'Processing', value: '1.9 min', detail: 'Optimized urban-sprawl inference' },
      { label: 'Alerts', value: '29', detail: '9 high-priority expansion corridors' },
    ],
    baselineDetections: [
      {
        label: 'Construction bloom',
        detail: 'New high-reflectance pads near ring road',
        severity: 'hot' as const,
        x: 68,
        y: 45,
        score: '89%',
      },
      {
        label: 'Dry channel shift',
        detail: 'Seasonal wash boundary migrated east',
        severity: 'warn' as const,
        x: 38,
        y: 58,
        score: '81%',
      },
      {
        label: 'Solar farm growth',
        detail: 'Panel grid expanded into desert parcel',
        severity: 'cool' as const,
        x: 54,
        y: 32,
        score: '76%',
      },
      {
        label: 'Road corridor',
        detail: 'Linear surface change along freight route',
        severity: 'warn' as const,
        x: 77,
        y: 66,
        score: '84%',
      },
    ],
    analyzedDetections: [
      {
        label: 'Urban fringe surge',
        detail: 'New construction cells doubled near ring road',
        severity: 'hot' as const,
        x: 70,
        y: 43,
        score: '96%',
      },
      {
        label: 'Heat island growth',
        detail: 'Thermal signature spread across industrial belt',
        severity: 'hot' as const,
        x: 60,
        y: 61,
        score: '92%',
      },
      {
        label: 'Solar grid expansion',
        detail: 'Object pass found panel array growth',
        severity: 'cool' as const,
        x: 49,
        y: 29,
        score: '88%',
      },
      {
        label: 'Road extension',
        detail: 'New arterial surface detected from RGB delta',
        severity: 'warn' as const,
        x: 82,
        y: 68,
        score: '90%',
      },
      {
        label: 'Quarry scar',
        detail: 'Bare-earth extraction zone expanded',
        severity: 'warn' as const,
        x: 33,
        y: 47,
        score: '85%',
      },
    ],
    baselineSignals: [
      {
        name: 'Urban Sprawl',
        value: '+9.4%',
        detail: 'RGB delta highlights new roads and roof clusters',
        tone: 'green' as const,
      },
      {
        name: 'Surface Heat',
        value: '+7.8%',
        detail: 'Thermal layer intensified around industrial pads',
        tone: 'red' as const,
      },
      {
        name: 'Dry Wash',
        value: '-3.1%',
        detail: 'Water proxy decreased across seasonal channel',
        tone: 'amber' as const,
      },
    ],
    analyzedSignals: [
      {
        name: 'Urban Sprawl',
        value: '+15.7%',
        detail: 'YOLO found 11 new structure clusters near the fringe',
        tone: 'green' as const,
      },
      {
        name: 'Surface Heat',
        value: '+13.9%',
        detail: 'Thermal boost confirmed expanding heat island zones',
        tone: 'red' as const,
      },
      {
        name: 'Dry Wash',
        value: '-6.4%',
        detail: 'NDWI-like proxy shows stronger seasonal retreat',
        tone: 'amber' as const,
      },
    ],
    baselineModels: [
      { name: 'U-Net Mask', score: 90 },
      { name: 'YOLO Objects', score: 89 },
      { name: 'NDVI Delta', score: 78 },
      { name: 'Cloud Filter', score: 99 },
    ],
    analyzedModels: [
      { name: 'U-Net Mask', score: 94 },
      { name: 'YOLO Objects', score: 95 },
      { name: 'NDVI Delta', score: 83 },
      { name: 'Cloud Filter', score: 99 },
    ],
    baselineTimeline: [
      { month: 'Jun', value: 22 },
      { month: 'Jul', value: 29 },
      { month: 'Aug', value: 35 },
      { month: 'Sep', value: 38 },
      { month: 'Oct', value: 42 },
      { month: 'Nov', value: 47 },
      { month: 'Dec', value: 51 },
      { month: 'Jan', value: 56 },
      { month: 'Feb', value: 62 },
      { month: 'Mar', value: 68 },
      { month: 'Apr', value: 71 },
      { month: 'May', value: 74 },
    ],
    analyzedTimeline: [
      { month: 'Jun', value: 28 },
      { month: 'Jul', value: 36 },
      { month: 'Aug', value: 44 },
      { month: 'Sep', value: 51 },
      { month: 'Oct', value: 57 },
      { month: 'Nov', value: 63 },
      { month: 'Dec', value: 69 },
      { month: 'Jan', value: 74 },
      { month: 'Feb', value: 80 },
      { month: 'Mar', value: 86 },
      { month: 'Apr', value: 91 },
      { month: 'May', value: 94 },
    ],
  },
  {
    label: 'Drone Orthomosaic',
    region: 'Alpine Reservoir Corridor',
    detail: 'High-resolution orthomosaic mode for reservoir and slope inspection.',
    image: assetUrl('alpine-reservoir-change-map.png'),
    baselineMetrics: [
      { label: 'Area Scanned', value: '684 km2', detail: 'Reservoir basin and valley tiles' },
      { label: 'Change Mask', value: '14.2%', detail: 'Water edge and slope pixels flagged' },
      { label: 'Processing', value: '4.4 min', detail: 'High-res orthomosaic analysis' },
      { label: 'Alerts', value: '16', detail: 'Slope and shoreline findings' },
    ],
    analyzedMetrics: [
      { label: 'Area Scanned', value: '812 km2', detail: 'Drone mosaic plus Sentinel context' },
      { label: 'Change Mask', value: '19.5%', detail: 'Reservoir drawdown and slide zones confirmed' },
      { label: 'Processing', value: '3.7 min', detail: 'Tiled high-resolution inference' },
      { label: 'Alerts', value: '25', detail: '7 urgent water and slope zones' },
    ],
    baselineDetections: [
      {
        label: 'Reservoir edge',
        detail: 'Shoreline receded along northern basin',
        severity: 'warn' as const,
        x: 45,
        y: 48,
        score: '86%',
      },
      {
        label: 'Landslide scar',
        detail: 'Fresh exposed slope below snow line',
        severity: 'hot' as const,
        x: 63,
        y: 34,
        score: '88%',
      },
      {
        label: 'Village growth',
        detail: 'Small roof cluster expanded near valley road',
        severity: 'cool' as const,
        x: 70,
        y: 63,
        score: '74%',
      },
      {
        label: 'Snow retreat',
        detail: 'Seasonal snow mask contracted upslope',
        severity: 'warn' as const,
        x: 30,
        y: 26,
        score: '82%',
      },
    ],
    analyzedDetections: [
      {
        label: 'Reservoir drawdown',
        detail: 'Waterline pulled back across west inlet',
        severity: 'hot' as const,
        x: 43,
        y: 51,
        score: '95%',
      },
      {
        label: 'Active slide zone',
        detail: 'Slope scar widened after snowmelt',
        severity: 'hot' as const,
        x: 61,
        y: 31,
        score: '94%',
      },
      {
        label: 'Dam access route',
        detail: 'New service road detected near spillway',
        severity: 'cool' as const,
        x: 75,
        y: 56,
        score: '83%',
      },
      {
        label: 'Snowpack retreat',
        detail: 'Glacier-edge mask shifted upslope',
        severity: 'warn' as const,
        x: 29,
        y: 22,
        score: '91%',
      },
      {
        label: 'Sediment plume',
        detail: 'Turbidity signature appeared near inlet',
        severity: 'warn' as const,
        x: 50,
        y: 60,
        score: '87%',
      },
    ],
    baselineSignals: [
      {
        name: 'Water Level',
        value: '-5.9%',
        detail: 'Reservoir boundary contracted in two coves',
        tone: 'amber' as const,
      },
      {
        name: 'Slope Risk',
        value: '+4.6 km2',
        detail: 'Exposed-slope pixels increased below snow line',
        tone: 'red' as const,
      },
      {
        name: 'Settlement',
        value: '+3.2%',
        detail: 'Village footprint grew near service road',
        tone: 'green' as const,
      },
    ],
    analyzedSignals: [
      {
        name: 'Water Level',
        value: '-10.8%',
        detail: 'NDWI and drone mask agree on stronger drawdown',
        tone: 'amber' as const,
      },
      {
        name: 'Slope Risk',
        value: '+8.1 km2',
        detail: 'U-Net found new slide scars after snowmelt',
        tone: 'red' as const,
      },
      {
        name: 'Settlement',
        value: '+5.6%',
        detail: 'Object detector found new roofs near valley road',
        tone: 'green' as const,
      },
    ],
    baselineModels: [
      { name: 'U-Net Mask', score: 92 },
      { name: 'YOLO Objects', score: 84 },
      { name: 'NDVI Delta', score: 88 },
      { name: 'Cloud Filter', score: 93 },
    ],
    analyzedModels: [
      { name: 'U-Net Mask', score: 96 },
      { name: 'YOLO Objects', score: 89 },
      { name: 'NDVI Delta', score: 92 },
      { name: 'Cloud Filter', score: 95 },
    ],
    baselineTimeline: [
      { month: 'Jun', value: 48 },
      { month: 'Jul', value: 54 },
      { month: 'Aug', value: 59 },
      { month: 'Sep', value: 51 },
      { month: 'Oct', value: 45 },
      { month: 'Nov', value: 39 },
      { month: 'Dec', value: 36 },
      { month: 'Jan', value: 34 },
      { month: 'Feb', value: 40 },
      { month: 'Mar', value: 53 },
      { month: 'Apr', value: 66 },
      { month: 'May', value: 72 },
    ],
    analyzedTimeline: [
      { month: 'Jun', value: 55 },
      { month: 'Jul', value: 61 },
      { month: 'Aug', value: 68 },
      { month: 'Sep', value: 60 },
      { month: 'Oct', value: 52 },
      { month: 'Nov', value: 44 },
      { month: 'Dec', value: 41 },
      { month: 'Jan', value: 39 },
      { month: 'Feb', value: 48 },
      { month: 'Mar', value: 62 },
      { month: 'Apr', value: 78 },
      { month: 'May', value: 86 },
    ],
  },
];

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

  const dataSource = sourceOptions[sourceIndex];
  const activeMetrics = isAnalyzed ? dataSource.analyzedMetrics : dataSource.baselineMetrics;
  const activeDetections = isAnalyzed ? dataSource.analyzedDetections : dataSource.baselineDetections;
  const activeSignals = isAnalyzed ? dataSource.analyzedSignals : dataSource.baselineSignals;
  const activeModels = isAnalyzed ? dataSource.analyzedModels : dataSource.baselineModels;
  const activeTimeline = isAnalyzed ? dataSource.analyzedTimeline : dataSource.baselineTimeline;
  const activeInsights = isAnalyzed ? analyzedInsightCards : insightCards;
  const activeLayerNames = useMemo(
    () => layers.filter((layer) => layer.active).map((layer) => layer.label),
    [layers],
  );
  const confidence = isRunning ? `${Math.max(progress, 12)}%` : isAnalyzed ? '98.1%' : '96.4%';
  const selectedModelScore = activeModels.find((model) => model.name === selectedModel)?.score ?? activeModels[0].score;
  const selectedPipelineDetail = pipelineDetails[selectedPipeline] ?? pipelineDetails.Acquire;

  const heroStyle = {
    '--orbital-map-url': `url("${dataSource.image}")`,
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
          setSelectedDetection(dataSource.analyzedDetections[0].label);
          setSelectedSignal(dataSource.analyzedSignals[0].name);
          setSelectedModel(dataSource.analyzedModels[0].name);
          setSelectedInsight(analyzedInsightCards[0].title);
          setMapStatus(`${dataSource.region} analysis complete: ${dataSource.analyzedDetections.length} change zones are active.`);
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
    const nextSource = sourceOptions[index];
    const nextDetections = isAnalyzed ? nextSource.analyzedDetections : nextSource.baselineDetections;
    const nextSignals = isAnalyzed ? nextSource.analyzedSignals : nextSource.baselineSignals;
    const nextModels = isAnalyzed ? nextSource.analyzedModels : nextSource.baselineModels;

    setSourceIndex(index);
    setShowSourceMenu(false);
    setSelectedDetection(nextDetections[0].label);
    setSelectedSignal(nextSignals[0].name);
    setSelectedModel(nextModels[0].name);
    setMapStatus(`${nextSource.region} loaded with ${nextDetections.length} active findings.`);
    setStatusMessage(`${nextSource.region} scene loaded`);
    showNotice(`${nextSource.region} loaded`);
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
      region: dataSource.region,
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
              <span>Scene: {dataSource.region}</span>
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
              <strong>{dataSource.region}</strong>
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
                      <span>{source.region}</span>
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

          <div className="scene-switcher" aria-label="Scene gallery">
            {sourceOptions.map((source, index) => (
              <button
                className={index === sourceIndex ? 'selected' : ''}
                key={source.region}
                onClick={() => selectSource(index)}
                type="button"
              >
                <span className="scene-thumb" style={{ backgroundImage: `url("${source.image}")` }} />
                <span>
                  <strong>{source.region}</strong>
                  <small>{source.label}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Change intelligence dashboard">
        <DetectionMap
          activeLayers={activeLayerNames}
          detections={activeDetections}
          imageSrc={dataSource.image}
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
