export interface CompanySettings {
  id: number;

  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  licenseNumber: string;
  insuranceInfo?: string;
  logoDataUrl?: string;

  defaultMarkupPct: number;
  defaultTaxPct: number;
  defaultDepositPct: number;

  laborRates: Record<string, number>;

  defaultPaymentTerms: string;
  estimateValidityDays: number;
  estimateDisclaimer: string;
  invoicePaymentTerms: string;
  invoiceFooter: string;

  nextJobNumber: number;
  nextInvoiceNumber: number;
  nextEstimateNumber: number;
  jobNumberPrefix: string;
  invoiceNumberPrefix: string;
  estimateNumberPrefix: string;
}
