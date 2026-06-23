import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import ScreenHeader from '../../components/layout/ScreenHeader';

export default function LaborRatesScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const updateLaborRate = useSettingsStore((s) => s.updateLaborRate);
  const showToast = useUIStore((s) => s.showToast);

  const rates = settings?.laborRates ?? {};

  return (
    <div className="pb-8">
      <ScreenHeader title="Labor Rates" back />
      <div className="space-y-2 px-5 pt-3">
        <p className="text-sm text-ink-2">Hourly rates used to pre-fill labor line items.</p>
        {Object.entries(rates).map(([role, rate]) => (
          <div key={role} className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5">
            <span className="flex-1 text-sm text-ink-1">{role}</span>
            <div className="flex items-center gap-1">
              <span className="text-ink-3">$</span>
              <input
                type="number"
                inputMode="decimal"
                defaultValue={rate}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (v !== rate) {
                    updateLaborRate(role, v);
                    showToast('Rate updated');
                  }
                }}
                className="w-16 rounded-lg border border-line-md bg-surf px-2 py-1.5 text-right text-sm text-ink-1 outline-none focus:border-amber/60"
              />
              <span className="text-xs text-ink-3">/hr</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
