import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Mail, MoreVertical, FileText, DollarSign, Camera, Trash2, Copy, Pencil, Plus } from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';
import { useEstimateStore } from '../../stores/estimateStore';
import { useUIStore } from '../../stores/uiStore';
import { useCameraCapture } from '../../hooks/useCamera';
import { db } from '../../db/database';
import { newId } from '../../utils/ids';
import { fmtCurrency, fmtCurrencyFull, fmtDate } from '../../utils/format';
import { STATUS_CONFIG, STATUS_ORDER, type JobStatus, type LineItemType, type PaymentMethod, type PhotoPhase, type Photo } from '../../types/job.types';
import ScreenHeader from '../../components/layout/ScreenHeader';
import StatusBadge from '../../components/job/StatusBadge';
import CategoryBadge from '../../components/job/CategoryBadge';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BottomSheet from '../../components/ui/BottomSheet';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_SECTIONS: { type: LineItemType; label: string; icon: string }[] = [
  { type: 'labor', label: 'Labor', icon: '👷' },
  { type: 'material', label: 'Materials', icon: '📦' },
  { type: 'subcontractor', label: 'Subcontractors', icon: '🔨' },
  { type: 'permit', label: 'Permits', icon: '📋' },
  { type: 'equipment', label: 'Equipment', icon: '🚜' },
  { type: 'allowance', label: 'Allowances', icon: '💰' },
  { type: 'credit', label: 'Credits', icon: '➖' },
];

const PHASES: { id: PhotoPhase | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'before', label: 'Before' },
  { id: 'during', label: 'During' },
  { id: 'after', label: 'After' },
  { id: 'issue', label: 'Issues' },
];

