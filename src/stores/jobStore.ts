import { create } from 'zustand';
import type { Job, JobStatus, LineItem, Payment } from '../types/job.types';
import { db } from '../db/database';
import { newId } from '../utils/ids';
import { calcJobTotals } from '../utils/calculations';

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Recompute all derived financial fields from line items + payments. */
export function recomputeJob(job: Job): Job {
  const totals = calcJobTotals(job.lineItems, job.overheadMarkupPct, job.taxPct);
  const totalPaid = r2(job.payments.reduce((s, p) => s + p.amount, 0));
  const depositAmt = r2(totals.estimateTotal * (job.depositPct / 100));
  return {
    ...job,
    ...totals,
    totalPaid,
    depositAmt,
    balanceDue: r2(totals.estimateTotal - totalPaid),
    updatedAt: new Date().toISOString(),
  };
}

const isThisMonth = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

interface JobStore {
  jobs: Job[];
  isLoading: boolean;
  loadJobs: () => Promise<void>;
  getJob: (id: string) => Job | undefined;
  createJob: (data: Partial<Job>) => Promise<Job>;
  saveJob: (job: Job) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  updateStatus: (id: string, status: JobStatus) => Promise<void>;
  addLineItem: (jobId: string, item: Omit<LineItem, 'id' | 'sortOrder' | 'total'>) => Promise<void>;
  removeLineItem: (jobId: string, itemId: string) => Promise<void>;
  addPayment: (jobId: string, payment: Omit<Payment, 'id'>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  duplicateJob: (id: string) => Promise<Job | undefined>;
  getByStatus: (status: JobStatus) => Job[];
  getMonthRevenue: () => number;
  getOpenBalance: () => number;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  isLoading: false,

  loadJobs: async () => {
    set({ isLoading: true });
    const jobs = await db.jobs.orderBy('createdAt').reverse().toArray();
    set({ jobs, isLoading: false });
  },

  getJob: (id) => get().jobs.find((j) => j.id === id),

  createJob: async (data) => {
    const now = new Date().toISOString();
    const base: Job = {
      id: newId(),
      jobNumber: data.jobNumber ?? '',
      status: data.status ?? 'estimate',
      clientId: data.clientId ?? '',
      clientName: data.clientName ?? '',
      jobAddress: data.jobAddress ?? '',
      jobCity: data.jobCity ?? '',
      jobState: data.jobState ?? '',
      jobZip: data.jobZip ?? '',
      categoryId: data.categoryId ?? '',
      categoryName: data.categoryName ?? '',
      subcategories: data.subcategories ?? [],
      tags: data.tags ?? [],
      lineItems: data.lineItems ?? [],
      laborTotal: 0,
      materialsTotal: 0,
      subsTotal: 0,
      permitsTotal: 0,
      equipmentTotal: 0,
      allowancesTotal: 0,
      creditsTotal: 0,
      subtotal: 0,
      overheadMarkupPct: data.overheadMarkupPct ?? 20,
      overheadMarkupAmt: 0,
      taxPct: data.taxPct ?? 0,
      taxAmt: 0,
      estimateTotal: 0,
      depositPct: data.depositPct ?? 33,
      depositAmt: 0,
      payments: data.payments ?? [],
      totalPaid: 0,
      balanceDue: 0,
      createdAt: now,
      updatedAt: now,
      startDate: data.startDate,
      estimatedEndDate: data.estimatedEndDate,
      photos: [],
      measurements: [],
      notes: data.notes ?? '',
      internalNotes: data.internalNotes ?? '',
      estimateNotes: data.estimateNotes ?? '',
      invoiceNotes: data.invoiceNotes ?? '',
    };
    const job = recomputeJob(base);
    await db.jobs.put(job);
    set({ jobs: [job, ...get().jobs] });
    return job;
  },

  saveJob: async (job) => {
    const updated = recomputeJob(job);
    await db.jobs.put(updated);
    set({ jobs: get().jobs.map((j) => (j.id === updated.id ? updated : j)) });
  },

  updateJob: async (id, data) => {
    const current = get().jobs.find((j) => j.id === id);
    if (!current) return;
    await get().saveJob({ ...current, ...data });
  },

  updateStatus: async (id, status) => {
    const current = get().jobs.find((j) => j.id === id);
    if (!current) return;
    const now = new Date().toISOString();
    const stamps: Partial<Job> = {};
    if (status === 'approved') stamps.approvedAt = now;
    if (status === 'complete') stamps.actualCompletionDate = now;
    if (status === 'invoiced') stamps.invoiceSentAt = now;
    if (status === 'paid') stamps.paidAt = now;
    await get().saveJob({ ...current, status, ...stamps });
  },

  addLineItem: async (jobId, item) => {
    const current = get().jobs.find((j) => j.id === jobId);
    if (!current) return;
    const li: LineItem = {
      ...item,
      id: newId(),
      sortOrder: current.lineItems.length,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    };
    await get().saveJob({ ...current, lineItems: [...current.lineItems, li] });
  },

  removeLineItem: async (jobId, itemId) => {
    const current = get().jobs.find((j) => j.id === jobId);
    if (!current) return;
    await get().saveJob({
      ...current,
      lineItems: current.lineItems.filter((i) => i.id !== itemId),
    });
  },

  addPayment: async (jobId, payment) => {
    const current = get().jobs.find((j) => j.id === jobId);
    if (!current) return;
    const p: Payment = { ...payment, id: newId() };
    const payments = [...current.payments, p];
    const totalPaid = payments.reduce((s, x) => s + x.amount, 0);
    const autoStatus: JobStatus =
      totalPaid >= current.estimateTotal && current.estimateTotal > 0 ? 'paid' : current.status;
    await get().saveJob({ ...current, payments, status: autoStatus });
  },

  deleteJob: async (id) => {
    await db.jobs.delete(id);
    set({ jobs: get().jobs.filter((j) => j.id !== id) });
  },

  duplicateJob: async (id) => {
    const current = get().jobs.find((j) => j.id === id);
    if (!current) return undefined;
    return get().createJob({
      ...current,
      jobNumber: current.jobNumber + '-copy',
      status: 'estimate',
      payments: [],
    });
  },

  getByStatus: (status) => get().jobs.filter((j) => j.status === status),

  getMonthRevenue: () =>
    get().jobs.reduce(
      (sum, j) =>
        sum + j.payments.filter((p) => isThisMonth(p.date)).reduce((s, p) => s + p.amount, 0),
      0,
    ),

  getOpenBalance: () =>
    get()
      .jobs.filter((j) => j.status !== 'cancelled' && j.status !== 'paid')
      .reduce((s, j) => s + Math.max(0, j.balanceDue), 0),
}));
