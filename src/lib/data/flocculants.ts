import { FlocculantModule } from '../types';

export const FLOCCULANT_MODULES: FlocculantModule[] = [
  {
    id: 'rice_gruel',
    name: 'Rice Gruel Extract (Cashew Validated)',
    flocDiameterMicrons: 135, // 135 microns
    flocDensityKgM3: 1160, // 1160 kg/m3
    typicalDosageGPerL: 2.5,
    description: 'Starch-protein complex from rice processing waste. Validated at Univ. of Ilorin for polyphenolic tannin aggregation.',
    validatedCrop: 'Cashew Apple Juice'
  },
  {
    id: 'chitosan',
    name: 'Biopolymer Chitosan',
    flocDiameterMicrons: 185, // 185 microns
    flocDensityKgM3: 1220, // 1220 kg/m3
    typicalDosageGPerL: 1.2,
    description: 'Cationic polysaccharide derived from crustacean shell waste. High settling speed for acidic juices.',
  },
  {
    id: 'moringa_seed',
    name: 'Moringa Oleifera Seed Extract',
    flocDiameterMicrons: 98, // 98 microns
    flocDensityKgM3: 1105, // 1105 kg/m3
    typicalDosageGPerL: 3.0,
    description: 'Natural cationic protein coagulant. Eco-friendly, suitable for tropical agro-waste clarification.',
  },
  {
    id: 'none_gravitational',
    name: 'Un-assisted Gravity Settling',
    flocDiameterMicrons: 22, // 22 microns
    flocDensityKgM3: 1045, // 1045 kg/m3
    typicalDosageGPerL: 0.0,
    description: 'Natural particulate settling without flocculation aid. Requires large clarifier vessel footprint.',
  }
];
