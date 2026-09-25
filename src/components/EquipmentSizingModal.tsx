'use client';

import React from 'react';
import { CompleteModelOutput } from '../lib/types';
import { X, BookOpen, Calculator, Layers, Flame, Waves, Wind } from 'lucide-react';

interface ModalProps {
  unitId: string | null;
  onClose: () => void;
  data: CompleteModelOutput;
}

export const EquipmentSizingModal: React.FC<ModalProps> = ({ unitId, onClose, data }) => {
  if (!unitId) return null;

  const { reactor, clarifier, evaporator, dryer, feedRateKgH } = data;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="hmi-panel max-w-2xl w-full p-4 sm:p-6 border-cyan-500/30 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <h3 className="text-xs sm:text-base font-bold text-slate-100 font-mono uppercase">
              Engineering Sizing Equations & Spec Inspector
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT DEPENDING ON SELECTED UNIT */}
        {unitId === 'clarifier' && (
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20">
              <h4 className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-2 mb-2">
                <Waves className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                Unit 2: Gravity Clarifier — Stokes' Law Governing Model
              </h4>
              <p className="text-slate-400 mb-3 text-[11px] sm:text-xs">
                Calculates the terminal settling velocity of flocculated tannin particles under laminar flow conditions ($Re &lt; 0.1$).
              </p>

              {/* Formula Display */}
              <div className="p-2.5 sm:p-3 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-center font-bold text-xs sm:text-sm my-2 overflow-x-auto">
                v_t = [ g · d² · (ρ_p − ρ_f) ] / ( 18 · µ )
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[11px]">
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Gravity Acceleration (g):</span>
                  <strong>9.81 m/s²</strong>
                </div>
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Particle Density (ρ_p):</span>
                  <strong>{data.clarifier.settlingVelocityMmPerS ? '1160 kg/m³' : '-'}</strong>
                </div>
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Fluid Density (ρ_f):</span>
                  <strong>{data.clarifier ? '1048 kg/m³' : '-'}</strong>
                </div>
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Fluid Viscosity (µ):</span>
                  <strong>0.0018 Pa·s</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-slate-200 mb-2">Derived Equipment Sizing Outputs:</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Terminal Settling Velocity (v_t):</span>
                  <strong className="text-cyan-300">{clarifier.settlingVelocityMmPerS.toFixed(3)} mm/s ({clarifier.settlingVelocityMPerS.toExponential(3)} m/s)</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Required Settling Area (A = Q / v_t):</span>
                  <strong className="text-emerald-400">{clarifier.requiredSurfaceAreaM2.toFixed(3)} m²</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Clarifier Vessel Diameter:</span>
                  <strong className="text-slate-100">{clarifier.diameterM.toFixed(2)} m</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Cone Height (H_cone = 0.5 D):</span>
                  <strong className="text-slate-100">{clarifier.coneHeightM.toFixed(2)} m</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Total Vessel Volume:</span>
                  <strong className="text-purple-300">{(clarifier.totalVolumeM3 * 1000).toFixed(0)} Liters ({clarifier.totalVolumeM3.toFixed(2)} m³)</strong>
                </li>
              </ul>
            </div>
          </div>
        )}

        {unitId === 'dryer' && (
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/20">
              <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Unit 4: Convective Air Tunnel Dryer — Page Thin-Layer Model
              </h4>
              <p className="text-slate-400 mb-3 text-[11px] sm:text-xs">
                Models moisture ratio reduction in agro-waste press-cake bagasse during forced air drying.
              </p>

              {/* Formula Display */}
              <div className="p-2.5 sm:p-3 rounded bg-slate-950 border border-slate-800 text-amber-300 text-center font-bold text-xs sm:text-sm my-2 overflow-x-auto">
                MR = (M_t − M_e) / (M_0 − M_e) = exp( − k · t^n )
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[11px]">
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Initial Moisture (M_0):</span>
                  <strong>{dryer.initialMoisturePct}%</strong>
                </div>
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Target Moisture (M_t):</span>
                  <strong>{dryer.targetMoisturePct}%</strong>
                </div>
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Drying Rate Constant (k):</span>
                  <strong>{dryer.kConstant.toFixed(4)} min⁻ⁿ</strong>
                </div>
                <div className="p-2 rounded bg-slate-950">
                  <span className="text-slate-500 block">Page Exponent (n):</span>
                  <strong>{dryer.nConstant.toFixed(3)}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-slate-200 mb-2">Derived Equipment Sizing Outputs:</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Required Drying Time (t_dry):</span>
                  <strong className="text-amber-300">{dryer.dryingTimeMin.toFixed(1)} minutes</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Conveyor Tunnel Length (L = v_conv · t_dry):</span>
                  <strong className="text-emerald-400">{dryer.tunnelLengthM.toFixed(2)} meters</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Water Removal Rate:</span>
                  <strong className="text-slate-100">{dryer.waterRemovedKgH.toFixed(1)} kg/h</strong>
                </li>
                <li className="flex flex-col sm:flex-row justify-between">
                  <span>Air Heating Thermal Duty:</span>
                  <strong className="text-purple-300">{dryer.totalHeatingDutykW.toFixed(1)} kW</strong>
                </li>
              </ul>
            </div>
          </div>
        )}

        {(unitId === 'reactor' || unitId === 'evaporator') && (
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/20">
              <h4 className="text-xs sm:text-sm font-bold text-purple-300 mb-2">
                {unitId === 'reactor' ? 'Unit 1: Agitated Hydrothermal Reactor' : 'Unit 3: Vacuum Evaporator'}
              </h4>
              <p className="text-slate-400 mb-3 text-[11px] sm:text-xs">
                {unitId === 'reactor'
                  ? 'Energy balance and residence vessel sizing for flocculant activation.'
                  : 'Low pressure (0.3 bar) evaporation protecting heat-sensitive sugars and vitamin C.'}
              </p>

              <div className="p-2.5 sm:p-3 rounded bg-slate-950 border border-slate-800 text-purple-300 text-center font-bold text-xs sm:text-sm my-2 overflow-x-auto">
                {unitId === 'reactor' ? 'Q = m_dot · C_p · (T_set − T_in)' : 'Q = m_dot_evap · ΔH_vap  |  A = Q / (U · ΔT_lm)'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-slate-200 mb-2">Engineering Telemetry:</h4>
              <ul className="space-y-1.5 text-slate-300">
                {unitId === 'reactor' ? (
                  <>
                    <li className="flex flex-col sm:flex-row justify-between"><span>Vessel Volume:</span><strong className="text-cyan-300">{reactor.vesselVolumeL.toFixed(0)} Liters</strong></li>
                    <li className="flex flex-col sm:flex-row justify-between"><span>Heating Duty:</span><strong className="text-amber-300">{reactor.heatingDutykW.toFixed(1)} kW</strong></li>
                    <li className="flex flex-col sm:flex-row justify-between"><span>Time to Temp:</span><strong className="text-slate-100">{reactor.warmupTimeMin.toFixed(1)} min</strong></li>
                  </>
                ) : (
                  <>
                    <li className="flex flex-col sm:flex-row justify-between"><span>Evaporator Area (A):</span><strong className="text-cyan-300">{evaporator.heatTransferAreaM2.toFixed(2)} m²</strong></li>
                    <li className="flex flex-col sm:flex-row justify-between"><span>Boiling Temp:</span><strong className="text-rose-300">{evaporator.boilingPointC.toFixed(1)}°C (@ 0.3 bar)</strong></li>
                    <li className="flex flex-col sm:flex-row justify-between"><span>Water Vapor Removal:</span><strong className="text-emerald-400">{evaporator.waterRemovalKgH.toFixed(1)} kg/h</strong></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors text-center"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
