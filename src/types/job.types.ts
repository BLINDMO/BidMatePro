export type JobStatus =
  | 'lead'
  | 'estimate'
  | 'approved'
  | 'active'
  | 'on-hold'
  | 'complete'
  | 'invoiced'
  | 'paid'
  | 'cancelled';

export const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg: string }> = {
  lead: { label: 'Lead', color: '#8896B3', bg: 'rgba(136,150,179,0.12)' },
  estimate: { label: 'Estimate', color: '#F5A623', bg: 'rgba(245,166,35,0.14)' },
  approved: { label: 'Approved', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  active: { label: 'Active', color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)' },
  'on-hold': { label: 'On Hold', color: '#C084FC', bg: 'rgba(192,132,252,0.12)' },
  complete: { label: 'Complete', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  invoiced: { label: 'Invoiced', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  paid: { label: 'Paid', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  cancelled: { label: 'Cancelled', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
};

export const STATUS_ORDER: JobStatus[] = [
  'lead',
  'estimate',
  'approved',
  'active',
  'on-hold',
  'complete',
  'invoiced',
  'paid',
  'cancelled',
];

export type LineItemType =
  | 'labor'
  | 'material'
  | 'subcontractor'
  | 'equipment'
  | 'permit'
  | 'allowance'
  | 'credit';

export type PaymentMethod = 'cash' | 'check' | 'card' | 'venmo' | 'zelle' | 'ach' | 'other';

export type PhotoPhase = 'before' | 'during' | 'after' | 'issue' | 'completion';

export interface LineItem {
  id: string;
  type: LineItemType;
  phase?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  notes?: string;
  sortOrder: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  checkNumber?: string;
  memo?: string;
}

export interface Photo {
  id: string;
  jobId: string;
  dataUrl: string;
  thumbnail: string;
  caption?: string;
  phase: PhotoPhase;
  timestamp: string;
  linkedMeasurementId?: string;
}

export interface Measurement {
  id: string;
  jobId: string;
  label: string;
  type: 'area' | 'linear' | 'volume' | 'custom';
  unit: 'ft' | 'in';
  length?: number;
  width?: number;
  height?: number;
  sqft?: number;
  sqftWithWaste?: number;
  linearFt?: number;
  cubicFt?: number;
  wasteFactor: number;
  notes?: string;
  linkedPhotoId?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  status: JobStatus;

  clientId: string;
  clientName: string;

  jobAddress: string;
  jobCity: string;
  jobState: string;
  jobZip: string;

  categoryId: string;
  categoryName: string;
  subcategories: string[];
  tags: string[];

  lineItems: LineItem[];

  laborTotal: number;
  materialsTotal: number;
  subsTotal: number;
  permitsTotal: number;
  equipmentTotal: number;
  allowancesTotal: number;
  creditsTotal: number;
  subtotal: number;
  overheadMarkupPct: number;
  overheadMarkupAmt: number;
  taxPct: number;
  taxAmt: number;
  estimateTotal: number;

  depositPct: number;
  depositAmt: number;
  payments: Payment[];
  totalPaid: number;
  balanceDue: number;

  createdAt: string;
  updatedAt: string;
  estimateSentAt?: string;
  approvedAt?: string;
  startDate?: string;
  estimatedEndDate?: string;
  actualCompletionDate?: string;
  invoiceSentAt?: string;
  paidAt?: string;

  photos: Photo[];
  measurements: Measurement[];
  notes: string;
  internalNotes: string;
  estimateNotes: string;
  invoiceNotes: string;
}
