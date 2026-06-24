import type { CompanySettings } from '../types/settings.types';
import { db } from './database';

export const DEFAULT_SETTINGS: CompanySettings = {
  id: 1,
  companyName: 'Honeycutt Construction',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  city: 'Kansas City',
  state: 'MO',
  zip: '',
  licenseNumber: '',
  defaultMarkupPct: 10,
  defaultTaxPct: 0,
  defaultDepositPct: 33,
  // Default crew labor billed at a flat $125/hr; adjustable per role in Settings.
  laborRates: {
    'Demolition / Laborer': 125,
    'General Labor': 125,
    Painter: 125,
    'Flooring Installer': 125,
    'Tile Setter': 125,
    Framer: 125,
    'Finish Carpenter': 125,
    'Cabinet Installer': 125,
    'Drywall Hanger/Finisher': 125,
    Roofer: 125,
    'Licensed Electrician': 125,
    'Electrician – Apprentice': 125,
    'Licensed Plumber': 125,
    'Plumber – Apprentice': 125,
    'HVAC Technician': 125,
    'Concrete Finisher': 125,
    'Insulation Installer': 125,
    'Landscaper / Hardscape': 125,
    'Project Manager / Foreman': 125,
  },
  defaultPaymentTerms: 'Net 15 — due within 15 days of invoice date',
  estimateValidityDays: 30,
  estimateDisclaimer:
    'Estimate valid for 30 days. Prices subject to change based on material costs. ' +
    'Work not specified herein billed as change orders.',
  invoicePaymentTerms: 'Payment due within 15 days. Cash, check, Venmo, Zelle accepted.',
  invoiceFooter: 'Thank you for your business! Licensed & Insured.',
  nextJobNumber: 1,
  nextInvoiceNumber: 1,
  nextEstimateNumber: 1,
  jobNumberPrefix: 'J',
  invoiceNumberPrefix: 'INV',
  estimateNumberPrefix: 'EST',
};

export async function ensureSeeded(): Promise<void> {
  const existing = await db.settings.get(1);
  if (!existing) {
    await db.settings.put(DEFAULT_SETTINGS);
  }
}
