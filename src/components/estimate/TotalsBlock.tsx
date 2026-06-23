import { fmtCurrencyFull } from '../../utils/format';
import type { JobTotals } from '../../utils/calculations';

interface Props {
  totals: JobTotals;
  markupPct: number;
  taxPct: number;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={muted ? 'text-ink-3' : 'text-ink-2'}>{label}</span>
      <span className={muted ? 'text-ink-2' : 'text-ink-1'}>{value}</span>
    </div>
  );
}

export default function TotalsBlock({ totals, markupPct, taxPct }: Props) {
  return (
    <div className="space-y-2 rounded-2xl border border-line bg-card p-4">
      {totals.laborTotal > 0 && <Row label="Labor" value={fmtCurrencyFull(totals.laborTotal)} />}
      {totals.materialsTotal > 0 && (
        <Row label="Materials" value={fmtCurrencyFull(totals.materialsTotal)} />
      )}
      {totals.subsTotal > 0 && (
        <Row label="Subcontractors" value={fmtCurrencyFull(totals.subsTotal)} />
      )}
      {totals.permitsTotal > 0 && <Row label="Permits" value={fmtCurrencyFull(totals.permitsTotal)} />}
      {totals.equipmentTotal > 0 && (
        <Row label="Equipment" value={fmtCurrencyFull(totals.equipmentTotal)} />
      )}
      {totals.allowancesTotal > 0 && (
        <Row label="Allowances" value={fmtCurrencyFull(totals.allowancesTotal)} />
      )}
      {totals.creditsTotal > 0 && (
        <Row label="Credits" value={`-${fmtCurrencyFull(totals.creditsTotal)}`} muted />
      )}
      {totals.overheadMarkupAmt > 0 && (
        <Row label={`Material Markup (${markupPct}%)`} value={fmtCurrencyFull(totals.overheadMarkupAmt)} muted />
      )}
      {totals.taxAmt > 0 && (
        <Row label={`Tax (${taxPct}%)`} value={fmtCurrencyFull(totals.taxAmt)} muted />
      )}
      <div className="my-1 border-t border-line-md" />
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-ink-1">Total</span>
        <span className="text-2xl font-extrabold text-amber">
          {fmtCurrencyFull(totals.estimateTotal)}
        </span>
      </div>
    </div>
  );
}
