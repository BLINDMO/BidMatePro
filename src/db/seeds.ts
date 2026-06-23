import type { CompanySettings } from '../types/settings.types';
import { db } from './database';

export const DEFAULT_SETTINGS: CompanySettings = {
  id: 1,
  companyName: 'Your Company Name',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: 'OR',
  zip: '',
  licenseNumber: '',
  defaultMarkupPct: 20,
  defaultTaxPct: 0,
  defaultDepositPct: 33,
  laborRates: {
    'Demolition / Laborer': 65,
    'General Labor': 75,
    Painter: 72,
    'Flooring Installer': 80,
    'Tile Setter': 85,
    Framer: 88,
    'Finish Carpenter': 100,
    'Cabinet Installer': 92,
    'Drywall Hanger/Finisher': 75,
    Roofer: 85,
    'Licensed Electrician': 115,
    'Electrician – Apprentice': 75,
    'Licensed Plumber': 125,
    'Plumber – Apprentice': 80,
    'HVAC Technician': 115,
    'Concrete Finisher': 92,
    'Insulation Installer': 72,
    'Landscaper / Hardscape': 72,
    'Project Manager / Foreman': 108,
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
