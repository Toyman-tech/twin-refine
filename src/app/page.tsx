'use client';

import React, { useState, useMemo } from 'react';
import {
  OperatingMode,
  FeedstockProperties,
  FlocculantModule,
  ThermalTreatmentModule,
  ProductSpecModule,
  CalibrationParameterSet,
} from '@/lib/types';
import { FEEDSTOCK_PRESETS } from '@/lib/data/feedstocks';
import { FLOCCULANT_MODULES } from '@/lib/data/flocculants';
import { THERMAL_TREATMENTS, PRODUCT_SPECS } from '@/lib/data/treatments';
import { BENCH_VALIDATED_TARGETS, UNCALIBRATED_DEFAULTS } from '@/lib/engine/calibration';
import { runPhysicsModel } from '@/lib/engine/physics';

import { Header } from '@/components/Header';
import { ProcessFlowDiagram } from '@/components/ProcessFlowDiagram';
import { InputPanel } from '@/components/InputPanel';
import { CalibrationPanel } from '@/components/CalibrationPanel';
import { ReadoutsPanel } from '@/components/ReadoutsPanel';
import { EquipmentSizingModal } from '@/components/EquipmentSizingModal';

import { Download, FileText, Share2, Layers } from 'lucide-react';

export default function TwinRefineDashboard() {
  // 1. Operating Mode State (Case Study Mode locked cashew model vs General Mode)
  const [mode, setMode] = useState<OperatingMode>('case_study');

  // 2. Feed-Rate Slider State (10 kg/h to 500 kg/h)
  const [feedRateKgH, setFeedRateKgH] = useState<number>(150);

  // 3. Model Parameters State
  const [feedstock, setFeedstock] = useState<FeedstockProperties>(FEEDSTOCK_PRESETS[0]);
  const [flocculant, setFlocculant] = useState<FlocculantModule>(FLOCCULANT_MODULES[0]);
  const [treatment, setTreatment] = useState<ThermalTreatmentModule>(THERMAL_TREATMENTS[0]);
  const [productSpec, setProductSpec] = useState<ProductSpecModule>(PRODUCT_SPECS[0]);

  // 4. Solar Air Collector State
  const [collectorAreaM2, setCollectorAreaM2] = useState<number>(35);
  const [irradianceWPerM2, setIrradianceWPerM2] = useState<number>(750);

  // 5. Digital Twin Recalibrated Parameters State
  const [calibratedParams, setCalibratedParams] = useState<CalibrationParameterSet>(BENCH_VALIDATED_TARGETS);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);

  // 6. Modal Inspector State
  const [inspectedUnit, setInspectedUnit] = useState<string | null>(null);

  // 7. Calculate Physics Model Output dynamically on state change
  const modelResults = useMemo(() => {
    // In Case Study Mode, parameters are locked to Cashew + Rice Gruel + 90C Hydrothermal
    const activeFeedstock = mode === 'case_study' ? FEEDSTOCK_PRESETS[0] : feedstock;
    const activeFlocculant = mode === 'case_study' ? FLOCCULANT_MODULES[0] : flocculant;
    const activeTreatment = mode === 'case_study' ? THERMAL_TREATMENTS[0] : treatment;
    const activeProductSpec = mode === 'case_study' ? PRODUCT_SPECS[0] : productSpec;
    const activeParams = mode === 'case_study' ? calibratedParams : UNCALIBRATED_DEFAULTS;

    return runPhysicsModel(
      feedRateKgH,
      activeFeedstock,
      activeFlocculant,
      activeTreatment,
      activeProductSpec,
      activeParams,
      collectorAreaM2,
      irradianceWPerM2
    );
  }, [
    mode,
    feedRateKgH,
    feedstock,
    flocculant,
    treatment,
    productSpec,
    collectorAreaM2,
    irradianceWPerM2,
    calibratedParams,
  ]);

  // Handle Quick Presets
  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'cashew_validated') {
      setMode('case_study');
      setFeedRateKgH(150);
      setFeedstock(FEEDSTOCK_PRESETS[0]);
      setFlocculant(FLOCCULANT_MODULES[0]);
      setCalibratedParams(BENCH_VALIDATED_TARGETS);
      setIsCalibrated(true);
    } else if (presetId === 'pineapple_high_flow') {
      setMode('general');
      setFeedRateKgH(300);
      setFeedstock(FEEDSTOCK_PRESETS[1]);
      setFlocculant(FLOCCULANT_MODULES[1]);
    } else if (presetId === 'mango_peel') {
      setMode('general');
      setFeedRateKgH(200);
      setFeedstock(FEEDSTOCK_PRESETS[2]);
      setFlocculant(FLOCCULANT_MODULES[2]);
    }
  };

  // Export scenario report as JSON file
  const handleExportJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      operatingMode: mode,
      feedRateKgH,
      inputs: {
        feedstock: feedstock.name,
        flocculant: flocculant.name,
        treatment: treatment.name,
      },
      results: modelResults,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `TwinRefine_Scenario_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 8. Navigation Tab State to de-clutter dashboard layout
  const [activeView, setActiveView] = useState<'overview' | 'controls' | 'calibration' | 'tea' | 'all'>('overview');

  return (
    <main className="h-screen w-screen bg-[#070a12] text-slate-100 p-2 sm:p-4 flex flex-col gap-2 overflow-hidden">
      {/* Top Header & Navigation Bar */}
      <Header
        mode={mode}
        setMode={setMode}
        isCalibrated={isCalibrated}
        onRunRecalibration={() => {
          setCalibratedParams(BENCH_VALIDATED_TARGETS);
          setIsCalibrated(true);
        }}
        onSelectPreset={handleSelectPreset}
      />

      {/* WORKSPACE VIEW SWITCHER TABS */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
              activeView === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📊 Overview & PFD</span>
          </button>

          <button
            onClick={() => setActiveView('controls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
              activeView === 'controls'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>⚙️ Process Controls</span>
          </button>

          <button
            onClick={() => setActiveView('calibration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
              activeView === 'calibration'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🧬 Digital Twin Calibration</span>
          </button>

          <button
            onClick={() => setActiveView('tea')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
              activeView === 'tea'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📈 Techno-Economics (TEA)</span>
          </button>
        </div>

        <button
          onClick={() => setActiveView('all')}
          className={`px-2.5 py-1.5 rounded-lg font-medium text-[11px] sm:text-xs transition-all ${
            activeView === 'all'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌐 View All Panels
        </button>
      </div>

      {/* DYNAMIC SCROLLABLE CONTENT VIEWPORT THAT FILLS SCREEN HEIGHT & WIDTH */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
        {(activeView === 'overview' || activeView === 'tea' || activeView === 'all') && (
          <ReadoutsPanel data={modelResults} />
        )}

        {(activeView === 'overview' || activeView === 'all') && (
          <ProcessFlowDiagram
            data={modelResults}
            onInspectUnit={(unitId) => setInspectedUnit(unitId)}
          />
        )}

        {(activeView === 'controls' || activeView === 'all') && (
          <InputPanel
            mode={mode}
            setMode={setMode}
            feedRateKgH={feedRateKgH}
            setFeedRateKgH={setFeedRateKgH}
            feedstock={feedstock}
            setFeedstock={setFeedstock}
            flocculant={flocculant}
            setFlocculant={setFlocculant}
            treatment={treatment}
            setTreatment={setTreatment}
            productSpec={productSpec}
            setProductSpec={setProductSpec}
            collectorAreaM2={collectorAreaM2}
            setCollectorAreaM2={setCollectorAreaM2}
            irradianceWPerM2={irradianceWPerM2}
            setIrradianceWPerM2={setIrradianceWPerM2}
          />
        )}

        {(activeView === 'calibration' || activeView === 'all') && (
          <CalibrationPanel
            currentParams={calibratedParams}
            onApplyCalibratedParams={(params) => {
              setCalibratedParams(params);
              setIsCalibrated(true);
            }}
          />
        )}
      </div>

      {/* Footer & Export Tools */}
      <footer className="hmi-panel p-2.5 sm:p-3 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>TwinRefine Biorefinery Decision-Support Platform &copy; 2026</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Scenario Data (JSON)
          </button>
        </div>
      </footer>

      {/* Equipment Sizing Equations Inspector Modal */}
      <EquipmentSizingModal
        unitId={inspectedUnit}
        onClose={() => setInspectedUnit(null)}
        data={modelResults}
      />
    </main>
  );
}
