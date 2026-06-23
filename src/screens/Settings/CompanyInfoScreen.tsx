import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CompanyInfoScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const showToast = useUIStore((s) => s.showToast);

  const [form, setForm] = useState({
    companyName: settings?.companyName ?? '',
    ownerName: settings?.ownerName ?? '',
    phone: settings?.phone ?? '',
    email: settings?.email ?? '',
    address: settings?.address ?? '',
    city: settings?.city ?? '',
    state: settings?.state ?? '',
    zip: settings?.zip ?? '',
    licenseNumber: settings?.licenseNumber ?? '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    await saveSettings(form);
    showToast('Company info saved');
  };

  return (
    <div className="pb-8">
      <ScreenHeader title="Company Info" back />
      <div className="space-y-3 px-5 pt-3">
        <Input label="Company Name" value={form.companyName} onChange={set('companyName')} />
        <Input label="Owner Name" value={form.ownerName} onChange={set('ownerName')} />
        <div className="grid grid-cols-2 gap-2.5">
          <Input label="Phone" value={form.phone} onChange={set('phone')} />
          <Input label="Email" value={form.email} onChange={set('email')} />
        </div>
        <Input label="Address" value={form.address} onChange={set('address')} />
        <div className="grid grid-cols-3 gap-2.5">
          <Input label="City" value={form.city} onChange={set('city')} />
          <Input label="State" value={form.state} onChange={set('state')} />
          <Input label="ZIP" value={form.zip} onChange={set('zip')} />
        </div>
        <Input label="License #" value={form.licenseNumber} onChange={set('licenseNumber')} />
        <Button full onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}
