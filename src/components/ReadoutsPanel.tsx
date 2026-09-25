'use client';

import React from 'react';
import { CompleteModelOutput } from '../lib/types';
import { DollarSign, Droplets, Zap, Sun, Award, TrendingUp, ShieldCheck, Scale } from 'lucide-react';

interface ReadoutsPanelProps {
  data: CompleteModelOutput;
}

export const ReadoutsPanel: React.FC<ReadoutsPanelProps> = ({ data }) => {
  const { tea, solar, reactor, clarifier, evaporator, dryer, feedRateKgH } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
      {/* CARD 1: MASS FLOW & PRODUCT OUTPUTS */}
      <div className="hmi-panel p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Mass Flow & Yields</h4>
            </div>
            <span className="telemetry-badge telemetry-cyan text-[10px]">BALANCED</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/90">
              <span className="text-slate-400">Cashew Syrup (65° Brix):</span>
              <strong className="text-amber-300 text-sm">{evaporator.syrupOutputKgH.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/h</span></strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/90">
              <span className="text-slate-400">High-Fibre Flour (&lt;10% H₂O):</span>
              <strong className="text-emerald-400 text-sm">{dryer.flourOutputKgH.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/h</span></strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/90">
              <span className="text-slate-400">Water Removed/Recovered:</span>
              <strong className="text-cyan-300 text-sm">{(evaporator.waterRemovalKgH + dryer.waterRemovedKgH).toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/h</span></strong>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono flex justify-between text-slate-400">
          <span>Overall Conversion Yield:</span>
          <strong className="text-emerald-400 font-bold">
            {(((evaporator.syrupOutputKgH + dryer.flourOutputKgH) / feedRateKgH) * 100).toFixed(1)}%
          </strong>
        </div>
      </div>

      {/* CARD 2: FX SAVINGS CALCULATOR (NIGERIA IMPORT REPLACEMENT) */}
      <div className="hmi-panel p-4 flex flex-col justify-between border-emerald-500/20">
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">FX Import Replacement</h4>
            </div>
            <span className="telemetry-badge telemetry-emerald text-[10px]">FX DISPLACEMENT</span>
          </div>

          <div className="my-1 text-center font-mono p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/20">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Annual FX Savings</span>
            <div className="text-xl font-bold text-emerald-400">
              ${(tea.annualFXSavingsUSD / 1000).toFixed(1)}k <span className="text-xs text-slate-300 font-normal">/ yr</span>
            </div>
            <div className="text-xs text-emerald-300/80 font-semibold mt-0.5">
              ₦{(tea.annualFXSavingsNGN / 1e6).toFixed(1)} Million NGN
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-[11px] mt-2">
            <div className="flex justify-between text-slate-400">
              <span>Imported Sweetener Displaced:</span>
              <strong className="text-slate-200">${(tea.displacedImportSyrupUSD / 1000).toFixed(1)}k</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Imported Pectin/Fiber Displaced:</span>
              <strong className="text-slate-200">${(tea.displacedImportFibreUSD / 1000).toFixed(1)}k</strong>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          Exchange rate benchmark: ₦1,550 / USD (6,000 hrs/yr basis)
        </div>
      </div>

      {/* CARD 3: TECHNO-ECONOMIC ANALYSIS (TEA METRICS) */}
      <div className="hmi-panel p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Techno-Economics (TEA)</h4>
            </div>
            <span className="telemetry-badge telemetry-cyan text-[10px]">CAPVA MODEL</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Product Gross Revenue:</span>
              <strong className="text-purple-300">${(tea.annualRevenueUSD / 1000).toFixed(1)}k / yr</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plant CAPEX Estimate:</span>
              <strong className="text-slate-200">${(tea.estimatedCapexUSD / 1000).toFixed(1)}k</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Annual OPEX Estimate:</span>
              <strong className="text-slate-200">${(tea.estimatedOpexUSDYear / 1000).toFixed(1)}k</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gross Margin:</span>
              <strong className="text-emerald-400">{tea.grossMarginPct.toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">Payback Period:</span>
          <span className="telemetry-badge telemetry-emerald font-bold">{tea.paybackPeriodYears.toFixed(1)} Years</span>
        </div>
      </div>

      {/* CARD 4: SOLAR THERMAL & CARBON OFFSET */}
      <div className="hmi-panel p-4 flex flex-col justify-between border-amber-500/20">
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Solar Integration</h4>
            </div>
            <span className="telemetry-badge telemetry-amber text-[10px]">CLEAN ENERGY</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/90">
              <span className="text-slate-400">Dryer Solar Fraction:</span>
              <strong className="text-amber-300 text-sm font-bold">{solar.solarFractionPct.toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/90">
              <span className="text-slate-400">Solar Heat Supplied:</span>
              <strong className="text-slate-200">{solar.solarDutykW.toFixed(1)} kW</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/90">
              <span className="text-slate-400">Hourly Fuel Savings:</span>
              <strong className="text-emerald-400">${solar.hourlyFuelCostSavedUSD.toFixed(2)} / h</strong>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">CO₂ Emissions Avoided:</span>
          <strong className="text-emerald-400 font-bold">{(solar.hourlyCO2AvoidedKg * 6).toFixed(1)} kg CO₂ / day</strong>
        </div>
      </div>
    </div>
  );
};
