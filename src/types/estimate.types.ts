export interface MaterialPreset {
  id: string;
  categoryId?: string;
  name: string;
  unit: string;
  defaultPrice: number;
  priceMin: number;
  priceMax: number;
  notes?: string;
}

export interface LaborPreset {
  id: string;
  role: string;
  defaultRate: number;
  rateMin: number;
  rateMax: number;
  unit: 'hr' | 'day';
}
