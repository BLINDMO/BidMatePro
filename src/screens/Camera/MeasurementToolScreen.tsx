import { useMemo, useState } from 'react';
import { Ruler, Save } from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';
import { useUIStore } from '../../stores/uiStore';
import { db } from '../../db/database';
import { newId } from '../../utils/ids';
import { calcRoomMeasurements } from '../../utils/calculations';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BottomSheet from '../../components/ui/BottomSheet';

export default function MeasurementToolScreen() {
  const jobs = useJobStore((s) => s.jobs);
  const addLineItem = useJobStore((s) => s.addLineItem);
  const saveJob = useJobStore((s) => s.saveJob);
  const showToast = useUIStore((s) => s.showToast);

  const [label, setLabel] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [waste, setWaste] = useState('10');
  const [jobPickerOpen, setJobPickerOpen] = useState(false);

  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const wf = 1 + (Number(waste) || 0) / 100;

  const results = useMemo(() => calcRoomMeasurements({ length: l, width: w, height: h || undefined }), [l, w, h]);
  const floorWithWaste = Math.round(results.floorArea * wf);
  const paintGal = results.wallArea ? Math.ceil((results.wallArea * 2) / 400) : 0;

  const saveMeasurement = async (jobId: string) => {
    const m = {
      id: newId(),
      jobId,
      label: label || 'Measurement',
      type: 'area' as const,
      unit: 'ft' as const,
      length: l,
      width: w,
      height: h || undefined,
      sqft: results.floorArea,
      sqftWithWaste: floorWithWaste,
      wasteFactor: wf,
      createdAt: new Date().toISOString(),
    };
    await db.measurements.put(m);
    const job = jobs.find((j) => j.id === jobId);
    if (job) await saveJob({ ...job, measurements: [...job.measurements, m] });
  };

  const addToJob = async (jobId: string) => {
    await saveMeasurement(jobId);
    if (floorWithWaste > 0) {
      await addLineItem(jobId, {
        type: 'material',
        description: `${label || 'Flooring'} — flooring (incl. ${waste}% waste)`,
        quantity: floorWithWaste,
        unit: 'sqft',
        unitPrice: 4.5,
      });
    }
    if (paintGal > 0) {
      await addLineItem(jobId, {
        type: 'material',
        description: `${label || 'Room'} — interior paint (2 coats)`,
        quantity: paintGal,
        unit: 'gal',
        unitPrice: 52,
      });
    }
    setJobPickerOpen(false);
    showToast('Added to job estimate');
  };

  const hasResult = l > 0 && w > 0;

  return (
    <div className="pb-8">
      <ScreenHeader title="Measure" />

      <div className="space-y-3 px-5 pt-3">
        <Card>
          <div className="mb-3 flex items-center gap-2 text-amber">
            <Ruler size={18} />
            <span className="text-sm font-semibold">Area Calculator</span>
          </div>
          <div className="space-y-3">
            <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Kitchen Floor" />
            <div className="grid grid-cols-2 gap-2.5">
              <Input label="Length" type="number" inputMode="decimal" suffix="ft" value={length} onChange={(e) => setLength(e.target.value)} />
              <Input label="Width" type="number" inputMode="decimal" suffix="ft" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Input label="Height (opt.)" type="number" inputMode="decimal" suffix="ft" value={height} onChange={(e) => setHeight(e.target.value)} />
              <Select
                label="Waste Factor"
                value={waste}
                onChange={(e) => setWaste(e.target.value)}
                options={[
                  { value: '10', label: 'Flooring 10%' },
                  { value: '15', label: 'Tile 15%' },
                  { value: '5', label: 'Minimal 5%' },
                  { value: '0', label: 'None 0%' },
                ]}
              />
            </div>
          </div>
        </Card>

        {hasResult && (
          <>
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">Results</p>
              <ResultRow label="Floor Area" value={`${results.floorArea} sqft`} />
              <ResultRow label={`+${waste}% Waste`} value={`${floorWithWaste} sqft`} accent />
              {results.wallArea && <ResultRow label="Wall Area (4 walls)" value={`${results.wallArea} sqft`} />}
              {results.volume && <ResultRow label="Volume" value={`${results.volume} cu ft`} />}
              {paintGal > 0 && <ResultRow label="Paint (2 coats)" value={`${paintGal} gal`} />}
            </Card>

            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">Material Suggestions</p>
              <ResultRow label="LVP / Tile Flooring" value={`${floorWithWaste} sqft`} />
              {paintGal > 0 && <ResultRow label="Interior Paint" value={`${paintGal} gal`} />}
            </Card>

            <Button full onClick={() => setJobPickerOpen(true)}>
              <Save size={18} /> Add to Estimate
            </Button>
          </>
        )}
      </div>

      <BottomSheet open={jobPickerOpen} onClose={() => setJobPickerOpen(false)} title="Add to which job?">
        <div className="space-y-2">
          {jobs.length === 0 && <p className="py-6 text-center text-sm text-ink-3">No jobs yet.</p>}
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={() => addToJob(j.id)}
              className="flex w-full items-center justify-between rounded-xl border border-line bg-card px-3 py-3 text-left active:bg-elev"
            >
              <div>
                <p className="text-sm font-medium text-ink-1">{j.clientName}</p>
                <p className="text-xs text-ink-3">{j.jobNumber} · {j.categoryName}</p>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-ink-2">{label}</span>
      <span className={accent ? 'font-bold text-amber' : 'font-medium text-ink-1'}>{value}</span>
    </div>
  );
}
