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

export const missionMetrics = [
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

export const layerToggles = [
  { label: 'NDVI', active: true },
  { label: 'NDWI', active: true },
  { label: 'Urban', active: false },
  { label: 'Thermal', active: true },
];

export const detections = [
  {
    label: 'Canopy loss',
    detail: 'Fragmented forest edge detected',
    severity: 'hot' as const,
    x: 64,
    y: 36,
    score: '91%',
  },
  {
    label: 'Reservoir shift',
    detail: 'Water boundary receded',
    severity: 'warn' as const,
    x: 42,
    y: 62,
    score: '84%',
  },
  {
    label: 'New settlement',
    detail: 'Road grid expansion found',
    severity: 'cool' as const,
    x: 73,
    y: 69,
    score: '78%',
  },
  {
    label: 'Burn scar',
    detail: 'Spectral anomaly expanded',
    severity: 'hot' as const,
    x: 31,
    y: 31,
    score: '88%',
  },
];

export const changeSignals = [
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

export const modelStats = [
  { name: 'U-Net Mask', score: 94 },
  { name: 'YOLO Objects', score: 87 },
  { name: 'NDVI Delta', score: 91 },
  { name: 'Cloud Filter', score: 96 },
];

export const timeline = [
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

export const insightCards = [
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
