'use client';

import React from 'react';
import { OperatingMode } from '../lib/types';
import { Activity, Lock, Unlock, Play, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  mode: OperatingMode;
  setMode: (mode: OperatingMode) => void;
  isCalibrated: boolean;
  onRunRecalibration: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  isCalibrated,
  onRunRecalibration,
  onSelectPreset,
}) => {
  return (
    <header className="hmi-panel p-3 sm:p-4 mb-4 sm:mb-6 border-b border-cyan-500/20">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 sm:gap-4">
        {/* Brand & System Title */}
        <div className="flex items-start sm:items-center gap-3 w-full xl:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-cyan-500/30 mt-0.5 sm:mt-0">
            <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                TwinRefine <span className="text-[10px] sm:text-xs font-mono text-cyan-400 font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">v2.4-HMI</span>
              </h1>
              <span className="telemetry-badge telemetry-emerald text-[10px] sm:text-xs py-0.5 px-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping"></span>
                PHYSICS MODEL LIVE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
              Digital Twin-Inspired Decision-Support System for Zero-Effluent Agro-Waste Biorefining
            </p>
          </div>
        </div>

        {/* Preset Scenarios Quick Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs w-full xl:w-auto">
          <span className="text-slate-400 font-medium text-[11px] sm:text-xs">Quick Presets:</span>
          <button
            onClick={() => onSelectPreset('cashew_validated')}
            className="px-2 sm:px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[11px] sm:text-xs transition-colors"
          >
            Cashew (U-Ilorin)
          </button>
          <button
            onClick={() => onSelectPreset('pineapple_high_flow')}
            className="px-2 sm:px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] sm:text-xs transition-colors"
          >
            Pineapple (300 kg/h)
          </button>
          <button
            onClick={() => onSelectPreset('mango_peel')}
            className="px-2 sm:px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] sm:text-xs transition-colors"
          >
            Mango Peel
          </button>
        </div>

        {/* Operating Mode Selector & Recalibration Trigger */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto justify-between sm:justify-end">
          {/* Mode Switch Toggle */}
          <div className="flex bg-slate-900/90 p-1 rounded-lg border border-slate-800 w-full sm:w-auto justify-stretch">
            <button
              onClick={() => setMode('case_study')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                mode === 'case_study'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span>Case Study (Cashew)</span>
            </button>
            <button
              onClick={() => setMode('general')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                mode === 'general'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span>General (Custom)</span>
            </button>
          </div>

          {/* Quick Recalibration Trigger */}
          <button
            onClick={onRunRecalibration}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all ${
              isCalibrated
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
            }`}
          >
            {isCalibrated ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
            <span>{isCalibrated ? 'Twin Calibrated (<3% Err)' : 'Recalibrate Twin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
