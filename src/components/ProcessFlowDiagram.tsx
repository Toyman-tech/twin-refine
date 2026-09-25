'use client';

import React from 'react';
import { CompleteModelOutput } from '../lib/types';
import { Flame, Waves, Wind, Sun, Info, CheckCircle2, ArrowRight } from 'lucide-react';

interface PFDProps {
  data: CompleteModelOutput;
  onInspectUnit: (unitId: string) => void;
}

export const ProcessFlowDiagram: React.FC<PFDProps> = ({ data, onInspectUnit }) => {
  const { reactor, clarifier, evaporator, dryer, solar, feedRateKgH } = data;

  return (
    <div className="hmi-panel p-3 sm:p-4 mb-3 sm:mb-4 hmi-grid-bg relative overflow-hidden">
      {/* PFD Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">
            Process Flow Diagram (PFD) — Live Unit Telemetry
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono text-slate-400">
          <span>Feed: <strong className="text-cyan-300">{feedRateKgH} kg/h</strong></span>
          <span>Water Recovery: <strong className="text-emerald-400">{data.overallWaterRecoveryPct.toFixed(1)}%</strong></span>
          <span>Total Duty: <strong className="text-amber-300">{data.totalEnergykW.toFixed(1)} kW</strong></span>
        </div>
      </div>

      {/* Interactive Process Flow SVG Canvas & Nodes Grid */}
      <div className="relative min-h-[380px] flex flex-col justify-between">
        {/* Animated Connecting Streams (Desktop Responsive SVG Overlay) */}
        <svg
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none stroke-cyan-500/40 z-0"
        >
          <defs>
            <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Main Process Stream Lines */}
          <path d="M 230 90 L 270 90" stroke="url(#streamGrad)" strokeWidth="3" className="pipe-flow" />
          <path d="M 480 90 L 520 90" stroke="url(#streamGrad)" strokeWidth="3" className="pipe-flow" />
          <path d="M 730 90 L 770 90" stroke="url(#streamGrad)" strokeWidth="3" className="pipe-flow" />
          
          {/* Cake Stream to Dryer */}
          <path d="M 125 180 L 125 310 L 520 310" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4" className="pipe-flow-fast" />

          {/* Solar Preheat Duct to Dryer */}
          <path d="M 470 330 L 520 330" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
        </svg>

        {/* TOP STREAM: LIQUID PROCESSING LINE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          {/* RAW AGRO-WASTE PRESS FEED */}
          <div className="p-3 sm:p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Feed Input</span>
              <span className="telemetry-badge telemetry-cyan text-[10px]">PRE-PRESS</span>
            </div>
            <div className="my-2">
              <div className="text-base sm:text-lg font-bold font-mono text-cyan-300">{feedRateKgH} <span className="text-xs text-slate-400 font-normal">kg/h</span></div>
              <p className="text-[11px] text-slate-400 mt-1">Juice Flow: <strong className="text-slate-200">{data.juiceFlowKgH.toFixed(1)} kg/h</strong></p>
              <p className="text-[11px] text-slate-400">Bagasse: <strong className="text-amber-400">{data.bagasseFlowKgH.toFixed(1)} kg/h</strong></p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Press Eff: {(data.juiceFlowKgH / feedRateKgH * 100).toFixed(0)}%</span>
              <span className="lg:hidden text-cyan-400 font-bold">➔ Reactor</span>
            </div>
          </div>

          {/* UNIT 1: HYDROTHERMAL REACTOR */}
          <div 
            onClick={() => onInspectUnit('reactor')}
            className="p-3 sm:p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-200">1. Reactor</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </div>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Temp:</span>
                <span className="text-rose-300 font-bold">{reactor.temperatureC}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Res Time:</span>
                <span className="text-slate-200">{reactor.residenceTimeMin} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heat Duty:</span>
                <span className="text-amber-300">{reactor.heatingDutykW.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volume:</span>
                <span className="text-cyan-300">{reactor.vesselVolumeL.toFixed(0)} L</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Agitator: {reactor.agitatorPowerkW.toFixed(2)} kW</span>
              <span className="text-emerald-400 font-semibold">ON TARGET</span>
            </div>
          </div>

          {/* UNIT 2: GRAVITY CLARIFIER */}
          <div 
            onClick={() => onInspectUnit('clarifier')}
            className="p-3 sm:p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-200">2. Clarifier</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </div>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Settling v_t:</span>
                <span className="text-cyan-300 font-bold">{clarifier.settlingVelocityMmPerS.toFixed(2)} mm/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Area Req:</span>
                <span className="text-slate-200">{clarifier.requiredSurfaceAreaM2.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diameter:</span>
                <span className="text-slate-200">{clarifier.diameterM.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tannin Rem:</span>
                <span className="text-emerald-400">{clarifier.tanninRemovalPct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Stokes Eq.</span>
              <span className="text-emerald-400 font-semibold">STABLE</span>
            </div>
          </div>

          {/* UNIT 3: VACUUM EVAPORATOR */}
          <div 
            onClick={() => onInspectUnit('evaporator')}
            className="p-3 sm:p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-200">3. Evaporator</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </div>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pressure:</span>
                <span className="text-purple-300 font-bold">{evaporator.operatingPressureBar} bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Brix:</span>
                <span className="text-amber-300 font-bold">{evaporator.targetBrix}° Brix</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Syrup Out:</span>
                <span className="text-emerald-400 font-bold">{evaporator.syrupOutputKgH.toFixed(1)} kg/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Area Req:</span>
                <span className="text-slate-200">{evaporator.heatTransferAreaM2.toFixed(2)} m²</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Duty: {evaporator.heatDutykW.toFixed(1)} kW</span>
              <span className="text-cyan-300 font-semibold">SYRUP PRODUCT</span>
            </div>
          </div>
        </div>

        {/* BOTTOM STREAM: BAGASSE SOLIDS & DRYER & SOLAR PREHEATER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 relative z-10">
          {/* SOLAR THERMAL PREHEATER PANEL */}
          <div className="p-3 sm:p-3.5 rounded-lg bg-slate-900/90 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex-shrink-0 flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-300">Solar Thermal Preheater</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {solar.collectorAreaM2} m² @ {solar.irradianceWPerM2} W/m²
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-amber-300 font-bold">{solar.solarDutykW.toFixed(1)} kW Thermal</div>
              <div className="text-emerald-400 text-[11px]">Met by Solar: <strong>{solar.solarFractionPct.toFixed(0)}%</strong></div>
            </div>
          </div>

          {/* UNIT 4: CONVECTIVE AIR TUNNEL DRYER */}
          <div 
            onClick={() => onInspectUnit('dryer')}
            className="p-3 sm:p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-200">4. Tunnel Dryer (Page Model)</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Moisture:</span>
                <span className="text-amber-300">{dryer.initialMoisturePct}% → {dryer.targetMoisturePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flour Output:</span>
                <span className="text-emerald-400 font-bold">{dryer.flourOutputKgH.toFixed(1)} kg/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tunnel Length:</span>
                <span className="text-slate-200">{dryer.tunnelLengthM.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Page Model:</span>
                <span className="text-cyan-300">k={dryer.kConstant.toFixed(3)}, n={dryer.nConstant.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Backup Duty: {solar.backupFuelDutykW.toFixed(1)} kW</span>
              <span className="text-emerald-400 font-semibold">HIGH-FIBRE FLOUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
