import {
  ReactorResults,
  ClarifierResults,
  EvaporatorResults,
  DryerResults,
  TEAResults,
} from '../types';

export function calculateTEAEconomics(
  syrupOutputKgH: number,
  flourOutputKgH: number,
  reactor: ReactorResults,
  clarifier: ClarifierResults,
  evaporator: EvaporatorResults,
  dryer: DryerResults
): TEAResults {
  // Unit wholesale product pricing (CAPVA benchmarks)
  const syrupPriceUSDPerKg = 2.40; // $2.40 / kg wholesale cashew syrup
  const flourPriceUSDPerKg = 1.85; // $1.85 / kg high-fibre flour

  // Import displacement pricing (Land-delivered import benchmark price)
  const importSyrupPriceUSDPerKg = 2.85; // Displacing imported HFCS / invert sugar
  const importFibrePriceUSDPerKg = 2.30; // Displacing imported dietary pectin & fibre fillers

  // Hourly revenues
  const syrupRevenueUSDH = syrupOutputKgH * syrupPriceUSDPerKg;
  const flourRevenueUSDH = flourOutputKgH * flourPriceUSDPerKg;
  const totalProductValueUSDH = syrupRevenueUSDH + flourRevenueUSDH;

  // Annual operating basis (6,000 operating hours / year = 250 days x 24 hrs)
  const operatingHoursPerYear = 6000;
  const annualRevenueUSD = totalProductValueUSDH * operatingHoursPerYear;

  // Foreign Exchange (FX) Savings Calculation
  const displacedImportSyrupUSD = syrupOutputKgH * importSyrupPriceUSDPerKg * operatingHoursPerYear;
  const displacedImportFibreUSD = flourOutputKgH * importFibrePriceUSDPerKg * operatingHoursPerYear;
  const annualFXSavingsUSD = displacedImportSyrupUSD + displacedImportFibreUSD;

  // NGN FX Exchange Rate (1 USD = 1,550 NGN)
  const exchangeRateNGNPerUSD = 1550;
  const annualFXSavingsNGN = annualFXSavingsUSD * exchangeRateNGNPerUSD;

  // Dynamic CAPEX Sizing Model (USD)
  const reactorCost = 4500 + reactor.vesselVolumeL * 3.5;
  const clarifierCost = 6200 + clarifier.requiredSurfaceAreaM2 * 850;
  const evaporatorCost = 12500 + evaporator.heatTransferAreaM2 * 1400;
  const dryerCost = 9800 + dryer.tunnelLengthM * 1200;
  const solarCost = 3500; // 35 m2 solar collector thermal loop
  const pipingAuxiliariesCost = 8500;

  const estimatedCapexUSD = Math.round(
    reactorCost + clarifierCost + evaporatorCost + dryerCost + solarCost + pipingAuxiliariesCost
  );

  // Dynamic OPEX Sizing Model (USD/year)
  // Raw feedstock acquisition & transport: ~$0.045 / kg agrowaste
  const feedKgYear = (evaporator.feedFlowKgH + dryer.pressCakeFeedKgH) * operatingHoursPerYear;
  const feedstockCostUSDYear = feedKgYear * 0.028;
  
  // Power & thermal utilities
  const totalDutykW = reactor.heatingDutykW + evaporator.heatDutykW + dryer.totalHeatingDutykW;
  const utilityCostUSDYear = totalDutykW * 0.08 * operatingHoursPerYear; // $0.08 / kWh avg

  // Chemicals & labor
  const chemicalCostUSDYear = 3200;
  const laborCostUSDYear = 14400; // 2 plant technicians @ $600/mo

  const estimatedOpexUSDYear = Math.round(
    feedstockCostUSDYear + utilityCostUSDYear + chemicalCostUSDYear + laborCostUSDYear
  );

  // Gross Margin & Payback Period
  const netAnnualProfitUSD = annualRevenueUSD - estimatedOpexUSDYear;
  const grossMarginPct = annualRevenueUSD > 0 ? Math.max(0, (netAnnualProfitUSD / annualRevenueUSD) * 100) : 0;
  const paybackPeriodYears = netAnnualProfitUSD > 0 ? Math.max(0.4, estimatedCapexUSD / netAnnualProfitUSD) : 99.9;

  return {
    syrupRevenueUSDH,
    flourRevenueUSDH,
    totalProductValueUSDH,
    annualRevenueUSD,
    annualFXSavingsUSD,
    annualFXSavingsNGN,
    displacedImportSyrupUSD,
    displacedImportFibreUSD,
    estimatedCapexUSD,
    estimatedOpexUSDYear,
    grossMarginPct,
    paybackPeriodYears,
  };
}
