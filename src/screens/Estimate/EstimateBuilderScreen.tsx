import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Plus, Trash2, Search } from 'lucide-react';
import { CATEGORIES, getCategory } from '../../data/categories';
import { LABOR_PRESETS } from '../../data/laborPresets';
import { getMaterialPresets } from '../../data/materialPresets';
import { useEstimateStore, useEstimateTotals } from '../../stores/estimateStore';
import { useClientStore } from '../../stores/clientStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { fmtCurrencyFull } from '../../utils/format';
import { calcItemTotal } from '../../utils/calculations';
import type { LineItemType } from '../../types/job.types';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Slider from '../../components/ui/Slider';
import BottomSheet from '../../components/ui/BottomSheet';
import TotalsBlock from '../../components/estimate/TotalsBlock';
import Tabs from '../../components/ui/Tabs';

export default function EstimateBuilderScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const draft = useEstimateStore();
  const totals = useEstimateTotals();
  const showToast = useUIStore((s) => s.showToast);

  const [step, setStep] = useState(isEdit ? 4 : 1);

  // When creating fresh (not editing), reset draft on mount.
  useEffect(() => {
    if (!isEdit && !draft.categoryId && draft.lineItems.length === 0) {
      draft.clearDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(draft.categoryId);
    if (step === 2) return draft.clientName.trim().length > 0;
    return true;
  }, [step, draft.categoryId, draft.clientName]);

  const save = async () => {
    const job = await draft.save();
    showToast(isEdit ? 'Estimate updated' : 'Estimate created');
    navigate(`/jobs/${job.id}`, { replace: true });
  };

  return (
    <div className="pb-28">
      <ScreenHeader
        title={isEdit ? 'Edit Estimate' : 'New Estimate'}
        back
        onBack={() => (step > 1 && !isEdit ? setStep(step - 1) : navigate(-1))}
      />

      {/* Step progress */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step ? 'w-6 bg-amber' : s < step ? 'w-2 bg-amber/50' : 'w-2 bg-elev'
            }`}
          />
        ))}
      </div>

      <div className="px-5">
        {step === 1 && <StepCategory />}
        {step === 2 && <StepClient />}
        {step === 3 && <StepScope />}
        {step === 4 && <StepLineItems />}
        {step === 5 && <StepSummary totals={totals} />}
      </div>

      {/* Footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-line bg-surf/95 px-5 py-3 backdrop-blur-md safe-bottom">
        {step < 5 ? (
          <div className="flex gap-2.5">
            {step > 1 && !isEdit && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button full disabled={!canNext} onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <Button variant="secondary" full onClick={save}>
              Save Draft
            </Button>
            <Button full onClick={save}>
              {isEdit ? 'Save Changes' : 'Create Job'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 1: Category ─────────────────────────────── */
function StepCategory() {
  const { categoryId, setCategory } = useEstimateStore();
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-ink-1">What type of job?</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((c) => {
          const active = categoryId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id, c.name)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition ${
                active ? 'border-amber bg-amber-dim' : 'border-line bg-card'
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-sm font-medium text-ink-1">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Client ───────────────────────────────── */
function StepClient() {
  const draft = useEstimateStore();
  const clients = useClientStore((s) => s.clients);
  const [query, setQuery] = useState(draft.clientName);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4);
  }, [query, clients]);

  return (
    <div className="space-y-3">
      <h2 className="mb-1 text-xl font-bold text-ink-1">Client &amp; Location</h2>

      <Input
        label="Full Name"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          draft.setClient({
            id: null,
            name: e.target.value,
            address: draft.jobAddress,
            city: draft.jobCity,
            state: draft.jobState,
            zip: draft.jobZip,
            phone: draft.clientPhone,
            email: draft.clientEmail,
          });
        }}
        placeholder="Sarah Johnson"
      />

      {matches.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line-md">
          {matches.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setQuery(c.name);
                draft.setClient({
                  id: c.id,
                  name: c.name,
                  address: c.billingAddress ?? '',
                  city: draft.jobCity,
                  state: draft.jobState,
                  zip: draft.jobZip,
                  phone: c.phone,
                  email: c.email,
                });
              }}
              className="flex w-full items-center gap-2 border-b border-line bg-surf px-3 py-2.5 text-left text-sm text-ink-1 last:border-0 active:bg-elev"
            >
              <Search size={14} className="text-ink-3" /> {c.name}
            </button>
          ))}
        </div>
      )}

      <Input
        label="Job Address"
        value={draft.jobAddress}
        onChange={(e) => draft.setClient({ ...clientPayload(draft), address: e.target.value })}
        placeholder="1234 Oak Ave"
      />
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="City"
          value={draft.jobCity}
          onChange={(e) => draft.setClient({ ...clientPayload(draft), city: e.target.value })}
        />
        <Input
          label="ZIP"
          value={draft.jobZip}
          onChange={(e) => draft.setClient({ ...clientPayload(draft), zip: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="Phone"
          value={draft.clientPhone}
          onChange={(e) => draft.setClient({ ...clientPayload(draft), phone: e.target.value })}
        />
        <Input
          label="Email"
          value={draft.clientEmail}
          onChange={(e) => draft.setClient({ ...clientPayload(draft), email: e.target.value })}
        />
      </div>
      <Input
        label="Job Start Date (optional)"
        type="date"
        value={draft.startDate}
        onChange={(e) => draft.setStartDate(e.target.value)}
      />
    </div>
  );
}

function clientPayload(draft: ReturnType<typeof useEstimateStore.getState>) {
  return {
    id: draft.clientId,
    name: draft.clientName,
    address: draft.jobAddress,
    city: draft.jobCity,
    state: draft.jobState,
    zip: draft.jobZip,
    phone: draft.clientPhone,
    email: draft.clientEmail,
  };
}

/* ── Step 3: Scope ────────────────────────────────── */
function StepScope() {
  const draft = useEstimateStore();
  const cat = draft.categoryId ? getCategory(draft.categoryId) : undefined;
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-ink-1">{cat?.name} — Scope</h2>
      <p className="text-sm text-ink-2">Select everything included in this job.</p>
      <div className="space-y-1.5">
        {cat?.subcategories.map((sub) => {
          const checked = draft.subcategories.includes(sub);
          return (
            <button
              key={sub}
              onClick={() => draft.toggleSubcategory(sub)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm ${
                checked ? 'border-amber/40 bg-amber-dim text-ink-1' : 'border-line bg-card text-ink-2'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  checked ? 'border-amber bg-amber text-bg' : 'border-line-md'
                }`}
              >
                {checked && <Check size={14} />}
              </span>
              {sub}
            </button>
          );
        })}
      </div>
      <Textarea
        label="Scope Notes"
        value={draft.scopeNotes}
        onChange={(e) => draft.setScopeNotes(e.target.value)}
        placeholder="Anything specific about this job…"
      />
    </div>
  );
}

