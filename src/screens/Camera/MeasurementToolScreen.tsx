import { useMemo, useState } from 'react';
import { Plus, X, Ruler, ArrowRight } from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { db } from '../../db/database';
import { newId } from '../../utils/ids';
import { fmtCurrencyFull } from '../../utils/format';
import type { LineItemType } from '../../types/job.types';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BottomSheet from '../../components/ui/BottomSheet';

type Surface = 'paint' | 'floor' | 'tile' | 'drywall' | 'concrete' | 'linear';

interface Entry {
  id: string;
  label: string;
  a: number; // walls: width · floor: length · linear: length
  b: number; // walls: height · floor: width · linear: unused
}

interface SuggestedItem {
  type: LineItemType;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

const SURFACES: { id: Surface; label: string; help: string }[] = [
  { id: 'paint', label: 'Walls (Paint)', help: 'Enter each wall width × height' },
  { id: 'floor', label: 'Floor (LVP)', help: 'Enter each area length × width' },
  { id: 'tile', label: 'Tile', help: 'Enter each tiled area length × width' },
  { id: 'drywall', label: 'Drywall', help: 'Enter each surface width × height' },
  { id: 'concrete', label: 'Concrete', help: 'Enter each slab length × width' },
  { id: 'linear', label: 'Linear (Trim)', help: 'Enter each run length' },
];

/** Area (sqft) or length (lf) contributed by one entry. */
function entryValue(surface: Surface, e: Entry): number {
  if (surface === 'linear') return e.a;
  return e.a * e.b;
}

export default function MeasurementToolScreen() {
  const jobs = useJobStore((s) => s.jobs);
  const addLineItem = useJobStore((s) => s.addLineItem);
  const saveJob = useJobStore((s) => s.saveJob);
  const getRate = useSettingsStore((s) => s.getLaborRate);
  const showToast = useUIStore((s) => s.showToast);

  const [surface, setSurface] = useState<Surface>('paint');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [label, setLabel] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [waste, setWaste] = useState('10');
  const [thickness, setThickness] = useState('4'); // concrete slab thickness, inches
  const [includeLabor, setIncludeLabor] = useState(true);
  const [jobPickerOpen, setJobPickerOpen] = useState(false);

  const cfg = SURFACES.find((s) => s.id === surface)!;
  const wf = 1 + (Number(waste) || 0) / 100;

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + entryValue(surface, e), 0),
    [entries, surface],
  );
  const totalWithWaste = Math.round(total * wf * 10) / 10;
  const unitLabel = surface === 'linear' ? 'lin ft' : 'sq ft';

  const addEntry = () => {
    const av = Number(a);
    const bv = surface === 'linear' ? 1 : Number(b);
    if (!av || (surface !== 'linear' && !bv)) return;
    setEntries([
      ...entries,
      { id: newId(), label: label || `${defaultLabel(surface)} ${entries.length + 1}`, a: av, b: bv },
    ]);
    setLabel('');
    setA('');
    setB('');
  };

  const removeEntry = (id: string) => setEntries(entries.filter((e) => e.id !== id));
  const reset = () => {
    setEntries([]);
    setLabel('');
    setA('');
    setB('');
  };

  const suggested = useMemo<SuggestedItem[]>(
    () => buildSuggested(surface, total, totalWithWaste, includeLabor, getRate, Number(thickness) || 4),
    [surface, total, totalWithWaste, includeLabor, getRate, thickness],
  );

  const suggestedTotal = suggested.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const addToJob = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    // Persist each measurement for history.
    const records = entries.map((e) => ({
      id: newId(),
      jobId,
      label: e.label,
      type: (surface === 'linear' ? 'linear' : 'area') as 'linear' | 'area',
      unit: 'ft' as const,
      length: e.a,
      width: surface === 'linear' ? undefined : e.b,
      sqft: surface === 'linear' ? undefined : Math.round(e.a * e.b * 10) / 10,
      linearFt: surface === 'linear' ? e.a : undefined,
      wasteFactor: wf,
      createdAt: new Date().toISOString(),
    }));
    await Promise.all(records.map((m) => db.measurements.put(m)));
    await saveJob({ ...job, measurements: [...job.measurements, ...records] });

    for (const item of suggested) {
      await addLineItem(jobId, item);
    }
    setJobPickerOpen(false);
    reset();
    showToast(`Added ${suggested.length} items to ${job.clientName}`);
  };

  return (
    <div className="pb-8">
      <ScreenHeader title="Measure" />

      <div className="space-y-3 px-5 pt-3">
        {/* Surface selector */}
        <div className="grid grid-cols-3 gap-2">
          {SURFACES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSurface(s.id);
                reset();
              }}
              className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                surface === s.id
                  ? 'border-amber bg-amber-dim text-amber'
                  : 'border-line bg-card text-ink-2'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Entry form */}
        <Card>
          <div className="mb-3 flex items-center gap-2 text-amber">
            <Ruler size={18} />
            <span className="text-sm font-semibold">Add Measurement</span>
          </div>
          <p className="mb-3 text-xs text-ink-3">{cfg.help}</p>
          <div className="space-y-3">
            <Input
              label="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`${defaultLabel(surface)} ${entries.length + 1}`}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label={surface === 'linear' ? 'Length' : surface === 'floor' ? 'Length' : 'Width'}
                type="number"
                inputMode="decimal"
                suffix="ft"
                value={a}
                onChange={(e) => setA(e.target.value)}
              />
              {surface !== 'linear' && (
                <Input
                  label={surface === 'floor' ? 'Width' : 'Height'}
                  type="number"
                  inputMode="decimal"
                  suffix="ft"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                />
              )}
            </div>
            <Button full variant="secondary" onClick={addEntry} disabled={!a || (surface !== 'linear' && !b)}>
              <Plus size={16} /> Add Measurement
            </Button>
          </div>
        </Card>

        {/* Running list */}
        {entries.length > 0 && (
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-1">
                Measurements ({entries.length})
              </span>
              <button onClick={reset} className="text-xs text-ink-3 active:text-ink-1">
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-ink-1">{e.label}</p>
                    <p className="text-xs text-ink-3">
                      {surface === 'linear' ? `${e.a} ft` : `${e.a} × ${e.b} ft`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-ink-1">
                      {Math.round(entryValue(surface, e) * 10) / 10} {unitLabel}
                    </span>
                    <button onClick={() => removeEntry(e.id)} aria-label="Remove">
                      <X size={15} className="text-ink-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-line-md pt-2.5 text-sm">
              <span className="text-ink-2">Total</span>
              <span className="font-bold text-ink-1">
                {Math.round(total * 10) / 10} {unitLabel}
              </span>
            </div>
          </Card>
        )}

        {/* Options + results */}
        {entries.length > 0 && (
          <>
            <Card>
              <div className="grid grid-cols-2 gap-2.5">
                <Select
                  label="Waste Factor"
                  value={waste}
                  onChange={(e) => setWaste(e.target.value)}
                  options={[
                    { value: '10', label: '10% (standard)' },
                    { value: '15', label: '15% (tile/cuts)' },
                    { value: '5', label: '5% (minimal)' },
                    { value: '0', label: '0% (none)' },
                  ]}
                />
                <div>
                  <span className="mb-1.5 block text-sm text-ink-2">Labor</span>
                  <button
                    onClick={() => setIncludeLabor(!includeLabor)}
                    className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm ${
                      includeLabor
                        ? 'border-amber/40 bg-amber-dim text-amber'
                        : 'border-line-md bg-surf text-ink-2'
                    }`}
                  >
                    <span>{includeLabor ? 'Included' : 'Excluded'}</span>
                    <span className={`h-5 w-9 rounded-full p-0.5 ${includeLabor ? 'bg-amber' : 'bg-elev'}`}>
                      <span
                        className={`block h-4 w-4 rounded-full bg-white transition ${includeLabor ? 'translate-x-4' : ''}`}
                      />
                    </span>
                  </button>
                </div>
              </div>
              {surface === 'concrete' && (
                <div className="mt-2.5">
                  <Select
                    label="Slab Thickness"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    options={[
                      { value: '4', label: '4 in (standard)' },
                      { value: '5', label: '5 in' },
                      { value: '6', label: '6 in (heavy)' },
                      { value: '3.5', label: '3.5 in' },
                    ]}
                  />
                </div>
              )}
            </Card>

            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">
                Auto-Configured Items
              </p>
              <p className="mb-3 text-sm text-ink-2">
                {Math.round(total * 10) / 10} {unitLabel} + {waste}% waste ={' '}
                <span className="font-semibold text-ink-1">
                  {totalWithWaste} {unitLabel}
                </span>
              </p>
              <div className="space-y-2">
                {suggested.map((i, idx) => (
                  <div key={idx} className="flex justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink-1">{i.description}</p>
                      <p className="text-xs text-ink-3">
                        {i.quantity} {i.unit} × {fmtCurrencyFull(i.unitPrice)}
                      </p>
                    </div>
                    <span className="shrink-0 font-medium text-ink-1">
                      {fmtCurrencyFull(i.quantity * i.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-line-md pt-2.5">
                <span className="text-sm text-ink-2">Estimated</span>
                <span className="text-lg font-bold text-amber">{fmtCurrencyFull(suggestedTotal)}</span>
              </div>
            </Card>

            <Button full onClick={() => setJobPickerOpen(true)}>
              Add to Estimate <ArrowRight size={18} />
            </Button>
            <p className="text-center text-xs text-ink-3">
              Quantities and prices stay editable on the job.
            </p>
          </>
        )}
      </div>

      <BottomSheet open={jobPickerOpen} onClose={() => setJobPickerOpen(false)} title="Add to which job?">
        <div className="space-y-2">
          {jobs.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-3">
              No jobs yet — create an estimate first.
            </p>
          )}
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={() => addToJob(j.id)}
              className="flex w-full items-center justify-between rounded-xl border border-line bg-card px-3 py-3 text-left active:bg-elev"
            >
              <div>
                <p className="text-sm font-medium text-ink-1">{j.clientName}</p>
                <p className="text-xs text-ink-3">
                  {j.jobNumber} · {j.categoryName}
                </p>
              </div>
              <ArrowRight size={16} className="text-ink-3" />
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function defaultLabel(surface: Surface): string {
  switch (surface) {
    case 'paint':
    case 'drywall':
      return 'Wall';
    case 'floor':
    case 'tile':
      return 'Area';
    case 'concrete':
      return 'Slab';
    default:
      return 'Run';
  }
}

const DEFAULT_LABOR = 125;

/** Build the material + labor line items implied by a measurement total. */
function buildSuggested(
  surface: Surface,
  total: number,
  totalWithWaste: number,
  includeLabor: boolean,
  getRate: (role: string) => number,
  thicknessIn: number,
): SuggestedItem[] {
  const items: SuggestedItem[] = [];
  const labor = (role: string, hours: number): SuggestedItem => ({
    type: 'labor',
    description: role,
    quantity: Math.max(1, Math.ceil(hours)),
    unit: 'hr',
    unitPrice: getRate(role) || DEFAULT_LABOR,
  });

  if (surface === 'paint') {
    const gallons = Math.max(1, Math.ceil((totalWithWaste * 2) / 350)); // 2 coats, ~350 sqft/gal
    items.push({ type: 'material', description: 'Interior Paint (2 coats)', quantity: gallons, unit: 'gal', unitPrice: 52 });
    if (includeLabor) items.push(labor('Painter', total / 175));
  } else if (surface === 'floor') {
    items.push({ type: 'material', description: 'LVP Flooring (mid-grade)', quantity: Math.round(totalWithWaste), unit: 'sqft', unitPrice: 4.5 });
    if (includeLabor) items.push(labor('Flooring Installer', total / 200));
  } else if (surface === 'tile') {
    items.push({ type: 'material', description: 'Porcelain Tile', quantity: Math.round(totalWithWaste), unit: 'sqft', unitPrice: 8 });
    items.push({ type: 'material', description: 'Thinset Mortar (50lb)', quantity: Math.max(1, Math.ceil(totalWithWaste / 40)), unit: 'bag', unitPrice: 22 });
    items.push({ type: 'material', description: 'Tile Grout (25lb)', quantity: Math.max(1, Math.ceil(totalWithWaste / 100)), unit: 'bag', unitPrice: 28 });
    if (includeLabor) items.push(labor('Tile Setter', total / 100));
  } else if (surface === 'drywall') {
    const sheets = Math.max(1, Math.ceil(totalWithWaste / 32)); // 4x8 = 32 sqft
    items.push({ type: 'material', description: 'Drywall 1/2" (4×8 sheet)', quantity: sheets, unit: 'sheet', unitPrice: 18 });
    items.push({ type: 'material', description: 'Joint Compound (5-gal)', quantity: Math.max(1, Math.ceil(total / 400)), unit: 'pail', unitPrice: 23 });
    items.push({ type: 'material', description: 'Drywall Screws (5lb)', quantity: Math.max(1, Math.ceil(total / 1000)), unit: 'box', unitPrice: 15 });
    if (includeLabor) items.push(labor('Drywall Hanger/Finisher', total / 60));
  } else if (surface === 'concrete') {
    const cy = Math.max(0.5, Math.ceil(((total * (thicknessIn / 12)) / 27) * 2) / 2); // round to 0.5 cy
    items.push({ type: 'material', description: `Ready-Mix Concrete (${thicknessIn}" slab)`, quantity: cy, unit: 'cy', unitPrice: 185 });
    items.push({ type: 'material', description: 'Wire Mesh / Rebar', quantity: Math.max(1, Math.ceil(total / 50)), unit: 'sheet', unitPrice: 24 });
    if (includeLabor) items.push(labor('Concrete Finisher', total / 100));
  } else {
    const sticks = Math.max(1, Math.ceil(totalWithWaste / 16)); // 16ft sticks
    items.push({ type: 'material', description: 'Baseboard / Trim (16ft)', quantity: sticks, unit: 'ea', unitPrice: 18 });
    if (includeLabor) items.push(labor('Finish Carpenter', total / 40));
  }

  return items;
}
