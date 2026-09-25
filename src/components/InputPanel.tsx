'use client';

import React from 'react';
import {
  OperatingMode,
  FeedstockProperties,
  FlocculantModule,
  ThermalTreatmentModule,
  ProductSpecModule,
} from '../lib/types';
import { FLOCCULANT_MODULES } from '../lib/data/flocculants';
import { FEEDSTOCK_PRESETS } from '../lib/data/feedstocks';
import { THERMAL_TREATMENTS, PRODUCT_SPECS } from '../lib/data/treatments';
import { Sliders, Lock, Unlock, Sun, FlaskConical, Gauge, RotateCcw } from 'lucide-react';

interface InputPanelProps {
  mode: OperatingMode;
  setMode: (mode: OperatingMode) => void;
  feedRateKgH: number;
  setFeedRateKgH: (rate: number) => void;
  feedstock: FeedstockProperties;
  setFeedstock: (f: FeedstockProperties) => void;
  flocculant: FlocculantModule;
  setFlocculant: (f: FlocculantModule) => void;
  treatment: ThermalTreatmentModule;
  setTreatment: (t: ThermalTreatmentModule) => void;
  productSpec: ProductSpecModule;
  setProductSpec: (p: ProductSpecModule) => void;
  collectorAreaM2: number;
  setCollectorAreaM2: (area: number) => void;
  irradianceWPerM2: number;
  setIrradianceWPerM2: (irr: number) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  mode,
  setMode,
  feedRateKgH,
  setFeedRateKgH,
  feedstock,
  setFeedstock,
  flocculant,
  setFlocculant,
  treatment,
  setTreatment,
  productSpec,
  setProductSpec,
  collectorAreaM2,
  setCollectorAreaM2,
  irradianceWPerM2,
  setIrradianceWPerM2,
}) => {
  const isCaseStudy = mode === 'case_study';

  return (
    <div className="hmi-panel p-3 sm:p-5 mb-4 sm:mb-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Process Control & Parameters Input Panel
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isCaseStudy ? (
            <span className="telemetry-badge telemetry-cyan text-[11px] sm:text-xs">
              <Lock className="w-3 h-3 flex-shrink-0" />
              CASE STUDY MODE (LOCKED)
            </span>
          ) : (
            <span className="telemetry-badge telemetry-amber text-[11px] sm:text-xs">
              <Unlock className="w-3 h-3 flex-shrink-0" />
              GENERAL MODE (CUSTOM)
            </span>
          )}
        </div>
      </div>

      {/* CORE INTERACTIVE FEED-RATE SLIDER */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 mb-2">
          <label className="text-xs font-bold font-mono text-cyan-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            PLANT FEED-RATE CONTROL SLIDER
          </label>
          <span className="text-base sm:text-lg font-bold font-mono text-cyan-300">
            {feedRateKgH} <span className="text-xs font-normal text-slate-400">kg / hour</span>
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="5"
          value={feedRateKgH}
          onChange={(e) => setFeedRateKgH(parseFloat(e.target.value))}
          className="hmi-slider my-2"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 mt-1">
          <span>10 kg/h (Pilot Bench)</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[50, 150, 300, 500].map((rate) => (
              <button
                key={rate}
                onClick={() => setFeedRateKgH(rate)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  feedRateKgH === rate
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {rate} kg/h
              </button>
            ))}
          </div>
          <span>500 kg/h (Modular Factory)</span>
        </div>
      </div>

      {/* CASE STUDY LOCK NOTIFICATION OR GENERAL MODE INPUTS */}
      {isCaseStudy ? (
        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                Cashew Apple Valorisation (U-Ilorin Calibrated Preset)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Parameters locked to bench-trial ground truth: 85.2% moisture, 12.4° Brix, Rice-Gruel Flocculant, 90°C Hydrothermal conditioning, 0.3 bar vacuum evaporation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMode('general')}
            className="w-full md:w-auto px-3.5 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            Unlock Custom Crops (General Mode)
          </button>
        </div>
      ) : (
        /* GENERAL MODE CUSTOMIZABLE INPUTS & MODULAR CHEMISTRY */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* CROP FEEDSTOCK PRESET SELECTOR & INPUTS */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">1. Feedstock Properties</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">Crop Preset Selection</label>
                <select
                  value={feedstock.id}
                  onChange={(e) => {
                    const selected = FEEDSTOCK_PRESETS.find((f) => f.id === e.target.value);
                    if (selected) setFeedstock(selected);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 outline-none"
                >
                  {FEEDSTOCK_PRESETS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="text-slate-400 block mb-0.5">Moisture (%)</label>
                  <input
                    type="number"
                    value={feedstock.moistureContentPct}
                    onChange={(e) => setFeedstock({ ...feedstock, moistureContentPct: parseFloat(e.target.value) || 80 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-cyan-300"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">Sugar (°Brix)</label>
                  <input
                    type="number"
                    value={feedstock.sugarBrix}
                    onChange={(e) => setFeedstock({ ...feedstock, sugarBrix: parseFloat(e.target.value) || 10 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-amber-300"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">Density (kg/m³)</label>
                  <input
                    type="number"
                    value={feedstock.densityKgM3}
                    onChange={(e) => setFeedstock({ ...feedstock, densityKgM3: parseFloat(e.target.value) || 1040 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">Viscosity (Pa·s)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={feedstock.viscosityPaS}
                    onChange={(e) => setFeedstock({ ...feedstock, viscosityPaS: parseFloat(e.target.value) || 0.0018 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MODULAR PROCESS CHEMISTRY SELECTORS */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">2. Chemistry Modules</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">Clarification / Flocculant Agent</label>
                <select
                  value={flocculant.id}
                  onChange={(e) => {
                    const sel = FLOCCULANT_MODULES.find((m) => m.id === e.target.value);
                    if (sel) setFlocculant(sel);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 focus:border-cyan-500 outline-none"
                >
                  {FLOCCULANT_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.flocDiameterMicrons}µm)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">{flocculant.description}</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Thermal Treatment Profile</label>
                <select
                  value={treatment.id}
                  onChange={(e) => {
                    const sel = THERMAL_TREATMENTS.find((t) => t.id === e.target.value);
                    if (sel) setTreatment(sel);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-300 focus:border-cyan-500 outline-none"
                >
                  {THERMAL_TREATMENTS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SOLAR THERMAL SYSTEM CONTROLS */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">3. Solar Air Collector System</h4>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-400">Collector Field Area:</label>
                  <span className="text-amber-300 font-bold">{collectorAreaM2} m²</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={collectorAreaM2}
                  onChange={(e) => setCollectorAreaM2(parseFloat(e.target.value))}
                  className="hmi-slider"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-400">Solar Irradiance:</label>
                  <span className="text-amber-300 font-bold">{irradianceWPerM2} W/m²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={irradianceWPerM2}
                  onChange={(e) => setIrradianceWPerM2(parseFloat(e.target.value))}
                  className="hmi-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0 (Night)</span>
                  <span>400 (Overcast)</span>
                  <span>750 (Peak Ilorin)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
