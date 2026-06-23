import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Slider from '../../components/ui/Slider';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PricingDefaultsScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const showToast = useUIStore((s) => s.showToast);

  const [markup, setMarkup] = useState(settings?.defaultMarkupPct ?? 20);
  const [tax, setTax] = useState(settings?.defaultTaxPct ?? 0);
  const [deposit, setDeposit] = useState(settings?.defaultDepositPct ?? 33);

  const save = async () => {
    await saveSettings({ defaultMarkupPct: markup, defaultTaxPct: tax, defaultDepositPct: deposit });
    showToast('Defaults saved');
  };

  return (
    <div className="pb-8">
      <ScreenHeader title="Pricing Defaults" back />
      <div className="space-y-3 px-5 pt-3">
        <Card>
          <Slider label="Material Markup" value={markup} max={50} onChange={setMarkup} />
        </Card>
        <Card>
          <Slider label="Tax Rate" value={tax} max={15} step={0.5} onChange={setTax} />
        </Card>
        <Card>
          <Slider label="Default Deposit" value={deposit} max={50} onChange={setDeposit} />
        </Card>
        <Button full onClick={save}>
          Save Defaults
        </Button>
      </div>
    </div>
  );
}