/* ── Step 4: Line Items ───────────────────────────── */
function StepLineItems() {
  const draft = useEstimateStore();
  const totals = useEstimateTotals();
  const [laborOpen, setLaborOpen] = useState(false);
  const [matOpen, setMatOpen] = useState(false);

  const sections: { type: LineItemType; label: string; icon: string }[] = [
    { type: 'labor', label: 'Labor', icon: '👷' },
    { type: 'material', label: 'Materials', icon: '📦' },
    { type: 'allowance', label: 'Allowances', icon: '💰' },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-ink-1">Line Items</h2>

      {draft.lineItems.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-md bg-surf px-4 py-6 text-center text-sm text-ink-2">
          No items yet. Add labor and materials below.
        </p>
      )}

      {sections.map(({ type, label, icon }) => {
        const items = draft.lineItems.filter((i) => i.type === type);
        if (items.length === 0) return null;
        const subtotal = items.reduce((s, i) => s + i.total, 0);
        return (
          <div key={type} className="rounded-2xl border border-line bg-card p-3.5">
            <div className="mb-2 flex justify-between text-sm font-semibold text-ink-1">
              <span>
                {icon} {label}
              </span>
              <span>{fmtCurrencyFull(subtotal)}</span>
            </div>
            <div className="space-y-2">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-ink-1">{i.description}</p>
                    <p className="text-xs text-ink-3">
                      {i.quantity} {i.unit} × {fmtCurrencyFull(i.unitPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-1">{fmtCurrencyFull(i.total)}</span>
                    <button onClick={() => draft.removeLineItem(i.id)} aria-label="Remove">
                      <Trash2 size={15} className="text-ink-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="secondary" onClick={() => setLaborOpen(true)}>
          <Plus size={16} /> Labor
        </Button>
        <Button variant="secondary" onClick={() => setMatOpen(true)}>
          <Plus size={16} /> Material
        </Button>
      </div>

      <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <Slider label="Material Markup" value={draft.overheadMarkupPct} max={50} onChange={draft.setMarkup} />
        <Slider label="Tax Rate" value={draft.taxPct} max={15} step={0.5} onChange={draft.setTax} />
      </div>

      <TotalsBlock totals={totals} markupPct={draft.overheadMarkupPct} taxPct={draft.taxPct} />

      <AddLaborSheet open={laborOpen} onClose={() => setLaborOpen(false)} />
      <AddMaterialSheet open={matOpen} onClose={() => setMatOpen(false)} />
    </div>
  );
}

function AddLaborSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const draft = useEstimateStore();
  const getRate = useSettingsStore((s) => s.getLaborRate);
  const cat = draft.categoryId ? getCategory(draft.categoryId) : undefined;
  const [desc, setDesc] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');

  const trades = cat?.defaultTrades.length
    ? LABOR_PRESETS.filter((p) => cat.defaultTrades.includes(p.role))
    : LABOR_PRESETS;

  const total = calcItemTotal(Number(hours) || 0, Number(rate) || 0);

  const pick = (role: string) => {
    setDesc(role);
    const r = getRate(role) || LABOR_PRESETS.find((p) => p.role === role)?.defaultRate || 0;
    setRate(String(r));
  };

  const submit = () => {
    if (!desc || !hours || !rate) return;
    draft.addLineItem({
      type: 'labor',
      description: desc,
      quantity: Number(hours),
      unit: 'hr',
      unitPrice: Number(rate),
    });
    setDesc('');
    setHours('');
    setRate('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Labor">
      <div className="space-y-3">
        <div className="-mx-1 flex flex-wrap gap-1.5">
          {trades.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p.role)}
              className="rounded-full border border-line-md bg-surf px-3 py-1.5 text-xs text-ink-2 active:bg-elev"
            >
              {p.role}
            </button>
          ))}
        </div>
        <Input label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <div className="grid grid-cols-2 gap-2.5">
          <Input label="Hours" type="number" inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value)} />
          <Input label="Rate ($/hr)" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <p className="text-center text-sm text-ink-2">
          {hours || 0} hrs × ${rate || 0}/hr = <span className="font-bold text-amber">{fmtCurrencyFull(total)}</span>
        </p>
        <Button full onClick={submit} disabled={!desc || !hours || !rate}>
          Add Labor
        </Button>
      </div>
    </BottomSheet>
  );
}

function AddMaterialSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const draft = useEstimateStore();
  const presets = draft.categoryId ? getMaterialPresets(draft.categoryId) : [];
  const [mode, setMode] = useState('browse');
  const [search, setSearch] = useState('');
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('ea');
  const [price, setPrice] = useState('');

  const filtered = presets.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const total = calcItemTotal(Number(qty) || 0, Number(price) || 0);

  const pickPreset = (name: string, u: string, p: number) => {
    setDesc(name);
    setUnit(u);
    setPrice(String(p));
    setMode('manual');
  };

  const submit = () => {
    if (!desc || !qty || !price) return;
    const type: LineItemType = unit === 'allow' ? 'allowance' : 'material';
    draft.addLineItem({
      type,
      description: desc,
      quantity: Number(qty),
      unit,
      unitPrice: Number(price),
    });
    setDesc('');
    setQty('');
    setPrice('');
    setUnit('ea');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Material">
      <div className="space-y-3">
        <Tabs
          tabs={[
            { id: 'browse', label: 'Browse Presets' },
            { id: 'manual', label: 'Manual Entry' },
          ]}
          active={mode}
          onChange={setMode}
        />

        {mode === 'browse' ? (
          <>
            <Input placeholder="Search materials…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-ink-3">No presets for this category.</p>
              )}
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickPreset(p.name, p.unit, p.defaultPrice)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-card px-3 py-2.5 text-left active:bg-elev"
                >
                  <span className="min-w-0 truncate text-sm text-ink-1">{p.name}</span>
                  <span className="shrink-0 text-xs text-ink-2">
                    {fmtCurrencyFull(p.defaultPrice)}/{p.unit}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <Input label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="grid grid-cols-3 gap-2.5">
              <Input label="Qty" type="number" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
              <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
              <Input label="Price" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <p className="text-center text-sm text-ink-2">
              Total: <span className="font-bold text-amber">{fmtCurrencyFull(total)}</span>
            </p>
            <Button full onClick={submit} disabled={!desc || !qty || !price}>
              Add Material
            </Button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}

/* ── Step 5: Summary ──────────────────────────────── */
function StepSummary({ totals }: { totals: ReturnType<typeof useEstimateTotals> }) {
  const draft = useEstimateStore();
  const settings = useSettingsStore((s) => s.settings);
  const validity = settings?.estimateValidityDays ?? 30;
  const validUntil = new Date(Date.now() + validity * 864e5).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const depositAmt = totals.estimateTotal * (draft.depositPct / 100);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-ink-1">Review &amp; Save</h2>

      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="text-lg font-semibold text-ink-1">{draft.clientName || 'Unnamed Client'}</p>
        <p className="text-sm text-ink-2">
          {draft.jobAddress}
          {draft.jobCity ? `, ${draft.jobCity}` : ''}
        </p>
        <p className="mt-1 text-sm text-amber">
          {getCategory(draft.categoryId ?? '')?.icon} {draft.categoryName}
        </p>
      </div>

      <TotalsBlock totals={totals} markupPct={draft.overheadMarkupPct} taxPct={draft.taxPct} />

      <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <Slider
          label={`Deposit (${fmtCurrencyFull(depositAmt)})`}
          value={draft.depositPct}
          max={50}
          suffix="%"
          onChange={draft.setDeposit}
        />
        <p className="text-xs text-ink-3">Valid until {validUntil}</p>
      </div>

      <Textarea
        label="Estimate Notes"
        value={draft.estimateNotes}
        onChange={(e) => draft.setEstimateNotes(e.target.value)}
      />
    </div>
  );
}
