export type OperatingMode = 'case_study' | 'general';

export interface FeedstockProperties {
  id: string;
  name: string;
  moistureContentPct: number; // e.g. 85%
  sugarBrix: number; // e.g. 12.5 °Brix
  tanninContentPct: number; // e.g. 0.38%
  densityKgM3: number; // e.g. 1048 kg/m3
  viscosityPaS: number; // e.g. 0.0018 Pa s
  pressExtractionEfficiency: number; // 0 to 1 (e.g. 0.76)
  insolubleFibrePct: number; // e.g. 15%
}

export interface FlocculantModule {
  id: string;
  name: string;
  flocDiameterMicrons: number; // d in microns (e.g. 120)
  flocDensityKgM3: number; // rho_p in kg/m3 (e.g. 1150)
  typicalDosageGPerL: number; // g/L
  description: string;
  validatedCrop?: string;
}

export interface ThermalTreatmentModule {
  id: string;
  name: string;
  temperatureC: number;
  residenceTimeMin: number;
  description: string;
}

export interface ProductSpecModule {
  id: string;
  name: string;
  targetSyrupBrix: number; // e.g. 65 °Brix
  targetFlourMoisturePct: number; // e.g. 8%
  description: string;
}

export interface ReactorResults {
  temperatureC: number;
  residenceTimeMin: number;
  heatingDutykW: number; // kW
  warmupTimeMin: number; // min
  vesselVolumeL: number; // Liters
  agitatorPowerkW: number; // kW
}

export interface ClarifierResults {
  settlingVelocityMPerS: number; // v_t in m/s
  settlingVelocityMmPerS: number; // v_t in mm/s
  requiredSurfaceAreaM2: number; // Area m2
  diameterM: number; // Diameter m
  coneHeightM: number; // Cone height m
  totalHeightM: number; // Total height m
  totalVolumeM3: number; // Volume m3
  tanninRemovalPct: number;
}

export interface EvaporatorResults {
  operatingPressureBar: number;
  boilingPointC: number;
  feedFlowKgH: number;
  feedBrix: number;
  targetBrix: number;
  syrupOutputKgH: number;
  waterRemovalKgH: number;
  heatDutykW: number; // kW
  heatTransferAreaM2: number; // m2
}

export interface DryerResults {
  initialMoisturePct: number;
  targetMoisturePct: number;
  pressCakeFeedKgH: number;
  flourOutputKgH: number;
  waterRemovedKgH: number;
  dryingTimeMin: number;
  tunnelLengthM: number; // m
  totalHeatingDutykW: number; // kW
  kConstant: number;
  nConstant: number;
}

export interface SolarSystemState {
  collectorAreaM2: number;
  irradianceWPerM2: number; // W/m2
  collectorEfficiency: number; // 0 to 1
  solarDutykW: number; // kW heat supplied by solar
  solarFractionPct: number; // % of dryer duty met by solar
  backupFuelDutykW: number; // Diesel/grid backup heat kW
  hourlyFuelCostSavedUSD: number;
  hourlyCO2AvoidedKg: number;
}

export interface CalibrationParameterSet {
  pressEfficiency: number; // 0.60 to 0.85
  dryingK: number; // 0.010 to 0.030
  dryingN: number; // 0.60 to 0.95
  evapRateFactor: number; // 0.80 to 1.20
}

export interface CalibrationIteration {
  iteration: number;
  variancePct: number;
  parameters: CalibrationParameterSet;
  simulatedJuiceYieldPct: number;
  simulatedFlourYieldPct: number;
}

export interface TEAResults {
  syrupRevenueUSDH: number;
  flourRevenueUSDH: number;
  totalProductValueUSDH: number;
  annualRevenueUSD: number; // 6000 hrs/yr
  annualFXSavingsUSD: number;
  annualFXSavingsNGN: number; // NGN 1550/USD
  displacedImportSyrupUSD: number;
  displacedImportFibreUSD: number;
  estimatedCapexUSD: number;
  estimatedOpexUSDYear: number;
  grossMarginPct: number;
  paybackPeriodYears: number;
}

export interface CompleteModelOutput {
  feedRateKgH: number;
  juiceFlowKgH: number;
  bagasseFlowKgH: number;
  clarifiedJuiceKgH: number;
  sludgeKgH: number;
  reactor: ReactorResults;
  clarifier: ClarifierResults;
  evaporator: EvaporatorResults;
  dryer: DryerResults;
  solar: SolarSystemState;
  tea: TEAResults;
  overallWaterRecoveryPct: number;
  totalEnergykW: number;
}
