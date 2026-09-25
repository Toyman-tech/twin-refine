import { FeedstockProperties } from '../types';

export const FEEDSTOCK_PRESETS: FeedstockProperties[] = [
  {
    id: 'cashew_apple',
    name: 'Cashew Apple (Anacardium occidentale) — U-Ilorin Validated',
    moistureContentPct: 85.2,
    sugarBrix: 12.4,
    tanninContentPct: 0.38,
    densityKgM3: 1048,
    viscosityPaS: 0.0018, // 1.8 mPa s
    pressExtractionEfficiency: 0.76, // 76.0% bench yield
    insolubleFibrePct: 14.8,
  },
  {
    id: 'pineapple_waste',
    name: 'Pineapple Peel & Core Waste (Ananas comosus)',
    moistureContentPct: 88.1,
    sugarBrix: 10.8,
    tanninContentPct: 0.12,
    densityKgM3: 1038,
    viscosityPaS: 0.0015,
    pressExtractionEfficiency: 0.72,
    insolubleFibrePct: 11.9,
  },
  {
    id: 'mango_peel_pulp',
    name: 'Mango Peel & Residual Pulp (Mangifera indica)',
    moistureContentPct: 82.5,
    sugarBrix: 14.5,
    tanninContentPct: 0.42,
    densityKgM3: 1055,
    viscosityPaS: 0.0026,
    pressExtractionEfficiency: 0.68,
    insolubleFibrePct: 17.5,
  },
  {
    id: 'cassava_bagasse',
    name: 'Cassava Starch Bagasse / Ampas (Manihot esculenta)',
    moistureContentPct: 70.0,
    sugarBrix: 4.8,
    tanninContentPct: 0.04,
    densityKgM3: 1062,
    viscosityPaS: 0.0032,
    pressExtractionEfficiency: 0.64,
    insolubleFibrePct: 30.0,
  }
];
