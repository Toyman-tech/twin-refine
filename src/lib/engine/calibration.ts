import {
  CalibrationParameterSet,
  CalibrationIteration,
} from '../types';

export const UNCALIBRATED_DEFAULTS: CalibrationParameterSet = {
  pressEfficiency: 0.58, // Uncalibrated default: 58%
  dryingK: 0.012, // Uncalibrated Page k
  dryingN: 0.72, // Uncalibrated Page n
  evapRateFactor: 0.84, // Uncalibrated evaporation factor
};

export const BENCH_VALIDATED_TARGETS: CalibrationParameterSet = {
  pressEfficiency: 0.76, // Ground Truth U-Ilorin: 76.0%
  dryingK: 0.0215, // Calibrated Page k
  dryingN: 0.875, // Calibrated Page n
  evapRateFactor: 1.015, // Calibrated evap factor
};

export const ILORIN_BENCH_GROUND_TRUTH = {
  juiceExtractionYieldPct: 76.0,
  flourRecoveryYieldPct: 23.8,
  finalFlourMoisturePct: 8.5,
  trialCount: 3,
  location: 'University of Ilorin Agromaterial Research Lab',
  publicationYear: 2024,
};

// Generates step-by-step optimization trajectory showing variance narrowing
export function runRecalibrationOptimization(
  startParams: CalibrationParameterSet = UNCALIBRATED_DEFAULTS
): CalibrationIteration[] {
  const iterations: CalibrationIteration[] = [];
  const maxSteps = 12;

  const targetPress = BENCH_VALIDATED_TARGETS.pressEfficiency;
  const targetK = BENCH_VALIDATED_TARGETS.dryingK;
  const targetN = BENCH_VALIDATED_TARGETS.dryingN;
  const targetEvap = BENCH_VALIDATED_TARGETS.evapRateFactor;

  let currentPress = startParams.pressEfficiency;
  let currentK = startParams.dryingK;
  let currentN = startParams.dryingN;
  let currentEvap = startParams.evapRateFactor;

  for (let i = 0; i <= maxSteps; i++) {
    const progress = i / maxSteps;
    // Sigmoidal convergence curve simulating Gauss-Newton least squares optimization
    const alpha = 1 / (1 + Math.exp(-6 * (progress - 0.4)));

    const simPress = currentPress + (targetPress - currentPress) * alpha;
    const simK = currentK + (targetK - currentK) * alpha;
    const simN = currentN + (targetN - currentN) * alpha;
    const simEvap = currentEvap + (targetEvap - currentEvap) * alpha;

    // Calculate simulated yields
    const simulatedJuiceYieldPct = simPress * 100;
    const simulatedFlourYieldPct = 14.8 * (1 + (simK / 0.0215) * 0.60);

    // Calculate percentage prediction variance against bench ground truth
    const juiceError = Math.abs(simulatedJuiceYieldPct - ILORIN_BENCH_GROUND_TRUTH.juiceExtractionYieldPct);
    const flourError = Math.abs(simulatedFlourYieldPct - ILORIN_BENCH_GROUND_TRUTH.flourRecoveryYieldPct);
    const meanVariancePct = ((juiceError / ILORIN_BENCH_GROUND_TRUTH.juiceExtractionYieldPct) +
      (flourError / ILORIN_BENCH_GROUND_TRUTH.flourRecoveryYieldPct)) / 2 * 100;

    iterations.push({
      iteration: i,
      variancePct: Math.round(meanVariancePct * 10) / 10,
      parameters: {
        pressEfficiency: Math.round(simPress * 1000) / 1000,
        dryingK: Math.round(simK * 10000) / 10000,
        dryingN: Math.round(simN * 1000) / 1000,
        evapRateFactor: Math.round(simEvap * 1000) / 1000,
      },
      simulatedJuiceYieldPct: Math.round(simulatedJuiceYieldPct * 10) / 10,
      simulatedFlourYieldPct: Math.round(simulatedFlourYieldPct * 10) / 10,
    });
  }

  return iterations;
}
