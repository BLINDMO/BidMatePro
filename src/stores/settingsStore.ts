import { create } from 'zustand';
import type { CompanySettings } from '../types/settings.types';
import { db } from '../db/database';
import { DEFAULT_SETTINGS, ensureSeeded } from '../db/seeds';
import { generateJobNumber, generateInvoiceNumber } from '../utils/ids';

interface SettingsStore {
  settings: CompanySettings | null;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  saveSettings: (data: Partial<CompanySettings>) => Promise<void>;
  updateLaborRate: (role: string, rate: number) => Promise<void>;
  getLaborRate: (role: string) => number;
  getNextJobNumber: () => Promise<string>;
  getNextInvoiceNumber: () => Promise<string>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isLoaded: false,

  loadSettings: async () => {
    await ensureSeeded();
    const settings = (await db.settings.get(1)) ?? DEFAULT_SETTINGS;
    set({ settings, isLoaded: true });
  },

  saveSettings: async (data) => {
    const current = get().settings ?? DEFAULT_SETTINGS;
    const updated = { ...current, ...data, id: 1 };
    await db.settings.put(updated);
    set({ settings: updated });
  },

  updateLaborRate: async (role, rate) => {
    const current = get().settings ?? DEFAULT_SETTINGS;
    const updated = { ...current, laborRates: { ...current.laborRates, [role]: rate } };
    await db.settings.put(updated);
    set({ settings: updated });
  },

  getLaborRate: (role) => get().settings?.laborRates[role] ?? 0,

  getNextJobNumber: async () => {
    const current = get().settings ?? DEFAULT_SETTINGS;
    const num = generateJobNumber(current.jobNumberPrefix, current.nextJobNumber);
    const updated = { ...current, nextJobNumber: current.nextJobNumber + 1 };
    await db.settings.put(updated);
    set({ settings: updated });
    return num;
  },

  getNextInvoiceNumber: async () => {
    const current = get().settings ?? DEFAULT_SETTINGS;
    const num = generateInvoiceNumber(current.invoiceNumberPrefix, current.nextInvoiceNumber);
    const updated = { ...current, nextInvoiceNumber: current.nextInvoiceNumber + 1 };
    await db.settings.put(updated);
    set({ settings: updated });
    return num;
  },
}));
