import {
  Activity,
  CloudRain,
  DatabaseZap,
  Flame,
  ScanSearch,
  ShieldAlert,
  Trees,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Severity = 'hot' | 'warn' | 'cool';
export type SignalTone = 'red' | 'amber' | 'green';
export type InsightTone = 'cyan' | 'green' | 'amber' | 'red';

export type MissionMetric = {
  label: string;
  value: string;
  detail: string;
};

export type LayerToggle = {
  label: string;
  active: boolean;
};

export type Detection = {
  label: string;
  detail: string;
  severity: Severity;
  x: number;
  y: number;
  score: string;
};

export type ChangeSignal = {
  name: string;
  value: string;
  detail: string;
  tone: SignalTone;
};

export type ModelStat = {
  name: string;
  score: number;
};

export type TimelineItem = {
  month: string;
  value: number;
};

export type InsightCard = {
  icon: LucideIcon;
  kicker: string;
  title: string;
  copy: string;
  tone: InsightTone;
};

export const missionMetrics: MissionMetric[] = [
  {
    label: 'Area Scanned',
    value: '4,820 km2',
    detail: '14 aligned raster tiles',
  },
  {
    label: 'Change Mask',
    value: '18.7%',
    detail: 'Pixels above confidence threshold',
  },
  {
    label: 'Processing',
    value: '3.6 min',
    detail: 'GPU-assisted U-Net inference',
  },
  {
    label: 'Alerts',
    value: '27',
    detail: 'Verified high-priority zones',
  },
];

export const analyzedMissionMetrics: MissionMetric[] = [
  {
    label: 'Area Scanned',
    value: '5,146 km2',
    detail: '18 aligned raster tiles processed',
  },
  {
    label: 'Change Mask',
    value: '24.9%',
    detail: 'Pixels above dynamic threshold',
  },
  {
    label: 'Processing',
    value: '2.8 min',
    detail: 'Simulated GPU-assisted inference',
  },
  {
    label: 'Alerts',
    value: '34',
    detail: '12 high-priority zones escalated',
  },
];

export const layerToggles: LayerToggle[] = [
  { label: 'NDVI', active: true },
  { label: 'NDWI', active: true },
  { label: 'Urban', active: false },
  { label: 'Thermal', active: true },
];

export const detections: Detection[] = [
  {
    label: 'Canopy loss',
    detail: 'Fragmented forest edge detected',
    severity: 'hot',
    x: 64,
    y: 36,
    score: '91%',
  },
  {
    label: 'Reservoir shift',
    detail: 'Water boundary receded',
    severity: 'warn',
    x: 42,
    y: 62,
    score: '84%',
  },
  {
    label: 'New settlement',
    detail: 'Road grid expansion found',
    severity: 'cool',
    x: 73,
    y: 69,
    score: '78%',
  },
  {
    label: 'Burn scar',
    detail: 'Spectral anomaly expanded',
    severity: 'hot',
    x: 31,
    y: 31,
    score: '88%',
  },
];

export const analyzedDetections: Detection[] = [
  {
    label: 'Illegal clearing surge',
    detail: 'New exposed soil corridor crossed threshold',
    severity: 'hot',
    x: 58,
    y: 30,
    score: '97%',
  },
  {
    label: 'Reservoir drawdown',
    detail: 'Southern shoreline pulled back 420 m',
    severity: 'warn',
    x: 39,
    y: 58,
    score: '90%',
  },
  {
    label: 'Road extension',
    detail: 'Linear high-reflectance corridor appeared',
    severity: 'cool',
    x: 77,
    y: 67,
    score: '86%',
  },
  {
    label: 'Thermal anomaly',
    detail: 'Burn scar signature intensified after haze filter',
    severity: 'hot',
    x: 28,
    y: 34,
    score: '93%',
  },
  {
    label: 'New roof cluster',
    detail: 'YOLO pass found compact settlement growth',
    severity: 'cool',
    x: 69,
    y: 48,
    score: '82%',
  },
];

export const changeSignals: ChangeSignal[] = [
  {
    name: 'Deforestation',
    value: '+12.8 km2',
    detail: 'Canopy index dropped across 9 clusters',
    tone: 'red',
  },
  {
    name: 'Water Level',
    value: '-8.4%',
    detail: 'Reservoir outline contracted from baseline',
    tone: 'amber',
  },
  {
    name: 'Urban Sprawl',
    value: '+17.3%',
    detail: 'New high-reflectance surfaces detected',
    tone: 'green',
  },
];

export const analyzedChangeSignals: ChangeSignal[] = [
  {
    name: 'Deforestation',
    value: '+18.6 km2',
    detail: 'NDVI collapse clustered around 14 road-adjacent parcels',
    tone: 'red',
  },
  {
    name: 'Water Level',
    value: '-12.1%',
    detail: 'NDWI mask shows stronger contraction after cloud screening',
    tone: 'amber',
  },
  {
    name: 'Urban Sprawl',
    value: '+21.4%',
    detail: 'YOLO and RGB delta found 6 new structure clusters',
    tone: 'green',
  },
];

export const modelStats: ModelStat[] = [
  { name: 'U-Net Mask', score: 94 },
  { name: 'YOLO Objects', score: 87 },
  { name: 'NDVI Delta', score: 91 },
  { name: 'Cloud Filter', score: 96 },
];

export const analyzedModelStats: ModelStat[] = [
  { name: 'U-Net Mask', score: 97 },
  { name: 'YOLO Objects', score: 91 },
  { name: 'NDVI Delta', score: 95 },
  { name: 'Cloud Filter', score: 98 },
];

export const timeline: TimelineItem[] = [
  { month: 'Jun', value: 34 },
  { month: 'Jul', value: 42 },
  { month: 'Aug', value: 57 },
  { month: 'Sep', value: 49 },
  { month: 'Oct', value: 61 },
  { month: 'Nov', value: 73 },
  { month: 'Dec', value: 65 },
  { month: 'Jan', value: 81 },
  { month: 'Feb', value: 76 },
  { month: 'Mar', value: 88 },
  { month: 'Apr', value: 92 },
  { month: 'May', value: 79 },
];

export const analyzedTimeline: TimelineItem[] = [
  { month: 'Jun', value: 41 },
  { month: 'Jul', value: 48 },
  { month: 'Aug', value: 64 },
  { month: 'Sep', value: 58 },
  { month: 'Oct', value: 69 },
  { month: 'Nov', value: 82 },
  { month: 'Dec', value: 74 },
  { month: 'Jan', value: 86 },
  { month: 'Feb', value: 81 },
  { month: 'Mar', value: 92 },
  { month: 'Apr', value: 96 },
  { month: 'May', value: 89 },
];

export const insightCards: InsightCard[] = [
  {
    icon: Trees,
    kicker: 'Vegetation',
    title: 'Edge fragmentation rising',
    copy: 'NDVI deltas concentrate around access roads and recently cleared parcels.',
    tone: 'green',
  },
  {
    icon: Waves,
    kicker: 'Hydrology',
    title: 'Reservoir contraction',
    copy: 'NDWI mask shows shoreline recession in the southern inlet and east bank.',
    tone: 'cyan',
  },
  {
    icon: ShieldAlert,
    kicker: 'Risk',
    title: 'Priority zones ready',
    copy: 'High-confidence clusters are grouped for field review and audit export.',
    tone: 'red',
  },
  {
    icon: CloudRain,
    kicker: 'Quality',
    title: 'Cloud interference low',
    copy: 'Scene pair passed cloud screening with haze-normalized comparison bands.',
    tone: 'amber',
  },
];

export const analyzedInsightCards: InsightCard[] = [
  {
    icon: Trees,
    kicker: 'Vegetation',
    title: 'Clearing accelerated',
    copy: 'The newest run raised canopy-loss confidence and grouped adjacent parcels.',
    tone: 'red',
  },
  {
    icon: Waves,
    kicker: 'Hydrology',
    title: 'Water stress confirmed',
    copy: 'NDWI and RGB deltas agree on a larger reservoir contraction zone.',
    tone: 'cyan',
  },
  {
    icon: ShieldAlert,
    kicker: 'Risk',
    title: '12 urgent zones',
    copy: 'High-priority findings are ready for field validation and export.',
    tone: 'amber',
  },
  {
    icon: CloudRain,
    kicker: 'Quality',
    title: 'Scene quality strong',
    copy: 'Cloud filter improved to 98%, reducing false positives across the pair.',
    tone: 'green',
  },
];

export const pipelineSteps = [
  {
    icon: DatabaseZap,
    title: 'Acquire',
    copy: 'Pull public scenes from Earth Engine, Sentinel, Landsat, or a drone orthomosaic.',
  },
  {
    icon: ScanSearch,
    title: 'Register',
    copy: 'Align coordinate reference systems, clip an AOI, resample bands, and normalize tiles.',
  },
  {
    icon: Activity,
    title: 'Detect',
    copy: 'Run NDVI, NDWI, OpenCV masks, YOLO detections, or U-Net semantic segmentation.',
  },
  {
    icon: Flame,
    title: 'Report',
    copy: 'Export raster masks, GeoJSON zones, dashboard metrics, and a stakeholder summary.',
  },
];

export const analysisPhases = [
  { progress: 12, label: 'Authenticating imagery catalog' },
  { progress: 28, label: 'Aligning CRS and raster footprints' },
  { progress: 46, label: 'Computing NDVI and NDWI deltas' },
  { progress: 63, label: 'Running U-Net semantic mask' },
  { progress: 81, label: 'Scoring YOLO settlement detections' },
  { progress: 100, label: 'Packaging change zones and report' },
];

export const alertFeed = [
  {
    title: 'Canopy loss anomaly',
    detail: 'High-priority clearing zone detected near access road cluster.',
    severity: 'hot' as Severity,
  },
  {
    title: 'Reservoir boundary shift',
    detail: 'Waterline retreat increased after current scene comparison.',
    severity: 'warn' as Severity,
  },
  {
    title: 'New settlement cluster',
    detail: 'Object detector found compact roof signatures in the east grid.',
    severity: 'cool' as Severity,
  },
];
