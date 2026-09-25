import { ThermalTreatmentModule, ProductSpecModule } from '../types';

export const THERMAL_TREATMENTS: ThermalTreatmentModule[] = [
  {
    id: 'cashew_90c',
    name: 'Hydrothermal Conditioning (90°C, 15 min)',
    temperatureC: 90,
    residenceTimeMin: 15,
    description: 'Optimal thermal condition for rice-gruel tannin complexation and protein denaturation.'
  },
  {
    id: 'enzymatic_75c',
    name: 'Enzymatic Blanching (75°C, 20 min)',
    temperatureC: 75,
    residenceTimeMin: 20,
    description: 'Lower temperature regime preserving delicate vitamins and volatile aromas.'
  },
  {
    id: 'pasteurization_105c',
    name: 'High-Temp Thermal Conditioning (105°C, 10 min)',
    temperatureC: 105,
    residenceTimeMin: 10,
    description: 'Rapid high-temperature pasteurization for heavy fibrous slurries.'
  }
];

export const PRODUCT_SPECS: ProductSpecModule[] = [
  {
    id: 'syrup_flour_premium',
    name: 'Refined Syrup (65° Brix) + High-Fibre Flour (<10% Moisture)',
    targetSyrupBrix: 65,
    targetFlourMoisturePct: 8.5,
    description: 'Standard CAPVA high-value dual product valorization specification.'
  },
  {
    id: 'nectar_coarse_fibre',
    name: 'Fruit Nectar (50° Brix) + Coarse Fiber Cake (14% Moisture)',
    targetSyrupBrix: 50,
    targetFlourMoisturePct: 14.0,
    description: 'Medium concentration stream for local beverage bottling and livestock feed supplement.'
  }
];
