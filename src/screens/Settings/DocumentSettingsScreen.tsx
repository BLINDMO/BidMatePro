import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

export default function DocumentSettingsScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const showToast = useUIStore((s) => s.showToast);

  const [form, setForm] = useState({
    estimateValidityDays: settings?.estimateValidityDays ?? 30,
    estimateDisclaimer: settings?.estimateDisclaimer ?? '',
    invoicePaymentTerms: settings?.invoicePaymentTerms ?? '',
    invoiceFooter: settings?.invoiceFooter ?? '',
  });

  const save = async () => {
    await saveSettings(form);
    showToast('Document settings saved');
  };

  return (
    <div className="pb-8">
      <ScreenHeader title="Document Settings" back />
      <div className="space-y-3 px-5 pt-3">
        <Input
          label="Estimate Validity (days)"
          type="number"
          value={form.estimateValidityDays}
          onChange={(e) => setForm({ ...form, estimateValidityDays: Number(e.target.value) })}
        />
        <Textarea
          label="Estimate Disclaimer"
          value={form.estimateDisclaimer}
          onChange={(e) => setForm({ ...form, estimateDisclaimer: e.target.value })}
        />
        <Textarea
          label="Invoice Payment Terms"
          value={form.invoicePaymentTerms}
          onChange={(e) => setForm({ ...form, invoicePaymentTerms: e.target.value })}
        />
        <Textarea
          label="Invoice Footer"
          value={form.invoiceFooter}
          onChange={(e) => setForm({ ...form, invoiceFooter: e.target.value })}
        />
        <Button full onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}
