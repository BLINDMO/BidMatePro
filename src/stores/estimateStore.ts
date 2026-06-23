import { create } from 'zustand';
import type { LineItem } from '../types/job.types';
import { calcJobTotals, calcItemTotal } from '../utils/calculations';
import { newId } from '../utils/ids';
import { useJobStore } from './jobStore';
import { useSettingsStore } from './settingsStore';
import { useClientStore } from './clientStore';
import type { Job } from '../types/job.types';

interface EstimateState {
  categoryId: string | null;
  categoryName: string;
  clientId: string | null;
  clientName: string;
  jobAddress: string;
  jobCity: string;
  jobState: string;
  jobZip: string;
  clientPhone: string;
  clientEmail: string;
  subcategories: string[];
  scopeNotes: string;
  lineItems: LineItem[];
  overheadMarkupPct: number;
  taxPct: number;
  depositPct: number;
  startDate: string;
  estimateNotes: string;

  editingJobId: string | null;

  setCategory: (id: string, name: string) => void;
  setClient: (data: {
    id: string | null;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
  }) => void;
  toggleSubcategory: (sub: string) => void;
  setScopeNotes: (notes: string) => void;
  addLineItem: (item: Omit<LineItem, 'id' | 'sortOrder' | 'total'>) => void;
  updateLineItem: (id: string, data: Partial<LineItem>) => void;
  removeLineItem: (id: string) => void;
  setMarkup: (pct: number) => void;
  setTax: (pct: number) => void;
  setDeposit: (pct: number) => void;
  setStartDate: (d: string) => void;
  setEstimateNotes: (n: string) => void;
  clearDraft: () => void;
  loadFromJob: (job: Job) => void;
  save: () => Promise<Job>;
}

const initial = () => {
  const s = useSettingsStore.getState().settings;
  return {
    categoryId: null,
    categoryName: '',
    clientId: null,
    clientName: '',
    jobAddress: '',
    jobCity: '',
    jobState: s?.state ?? 'OR',
    jobZip: '',
    clientPhone: '',
    clientEmail: '',
    subcategories: [] as string[],
    scopeNotes: '',
    lineItems: [] as LineItem[],
    overheadMarkupPct: s?.defaultMarkupPct ?? 20,
    taxPct: s?.defaultTaxPct ?? 0,
    depositPct: s?.defaultDepositPct ?? 33,
    startDate: '',
    estimateNotes: s?.estimateDisclaimer ?? '',
    editingJobId: null as string | null,
  };
};

export const useEstimateStore = create<EstimateState>((set, get) => ({
  ...initial(),

  setCategory: (id, name) => set({ categoryId: id, categoryName: name }),

  setClient: (data) =>
    set({
      clientId: data.id,
      clientName: data.name,
      jobAddress: data.address,
      jobCity: data.city,
      jobState: data.state,
      jobZip: data.zip,
      clientPhone: data.phone,
      clientEmail: data.email,
    }),

  toggleSubcategory: (sub) =>
    set((st) => ({
      subcategories: st.subcategories.includes(sub)
        ? st.subcategories.filter((s) => s !== sub)
        : [...st.subcategories, sub],
    })),

  setScopeNotes: (notes) => set({ scopeNotes: notes }),

  addLineItem: (item) =>
    set((st) => ({
      lineItems: [
        ...st.lineItems,
        {
          ...item,
          id: newId(),
          sortOrder: st.lineItems.length,
          total: calcItemTotal(item.quantity, item.unitPrice),
        },
      ],
    })),

  updateLineItem: (id, data) =>
    set((st) => ({
      lineItems: st.lineItems.map((i) => {
        if (i.id !== id) return i;
        const merged = { ...i, ...data };
        merged.total = calcItemTotal(merged.quantity, merged.unitPrice);
        return merged;
      }),
    })),

  removeLineItem: (id) =>
    set((st) => ({ lineItems: st.lineItems.filter((i) => i.id !== id) })),

  setMarkup: (pct) => set({ overheadMarkupPct: pct }),
  setTax: (pct) => set({ taxPct: pct }),
  setDeposit: (pct) => set({ depositPct: pct }),
  setStartDate: (d) => set({ startDate: d }),
  setEstimateNotes: (n) => set({ estimateNotes: n }),

  clearDraft: () => set({ ...initial() }),

  loadFromJob: (job) =>
    set({
      categoryId: job.categoryId,
      categoryName: job.categoryName,
      clientId: job.clientId,
      clientName: job.clientName,
      jobAddress: job.jobAddress,
      jobCity: job.jobCity,
      jobState: job.jobState,
      jobZip: job.jobZip,
      subcategories: job.subcategories,
      lineItems: job.lineItems,
      overheadMarkupPct: job.overheadMarkupPct,
      taxPct: job.taxPct,
      depositPct: job.depositPct,
      startDate: job.startDate ?? '',
      estimateNotes: job.estimateNotes,
      editingJobId: job.id,
    }),

  save: async () => {
    const st = get();
    const jobStore = useJobStore.getState();

    if (st.editingJobId) {
      const existing = jobStore.getJob(st.editingJobId)!;
      const updated: Job = {
        ...existing,
        categoryId: st.categoryId ?? existing.categoryId,
        categoryName: st.categoryName,
        clientId: st.clientId ?? existing.clientId,
        clientName: st.clientName,
        clientPhone: st.clientPhone,
        clientEmail: st.clientEmail,
        jobAddress: st.jobAddress,
        jobCity: st.jobCity,
        jobState: st.jobState,
        jobZip: st.jobZip,
        subcategories: st.subcategories,
        lineItems: st.lineItems,
        overheadMarkupPct: st.overheadMarkupPct,
        taxPct: st.taxPct,
        depositPct: st.depositPct,
        startDate: st.startDate || undefined,
        estimateNotes: st.estimateNotes,
      };
      await jobStore.saveJob(updated);
      get().clearDraft();
      return jobStore.getJob(updated.id)!;
    }

    // Ensure a client record exists for new, hand-typed clients.
    let clientId = st.clientId;
    if (!clientId && st.clientName.trim()) {
      const created = await useClientStore.getState().createClient({
        name: st.clientName,
        phone: st.clientPhone,
        email: st.clientEmail,
        billingAddress: st.jobAddress,
      });
      clientId = created.id;
    }

    const jobNumber = await useSettingsStore.getState().getNextJobNumber();
    const job = await jobStore.createJob({
      jobNumber,
      status: 'estimate',
      categoryId: st.categoryId ?? '',
      categoryName: st.categoryName,
      clientId: clientId ?? '',
      clientName: st.clientName,
      clientPhone: st.clientPhone,
      clientEmail: st.clientEmail,
      jobAddress: st.jobAddress,
      jobCity: st.jobCity,
      jobState: st.jobState,
      jobZip: st.jobZip,
      subcategories: st.subcategories,
      lineItems: st.lineItems,
      overheadMarkupPct: st.overheadMarkupPct,
      taxPct: st.taxPct,
      depositPct: st.depositPct,
      startDate: st.startDate || undefined,
      estimateNotes: st.estimateNotes,
      notes: st.scopeNotes,
    });
    get().clearDraft();
    return job;
  },
}));

/** Live totals selector for the draft. */
export function useEstimateTotals() {
  const lineItems = useEstimateStore((s) => s.lineItems);
  const markup = useEstimateStore((s) => s.overheadMarkupPct);
  const tax = useEstimateStore((s) => s.taxPct);
  return calcJobTotals(lineItems, markup, tax);
}