export default function JobDetailScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const job = useJobStore((s) => s.jobs.find((j) => j.id === id));
  const updateStatus = useJobStore((s) => s.updateStatus);
  const saveJob = useJobStore((s) => s.saveJob);
  const addLineItem = useJobStore((s) => s.addLineItem);
  const addPayment = useJobStore((s) => s.addPayment);
  const deleteJob = useJobStore((s) => s.deleteJob);
  const duplicateJob = useJobStore((s) => s.duplicateJob);
  const loadFromJob = useEstimateStore((s) => s.loadFromJob);
  const showToast = useUIStore((s) => s.showToast);
  const { capturePhoto } = useCameraCapture();

  const [tab, setTab] = useState('overview');
  const [photoPhase, setPhotoPhase] = useState<PhotoPhase | 'all'>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [notes, setNotes] = useState(job?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(job?.internalNotes ?? '');
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('check');

  // Add-item form
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemType, setItemType] = useState<LineItemType>('labor');
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('hr');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCO, setItemCO] = useState(false);

  if (!job) {
    return (
      <div>
        <ScreenHeader title="Job" back />
        <EmptyState icon="🤷" title="Job not found" />
      </div>
    );
  }

  const editEstimate = () => {
    loadFromJob(job);
    navigate(`/estimate/${job.id}/edit`);
  };

  const onCapturePhoto = () => {
    capturePhoto(async (full, thumb) => {
      const photo = {
        id: newId(),
        jobId: job.id,
        dataUrl: full,
        thumbnail: thumb,
        phase: (photoPhase === 'all' ? 'before' : photoPhase) as PhotoPhase,
        timestamp: new Date().toISOString(),
      };
      await db.photos.put(photo);
      await saveJob({ ...job, photos: [...job.photos, photo] });
      showToast('Photo added');
    });
  };

  const updatePhoto = async (photoId: string, data: Partial<Photo>) => {
    const photos = job.photos.map((p) => (p.id === photoId ? { ...p, ...data } : p));
    const updated = photos.find((p) => p.id === photoId)!;
    await db.photos.put(updated);
    await saveJob({ ...job, photos });
    setViewPhoto(updated);
  };

  const deletePhoto = async (photoId: string) => {
    await db.photos.delete(photoId);
    await saveJob({ ...job, photos: job.photos.filter((p) => p.id !== photoId) });
    setViewPhoto(null);
    showToast('Photo deleted', 'info');
  };

  const saveNotes = async () => {
    await saveJob({ ...job, notes, internalNotes });
    showToast('Notes saved');
  };

  const submitItem = async () => {
    const qty = Number(itemQty);
    const price = Number(itemPrice);
    if (!itemDesc.trim() || !qty || !price) return;
    await addLineItem(job.id, {
      type: itemType,
      description: itemDesc,
      quantity: qty,
      unit: itemUnit,
      unitPrice: price,
      isChangeOrder: itemCO,
    });
    setItemDesc('');
    setItemQty('');
    setItemPrice('');
    setItemCO(false);
    setAddItemOpen(false);
    showToast(itemCO ? 'Change order added' : 'Item added');
  };

  const recordPayment = async () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    await addPayment(job.id, { amount: amt, date: new Date().toISOString(), method: payMethod });
    setPayAmount('');
    setPayOpen(false);
    showToast('Payment recorded');
  };

  const filteredPhotos =
    photoPhase === 'all' ? job.photos : job.photos.filter((p) => p.phase === photoPhase);

  return (
    <div className="pb-24">
      <ScreenHeader
        title={job.jobNumber}
        back
        right={
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-elev"
            aria-label="Menu"
          >
            <MoreVertical size={20} className="text-ink-1" />
          </button>
        }
      />

      <div className="px-5 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink-1">{job.clientName}</h2>
          <StatusBadge status={job.status} />
        </div>
        <p className="mt-0.5 text-sm text-ink-2">
          {job.jobAddress}
          {job.jobCity ? `, ${job.jobCity}` : ''} {job.jobState} {job.jobZip}
        </p>
      </div>

      {/* Money row */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 px-5">
        <Money label="Estimate" value={fmtCurrency(job.estimateTotal)} accent="text-ink-1" />
        <Money label="Paid" value={fmtCurrency(job.totalPaid)} accent="text-jade" />
        <Money
          label="Balance"
          value={fmtCurrency(job.balanceDue)}
          accent={job.balanceDue > 0 ? 'text-rose' : 'text-jade'}
        />
      </div>

      <div className="mt-5 px-5">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'items', label: 'Items' },
            { id: 'photos', label: 'Photos' },
            { id: 'notes', label: 'Notes' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-4 space-y-3 px-5">
        {tab === 'overview' && (
          <>
            <div className="flex flex-wrap gap-2">
              <CategoryBadge categoryId={job.categoryId} name={job.categoryName} />
            </div>
            {job.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.subcategories.map((s) => (
                  <span key={s} className="rounded-lg bg-surf px-2 py-1 text-xs text-ink-2">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-line bg-sky/5 p-3">
                <p className="text-xs text-ink-2">Labor</p>
                <p className="text-lg font-bold text-sky">{fmtCurrency(job.laborTotal)}</p>
              </div>
              <div className="rounded-2xl border border-line bg-violet/5 p-3">
                <p className="text-xs text-ink-2">Materials</p>
                <p className="text-lg font-bold text-violet">{fmtCurrency(job.materialsTotal)}</p>
              </div>
            </div>
            <Card>
              <div className="flex justify-between text-sm">
                <span className="text-ink-2">Start Date</span>
                <span className="text-ink-1">{job.startDate ? fmtDate(job.startDate) : '—'}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-ink-2">Created</span>
                <span className="text-ink-1">{fmtDate(job.createdAt)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-ink-2">Deposit ({job.depositPct}%)</span>
                <span className="text-ink-1">{fmtCurrency(job.depositAmt)}</span>
              </div>
            </Card>
            {(job.clientPhone || job.clientEmail) && (
              <div className="flex gap-2">
                {job.clientPhone && (
                  <a
                    href={`tel:${job.clientPhone}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-md bg-elev py-2.5 text-sm text-ink-1"
                  >
                    <Phone size={16} /> Call
                  </a>
                )}
                {job.clientEmail && (
                  <a
                    href={`mailto:${job.clientEmail}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-md bg-elev py-2.5 text-sm text-ink-1"
                  >
                    <Mail size={16} /> Email
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'items' && (
          <>
            {job.lineItems.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No line items"
                subtitle="Edit the estimate to add labor and materials."
                action={<Button onClick={editEstimate}>Edit Estimate</Button>}
              />
            ) : (
              TYPE_SECTIONS.map(({ type, label, icon }) => {
                const items = job.lineItems.filter((i) => i.type === type);
                if (items.length === 0) return null;
                const subtotal = items.reduce((s, i) => s + i.total, 0);
                return (
                  <Card key={type}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink-1">
                        {icon} {label}
                      </span>
                      <span className="text-sm font-semibold text-ink-2">
                        {fmtCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((i) => (
                        <div key={i.id} className="flex justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate text-ink-1">
                              {i.description}
                              {i.isChangeOrder && (
                                <span className="ml-1.5 rounded bg-amber-dim px-1 py-0.5 text-[10px] font-semibold text-amber">
                                  CO
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-ink-3">
                              {i.quantity} {i.unit} × {fmtCurrencyFull(i.unitPrice)}
                            </p>
                          </div>
                          <span className="shrink-0 font-medium text-ink-1">
                            {fmtCurrency(i.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" onClick={() => setAddItemOpen(true)}>
                <Plus size={16} /> Add Item
              </Button>
              <Button variant="secondary" onClick={editEstimate}>
                <Pencil size={16} /> Edit Items
              </Button>
            </div>
          </>
        )}

        {tab === 'photos' && (
          <>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {PHASES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPhotoPhase(p.id)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
                    photoPhase === p.id
                      ? 'border-amber/40 bg-amber-dim text-amber'
                      : 'border-line-md bg-surf text-ink-2'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {filteredPhotos.length === 0 ? (
              <EmptyState icon="📷" title="No photos" subtitle="Document the job site." />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredPhotos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setViewPhoto(p)}
                    className="aspect-square overflow-hidden rounded-xl bg-elev"
                  >
                    <img src={p.thumbnail} alt={p.caption ?? p.phase} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <Button variant="secondary" full onClick={onCapturePhoto}>
              <Camera size={18} /> Add Photo
            </Button>
          </>
        )}

        {tab === 'notes' && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm text-ink-2">
                Client Notes <span className="text-ink-3">· printed on documents</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-line-md bg-surf px-3.5 py-2.5 text-[15px] text-ink-1 outline-none focus:border-amber/60"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-ink-2">
                Internal Notes <span className="text-ink-3">· private, never printed</span>
              </span>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-line-md bg-surf px-3.5 py-2.5 text-[15px] text-ink-1 outline-none focus:border-amber/60"
              />
            </label>
            <Button full onClick={saveNotes}>
              Save Notes
            </Button>
          </>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-line bg-surf/95 px-5 py-3 backdrop-blur-md safe-bottom">
        <div className="flex gap-2.5">
          <Button variant="secondary" full onClick={() => navigate(`/jobs/${job.id}/invoice`)}>
            <FileText size={18} /> Invoice
          </Button>
          <Button full onClick={() => setPayOpen(true)}>
            <DollarSign size={18} /> Payment
          </Button>
        </div>
      </div>

      {/* Overflow menu */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Job Actions">
        <div className="space-y-1">
          <MenuRow icon={<Pencil size={18} />} label="Edit Estimate" onClick={() => { setMenuOpen(false); editEstimate(); }} />
          <MenuRow icon={<DollarSign size={18} />} label="Change Status" onClick={() => { setMenuOpen(false); setStatusOpen(true); }} />
          <MenuRow
            icon={<Copy size={18} />}
            label="Duplicate Job"
            onClick={async () => {
              const dup = await duplicateJob(job.id);
              setMenuOpen(false);
              if (dup) {
                showToast('Job duplicated');
                navigate(`/jobs/${dup.id}`);
              }
            }}
          />
          <MenuRow
            icon={<Trash2 size={18} />}
            label="Delete Job"
            danger
            onClick={async () => {
              if (confirm('Delete this job permanently?')) {
                await deleteJob(job.id);
                showToast('Job deleted', 'info');
                navigate('/jobs');
              }
            }}
          />
        </div>
      </BottomSheet>

      {/* Status change */}
      <BottomSheet open={statusOpen} onClose={() => setStatusOpen(false)} title="Change Status">
        <div className="grid grid-cols-2 gap-2">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={async () => {
                await updateStatus(job.id, s as JobStatus);
                setStatusOpen(false);
                showToast(`Status: ${STATUS_CONFIG[s].label}`);
              }}
              className="rounded-xl border px-3 py-2.5 text-sm font-medium"
              style={{
                color: STATUS_CONFIG[s].color,
                backgroundColor: STATUS_CONFIG[s].bg,
                borderColor: job.status === s ? STATUS_CONFIG[s].color : 'transparent',
              }}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Record payment */}
      <BottomSheet open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment">
        <div className="space-y-3">
          <p className="text-sm text-ink-2">
            Balance due: <span className="font-semibold text-rose">{fmtCurrencyFull(job.balanceDue)}</span>
          </p>
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0.00"
          />
          <Select
            label="Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'check', label: 'Check' },
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'venmo', label: 'Venmo' },
              { value: 'zelle', label: 'Zelle' },
              { value: 'ach', label: 'ACH' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" full onClick={() => setPayAmount(String(job.balanceDue))}>
              Full Balance
            </Button>
            <Button full onClick={recordPayment}>
              Record
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Add line item */}
      <BottomSheet open={addItemOpen} onClose={() => setAddItemOpen(false)} title="Add Line Item">
        <div className="space-y-3">
          <Select
            label="Type"
            value={itemType}
            onChange={(e) => {
              const t = e.target.value as LineItemType;
              setItemType(t);
              setItemUnit(t === 'labor' ? 'hr' : t === 'allowance' ? 'allow' : 'ea');
            }}
            options={[
              { value: 'labor', label: '👷 Labor' },
              { value: 'material', label: '📦 Material' },
              { value: 'subcontractor', label: '🔨 Subcontractor' },
              { value: 'permit', label: '📋 Permit' },
              { value: 'equipment', label: '🚜 Equipment' },
              { value: 'allowance', label: '💰 Allowance' },
              { value: 'credit', label: '➖ Credit' },
            ]}
          />
          <Input label="Description" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
          <div className="grid grid-cols-3 gap-2.5">
            <Input label="Qty" type="number" inputMode="decimal" value={itemQty} onChange={(e) => setItemQty(e.target.value)} />
            <Input label="Unit" value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} />
            <Input label="Price" type="number" inputMode="decimal" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
          </div>
          <button
            onClick={() => setItemCO(!itemCO)}
            className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm ${
              itemCO ? 'border-amber/40 bg-amber-dim text-amber' : 'border-line-md bg-surf text-ink-2'
            }`}
          >
            <span>Mark as change order</span>
            <span className={`h-5 w-9 rounded-full p-0.5 transition ${itemCO ? 'bg-amber' : 'bg-elev'}`}>
              <span className={`block h-4 w-4 rounded-full bg-white transition ${itemCO ? 'translate-x-4' : ''}`} />
            </span>
          </button>
          <Button full onClick={submitItem} disabled={!itemDesc.trim() || !itemQty || !itemPrice}>
            Add Item
          </Button>
        </div>
      </BottomSheet>

      {/* Full-screen photo viewer */}
      {viewPhoto && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95">
          <div className="flex justify-end p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top)+12px)' }}>
            <button
              onClick={() => deletePhoto(viewPhoto.id)}
              className="mr-2 rounded-full bg-rose/20 px-3 py-1.5 text-sm text-rose"
            >
              Delete
            </button>
            <button
              onClick={() => setViewPhoto(null)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white"
            >
              Close
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-4">
            <img src={viewPhoto.dataUrl} alt={viewPhoto.caption ?? 'Photo'} className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
          <div className="space-y-3 p-4 safe-bottom">
            <div className="flex gap-1.5 overflow-x-auto">
              {PHASES.filter((p) => p.id !== 'all').map((p) => (
                <button
                  key={p.id}
                  onClick={() => updatePhoto(viewPhoto.id, { phase: p.id as PhotoPhase })}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                    viewPhoto.phase === p.id ? 'bg-amber text-bg' : 'bg-white/10 text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              value={viewPhoto.caption ?? ''}
              onChange={(e) => setViewPhoto({ ...viewPhoto, caption: e.target.value })}
              onBlur={(e) => updatePhoto(viewPhoto.id, { caption: e.target.value })}
              placeholder="Add a caption…"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Money({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3 text-center">
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
      <p className="text-[11px] text-ink-2">{label}</p>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] active:bg-elev ${
        danger ? 'text-rose' : 'text-ink-1'
      }`}
    >
      {icon} {label}
    </button>
  );
}
