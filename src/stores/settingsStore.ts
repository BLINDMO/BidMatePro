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
    let settings = (await db.settings.get(1)) ?? DEFAULT_SETTINGS;

    // One-time reprice to the Kansas City, MO defaults (flat $125/hr labor,
    // 10% markup). Runs once; preserves company info already entered.
    const MIGRATION_KEY = 'bidmate-kc-defaults-v1';
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(MIGRATION_KEY)) {
      const laborRates = { ...settings.laborRates };
      for (const role of Object.keys(laborRates)) laborRates[role] = 125;
      settings = { ...settings, laborRates, defaultMarkupPct: 10 };
      await db.settings.put(settings);
      localStorage.setItem(MIGRATION_KEY, '1');
    }

    // One-time: seed the Heller Construction brand logo + name if not yet set.
    const BRAND_KEY = 'bidmate-brand-logo-v1';
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(BRAND_KEY) && !settings.logoDataUrl) {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}brand/heller-logo.png`);
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        settings = {
          ...settings,
          logoDataUrl: dataUrl,
          companyName:
            settings.companyName === 'Your Company Name' ? 'Heller Construction' : settings.companyName,
        };
        await db.settings.put(settings);
        localStorage.setItem(BRAND_KEY, '1');
      } catch {
        /* asset unavailable offline on first run — will retry next load */
      }
    }

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
