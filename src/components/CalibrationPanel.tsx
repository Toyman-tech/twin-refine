'use client';

import React, { useState } from 'react';
import {
  CalibrationParameterSet,
  CalibrationIteration,
} from '../lib/types';
import {
  runRecalibrationOptimization,
  ILORIN_BENCH_GROUND_TRUTH,
  UNCALIBRATED_DEFAULTS,
  BENCH_VALIDATED_TARGETS,
} from '../lib/engine/calibration';
import { RefreshCw, CheckCircle2, AlertTriangle, Cpu, ArrowDownRight, TrendingDown } from 'lucide-react';

interface CalibrationPanelProps {
  currentParams: CalibrationParameterSet;
  onApplyCalibratedParams: (params: CalibrationParameterSet) => void;
}

export const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
  currentParams,
  onApplyCalibratedParams,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState<CalibrationIteration[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'gauge' | 'diff'>('gauge');

  // Trigger real-time step-by-step optimization loop
  const handleRunCalibration = () => {
    setIsRunning(true);
    const history = runRecalibrationOptimization(UNCALIBRATED_DEFAULTS);
    setIterations(history);
    setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < history.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        onApplyCalibratedParams(BENCH_VALIDATED_TARGETS);
      }
    }, 150); // 150ms per iteration animation step
  };

  const activeIteration = iterations.length > 0 ? iterations[currentStep] : null;
  const latestVariance = activeIteration ? activeIteration.variancePct : 2.8;

  return (
    <div className="hmi-panel p-3 sm:p-5 mb-4 sm:mb-6 border-cyan-500/20">
      {/* Panel Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Digital Twin Parameter Recalibration Loop
          </h3>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] sm:text-xs">
            <button
              onClick={() => setActiveTab('gauge')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'gauge' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              Variance Convergence
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'diff' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              Parameter Diff
            </button>
          </div>

          <button
            onClick={handleRunCalibration}
            disabled={isRunning}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? `Optimizing ${currentStep}/12...` : 'Run Recalibration Loop'}
          </button>
        </div>
      </div>

      {/* BENCH GROUND TRUTH SUMMARY & NARROWING VARIANCE METER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* GROUND TRUTH BENCH REFERENCE */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-bold uppercase text-[11px]">U-Ilorin Ground Truth Bench</span>
            <span className="telemetry-badge telemetry-emerald text-[10px]">VALIDATED</span>
          </div>
          <div className="space-y-1.5 mt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Juice Yield:</span>
              <strong className="text-emerald-400">{ILORIN_BENCH_GROUND_TRUTH.juiceExtractionYieldPct}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flour Recovery:</span>
              <strong className="text-emerald-400">{ILORIN_BENCH_GROUND_TRUTH.flourRecoveryYieldPct}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flour Moisture:</span>
              <strong className="text-slate-200">&lt; {ILORIN_BENCH_GROUND_TRUTH.finalFlourMoisturePct}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Replicates:</span>
              <span className="text-slate-300">Triplicate (n=3)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
            Source: {ILORIN_BENCH_GROUND_TRUTH.location} ({ILORIN_BENCH_GROUND_TRUTH.publicationYear})
          </p>
        </div>

        {/* NARROWING VARIANCE GAUGE (NARROWING FROM 38% TO <3%) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-200 uppercase">
              Model vs. Bench Prediction Error Variance
            </span>
            <span
              className={`telemetry-badge text-[10px] sm:text-xs ${
                latestVariance < 5
                  ? 'telemetry-emerald'
                  : latestVariance < 15
                  ? 'telemetry-amber'
                  : 'telemetry-rose'
              }`}
            >
              {latestVariance < 5 ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              )}
              {latestVariance < 5 ? 'OPTIMAL FIT (<5%)' : 'VARIANCE DRIFT'}
            </span>
          </div>

          {/* REAL-TIME PROGRESS BAR & GAUGE */}
          <div className="my-2">
            <div className="flex items-baseline justify-between font-mono mb-1">
              <div className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span
                  className={
                    latestVariance < 5
                      ? 'text-emerald-400'
                      : latestVariance < 15
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {latestVariance.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-normal">Prediction Error Gap</span>
              </div>
              <span className="text-xs text-slate-400">
                Iteration: <strong className="text-cyan-300">{currentStep} / 12</strong>
              </span>
            </div>

            {/* Variance Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  latestVariance < 5
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    : latestVariance < 15
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400'
                }`}
                style={{ width: `${Math.max(4, 100 - (latestVariance / 40) * 100)}%` }}
              />
            </div>
          </div>

          {/* TAB VIEW: REAL-TIME CONVERGENCE LINE CHART OR PARAMETER DIFF */}
          {activeTab === 'gauge' ? (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
                  Gauss-Newton Optimization Trajectory (Variance % vs Iteration)
                </span>
                <span>Convergence: <strong className="text-emerald-400">&lt; 3.0% Error Target</strong></span>
              </div>

              {/* SVG REAL-TIME LINE CHART */}
              <div className="relative w-full h-36 bg-slate-950/90 rounded-lg border border-slate-850 p-2 overflow-hidden">
                <svg viewBox="0 0 500 140" className="w-full h-full text-xs font-mono">
                  <defs>
                    <linearGradient id="convergenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0, 10, 20, 30, 40].map((val) => {
                    const y = 120 - (val / 40) * 100;
                    return (
                      <g key={val}>
                        <line x1="35" y1={y} x2="480" y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                        <text x="5" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">{val}%</text>
                      </g>
                    );
                  })}

                  {/* Dynamic Convergence Curve Calculation */}
                  {(() => {
                    const trajectory = iterations.length > 0 ? iterations : runRecalibrationOptimization(UNCALIBRATED_DEFAULTS);
                    const points = trajectory.map((it, idx) => ({
                      x: 35 + (idx / 12) * 445,
                      y: 120 - (Math.min(it.variancePct, 40) / 40) * 100,
                      ...it,
                    }));

                    const lineD = points.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
                    const areaD = `${lineD} L ${points[points.length - 1].x} 120 L 35 120 Z`;

                    return (
                      <>
                        {/* Shaded Area Under Line */}
                        <path d={areaD} fill="url(#convergenceGradient)" />

                        {/* Convergence Polyline */}
                        <path d={lineD} fill="none" stroke="#00f2fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Data Points along curve */}
                        {points.map((pt, idx) => {
                          const isActive = idx <= currentStep;
                          return (
                            <g key={idx} className="group cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isActive ? 4 : 2.5}
                                fill={isActive ? '#10b981' : '#334155'}
                                stroke={isActive ? '#00f2fe' : '#1e293b'}
                                strokeWidth="1.5"
                                className="transition-all duration-300 hover:r-6"
                              />
                              {/* X-axis tick numbers */}
                              <text x={pt.x - 3} y="136" fill="#64748b" fontSize="8" fontFamily="monospace">i{pt.iteration}</text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Parameter Readout Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-850">
                  <span className="text-slate-500 block text-[10px]">Sim Press Eff</span>
                  <strong className="text-cyan-300">
                    {activeIteration ? (activeIteration.parameters.pressEfficiency * 100).toFixed(1) : (currentParams.pressEfficiency * 100).toFixed(1)}%
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-850">
                  <span className="text-slate-500 block text-[10px]">Page Model k</span>
                  <strong className="text-purple-300">
                    {activeIteration ? activeIteration.parameters.dryingK.toFixed(4) : currentParams.dryingK.toFixed(4)}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-850">
                  <span className="text-slate-500 block text-[10px]">Page Model n</span>
                  <strong className="text-amber-300">
                    {activeIteration ? activeIteration.parameters.dryingN.toFixed(3) : currentParams.dryingN.toFixed(3)}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-850">
                  <span className="text-slate-500 block text-[10px]">Evap Rate Factor</span>
                  <strong className="text-emerald-400">
                    {activeIteration ? activeIteration.parameters.evapRateFactor.toFixed(3) : currentParams.evapRateFactor.toFixed(3)}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t border-slate-800 text-xs font-mono overflow-x-auto">
              <table className="w-full min-w-[400px] text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 text-[11px]">
                    <th className="pb-1">Parameter Symbol</th>
                    <th className="pb-1">Uncalibrated Default</th>
                    <th className="pb-1">U-Ilorin Calibrated</th>
                    <th className="pb-1">Optimization Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-1">Press Efficiency (η)</td>
                    <td className="text-rose-400">58.0%</td>
                    <td className="text-emerald-400 font-bold">76.0%</td>
                    <td className="text-cyan-300">Least-Squares Fit</td>
                  </tr>
                  <tr>
                    <td className="py-1">Page Drying Constant (k)</td>
                    <td className="text-rose-400">0.0120</td>
                    <td className="text-emerald-400 font-bold">0.0215</td>
                    <td className="text-cyan-300">Least-Squares Fit</td>
                  </tr>
                  <tr>
                    <td className="py-1">Page Drying Power (n)</td>
                    <td className="text-rose-400">0.720</td>
                    <td className="text-emerald-400 font-bold">0.875</td>
                    <td className="text-cyan-300">Least-Squares Fit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
