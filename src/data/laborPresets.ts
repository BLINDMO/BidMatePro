import type { LaborPreset } from '../types/estimate.types';

export const LABOR_PRESETS: LaborPreset[] = [
  { id: 'l01', role: 'Demolition / Laborer', defaultRate: 65, rateMin: 50, rateMax: 82, unit: 'hr' },
  { id: 'l02', role: 'General Labor', defaultRate: 75, rateMin: 60, rateMax: 90, unit: 'hr' },
  { id: 'l03', role: 'Painter', defaultRate: 72, rateMin: 60, rateMax: 88, unit: 'hr' },
  { id: 'l04', role: 'Flooring Installer', defaultRate: 80, rateMin: 65, rateMax: 96, unit: 'hr' },
  { id: 'l05', role: 'Tile Setter', defaultRate: 85, rateMin: 70, rateMax: 108, unit: 'hr' },
  { id: 'l06', role: 'Framer', defaultRate: 88, rateMin: 72, rateMax: 110, unit: 'hr' },
  { id: 'l07', role: 'Finish Carpenter', defaultRate: 100, rateMin: 85, rateMax: 128, unit: 'hr' },
  { id: 'l08', role: 'Cabinet Installer', defaultRate: 92, rateMin: 78, rateMax: 115, unit: 'hr' },
  { id: 'l09', role: 'Drywall Hanger/Finisher', defaultRate: 75, rateMin: 62, rateMax: 92, unit: 'hr' },
  { id: 'l10', role: 'Roofer', defaultRate: 85, rateMin: 70, rateMax: 108, unit: 'hr' },
  { id: 'l11', role: 'Licensed Electrician', defaultRate: 115, rateMin: 95, rateMax: 142, unit: 'hr' },
  { id: 'l12', role: 'Electrician – Apprentice', defaultRate: 75, rateMin: 60, rateMax: 90, unit: 'hr' },
  { id: 'l13', role: 'Licensed Plumber', defaultRate: 125, rateMin: 105, rateMax: 155, unit: 'hr' },
  { id: 'l14', role: 'Plumber – Apprentice', defaultRate: 80, rateMin: 65, rateMax: 98, unit: 'hr' },
  { id: 'l15', role: 'HVAC Technician', defaultRate: 115, rateMin: 95, rateMax: 140, unit: 'hr' },
  { id: 'l16', role: 'Concrete Finisher', defaultRate: 92, rateMin: 75, rateMax: 115, unit: 'hr' },
  { id: 'l17', role: 'Insulation Installer', defaultRate: 72, rateMin: 58, rateMax: 88, unit: 'hr' },
  { id: 'l18', role: 'Landscaper / Hardscape', defaultRate: 72, rateMin: 58, rateMax: 90, unit: 'hr' },
  { id: 'l19', role: 'Project Manager / Foreman', defaultRate: 108, rateMin: 90, rateMax: 138, unit: 'hr' },
];
