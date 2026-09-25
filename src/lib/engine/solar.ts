import { SolarSystemState } from '../types';

export function calculateSolarState(
  dryerHeatingDutykW: number,
  collectorAreaM2: number = 35,
  irradianceWPerM2: number = 750,
  collectorEfficiency: number = 0.58
): SolarSystemState {
  // Total solar radiation hitting collector area in kW
  const solarThermalInputkW = (collectorAreaM2 * irradianceWPerM2) / 1000;
  
  // Useful heat delivered to preheat inlet air stream (kW)
  const solarDutykW = Math.min(dryerHeatingDutykW * 0.95, solarThermalInputkW * collectorEfficiency);

  // Fraction of dryer thermal demand met by solar air collector
  const solarFractionPct = dryerHeatingDutykW > 0 ? Math.min(100, (solarDutykW / dryerHeatingDutykW) * 100) : 0;

  // Remaining duty required from diesel / grid backup burner
  const backupFuelDutykW = Math.max(0, dryerHeatingDutykW - solarDutykW);

  // Economic & environmental impact of solar preheating
  // Industrial diesel thermal equivalent cost: ~$0.14 per thermal kWh in Nigeria
  const hourlyFuelCostSavedUSD = solarDutykW * 0.14;
  
  // Diesel combustion emission factor: ~0.27 kg CO2 / kWh thermal
  const hourlyCO2AvoidedKg = solarDutykW * 0.27;

  return {
    collectorAreaM2,
    irradianceWPerM2,
    collectorEfficiency,
    solarDutykW,
    solarFractionPct,
    backupFuelDutykW,
    hourlyFuelCostSavedUSD,
    hourlyCO2AvoidedKg,
  };
}
