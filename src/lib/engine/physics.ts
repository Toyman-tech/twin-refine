import {
  FeedstockProperties,
  FlocculantModule,
  ThermalTreatmentModule,
  ProductSpecModule,
  CompleteModelOutput,
  CalibrationParameterSet,
  ReactorResults,
  ClarifierResults,
  EvaporatorResults,
  DryerResults,
} from '../types';
import { calculateSolarState } from './solar';
import { calculateTEAEconomics } from './tea';

export function runPhysicsModel(
  feedRateKgH: number,
  feedstock: FeedstockProperties,
  flocculant: FlocculantModule,
  treatment: ThermalTreatmentModule,
  productSpec: ProductSpecModule,
  params: CalibrationParameterSet,
  collectorAreaM2: number = 35,
  irradianceWPerM2: number = 750
): CompleteModelOutput {
  // Apply calibrated press efficiency
  const pressEfficiency = params.pressEfficiency;

  // 1. Mass Balance Split at Mechanical Pressing
  const juiceFlowKgH = feedRateKgH * pressEfficiency;
  const bagasseFlowKgH = feedRateKgH * (1 - pressEfficiency);

  // 2. Unit Operation 1: Agitated Hydrothermal Reactor
  const density = feedstock.densityKgM3;
  const Cp = 3.85; // kJ/kg K
  const TempIn = 25; // deg C
  const TempSet = treatment.temperatureC;
  const residenceTimeMin = treatment.residenceTimeMin;

  const volumetricFlowM3H = juiceFlowKgH / density;
  const vesselVolumeM3 = volumetricFlowM3H * (residenceTimeMin / 60) * 1.35; // 35% head space factor
  const vesselVolumeL = Math.max(10, vesselVolumeM3 * 1000);

  // Heating Duty (kW)
  const heatingDutykW = (juiceFlowKgH * Cp * (TempSet - TempIn)) / 3600;
  const warmupTimeMin = (vesselVolumeM3 * density * Cp * (TempSet - TempIn)) / (Math.max(heatingDutykW * 1.2, 0.5) * 60);
  const agitatorPowerkW = Math.max(0.1, 0.45 * (vesselVolumeL / 1000));

  const reactor: ReactorResults = {
    temperatureC: TempSet,
    residenceTimeMin,
    heatingDutykW,
    warmupTimeMin,
    vesselVolumeL,
    agitatorPowerkW,
  };

  // 3. Unit Operation 2: Gravity Clarifier (Stokes' Law)
  // v_t = (g * d^2 * (rho_p - rho_f)) / (18 * mu)
  const g = 9.81; // m/s^2
  const dMeters = flocculant.flocDiameterMicrons * 1e-6; // convert microns to meters
  const rho_p = flocculant.flocDensityKgM3;
  const rho_f = feedstock.densityKgM3;
  const mu = feedstock.viscosityPaS; // Pa s

  // Calculate terminal settling velocity
  const deltaRho = Math.max(1, rho_p - rho_f);
  const settlingVelocityMPerS = (g * Math.pow(dMeters, 2) * deltaRho) / (18 * mu);
  const settlingVelocityMmPerS = settlingVelocityMPerS * 1000;

  // Volumetric flow m3/s
  const volumetricFlowM3S = volumetricFlowM3H / 3600;
  // Surface area A = Q / v_t
  const requiredSurfaceAreaM2 = Math.max(0.05, volumetricFlowM3S / settlingVelocityMPerS);
  const diameterM = Math.sqrt((4 * requiredSurfaceAreaM2) / Math.PI);
  const coneHeightM = 0.5 * diameterM;
  const totalHeightM = 1.5 * diameterM;
  const totalVolumeM3 = requiredSurfaceAreaM2 * (totalHeightM - coneHeightM / 3);

  const tanninRemovalPct = flocculant.id === 'none_gravitational' ? 42.0 : 91.5;

  const clarifier: ClarifierResults = {
    settlingVelocityMPerS,
    settlingVelocityMmPerS,
    requiredSurfaceAreaM2,
    diameterM,
    coneHeightM,
    totalHeightM,
    totalVolumeM3,
    tanninRemovalPct,
  };

  // 4. Unit Operation 3: Vacuum Evaporator
  const operatingPressureBar = 0.3; // 0.3 bar standard case study
  const sludgeKgH = juiceFlowKgH * (feedstock.tanninContentPct / 100) * (tanninRemovalPct / 100);
  const clarifiedJuiceKgH = juiceFlowKgH - sludgeKgH;

  const feedBrix = feedstock.sugarBrix;
  const targetBrix = productSpec.targetSyrupBrix;

  // Evaporation Factor adjusted by calibration
  const evapFactor = params.evapRateFactor;
  const solidsFlowKgH = clarifiedJuiceKgH * (feedBrix / 100);
  const syrupOutputKgH = Math.min(clarifiedJuiceKgH, solidsFlowKgH / (targetBrix / 100));
  const waterRemovalKgH = (clarifiedJuiceKgH - syrupOutputKgH) * evapFactor;

  // Boiling point elevation correlation
  const BPE = 0.005 * Math.pow(targetBrix, 1.45);
  // Boiling point of water at 0.3 bar is approx 69.1 °C
  const boilingPointC = 69.1 + BPE;

  const latentHeatkJPerKg = 2335; // kJ/kg at 0.3 bar
  const heatDutykW = (waterRemovalKgH * latentHeatkJPerKg) / 3600;

  // U = 1.8 kW/(m2 K), LMTD = 24 K
  const U = 1.8;
  const LMTD = 24.0;
  const heatTransferAreaM2 = Math.max(0.2, heatDutykW / (U * LMTD));

  const evaporator: EvaporatorResults = {
    operatingPressureBar,
    boilingPointC,
    feedFlowKgH: clarifiedJuiceKgH,
    feedBrix,
    targetBrix,
    syrupOutputKgH,
    waterRemovalKgH,
    heatDutykW,
    heatTransferAreaM2,
  };

  // 5. Unit Operation 4: Convective Air Tunnel Dryer (Page Model)
  // MR = (M_t - M_e) / (M_0 - M_e) = exp(-k * t^n)
  const initialCakeMoisturePct = 65.0; // 65% moisture in wet press cake
  const targetFlourMoisturePct = productSpec.targetFlourMoisturePct;
  const equilibriumMoisturePct = 3.5; // M_e = 3.5%

  const M0 = initialCakeMoisturePct;
  const Mt = targetFlourMoisturePct;
  const Me = equilibriumMoisturePct;

  const MR = Math.max(0.01, (Mt - Me) / (M0 - Me));
  const k = params.dryingK;
  const n = params.dryingN;

  // Solve Page model for drying time t: t = (-ln(MR) / k)^(1/n)
  const minusLnMR = -Math.log(MR);
  const dryingTimeMin = Math.pow(minusLnMR / k, 1 / n);

  const conveyorVelocityMMin = 0.075; // 0.075 m/min conveyor speed
  const tunnelLengthM = Math.max(1.2, conveyorVelocityMMin * dryingTimeMin);

  const drySolidsKgH = bagasseFlowKgH * (1 - M0 / 100);
  const flourOutputKgH = drySolidsKgH / (1 - Mt / 100);
  const waterRemovedDryerKgH = Math.max(0, bagasseFlowKgH - flourOutputKgH);

  // Dryer thermal duty
  const airHeatingEnthalpykJPerKg = 2580; // kJ/kg evaporated water
  const totalHeatingDutykW = (waterRemovedDryerKgH * airHeatingEnthalpykJPerKg) / 3600;

  const dryer: DryerResults = {
    initialMoisturePct: M0,
    targetMoisturePct: Mt,
    pressCakeFeedKgH: bagasseFlowKgH,
    flourOutputKgH,
    waterRemovedKgH: waterRemovedDryerKgH,
    dryingTimeMin,
    tunnelLengthM,
    totalHeatingDutykW,
    kConstant: k,
    nConstant: n,
  };

  // 6. Solar Preheater Integration
  const solar = calculateSolarState(totalHeatingDutykW, collectorAreaM2, irradianceWPerM2);

  // 7. Techno-Economic & FX Calculator
  const tea = calculateTEAEconomics(syrupOutputKgH, flourOutputKgH, reactor, clarifier, evaporator, dryer);

  // Overall plant metrics
  const totalWaterEvaporated = waterRemovalKgH + waterRemovedDryerKgH;
  const totalWaterInFeed = feedRateKgH * (feedstock.moistureContentPct / 100);
  const overallWaterRecoveryPct = Math.min(98.5, (totalWaterEvaporated / totalWaterInFeed) * 100);
  const totalEnergykW = heatingDutykW + heatDutykW + totalHeatingDutykW + agitatorPowerkW;

  return {
    feedRateKgH,
    juiceFlowKgH,
    bagasseFlowKgH,
    clarifiedJuiceKgH,
    sludgeKgH,
    reactor,
    clarifier,
    evaporator,
    dryer,
    solar,
    tea,
    overallWaterRecoveryPct,
    totalEnergykW,
  };
}
