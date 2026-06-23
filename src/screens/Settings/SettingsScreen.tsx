import { useNavigate } from 'react-router-dom';
import { Building2, HardHat, Percent, FileText, Database, ChevronRight } from 'lucide-react';
import { db } from '../../db/database';
import { useUIStore } from '../../stores/uiStore';
import ScreenHeader from '../../components/layout/ScreenHeader';

const links = [
  { to: '/settings/company', icon: Building2, label: 'Company Info' },
  { to: '/settings/labor', icon: HardHat, label: 'Labor Rates' },
  { to: '/settings/pricing', icon: Percent, label: 'Pricing Defaults' },
  { to: '/settings/documents', icon: FileText, label: 'Document Settings' },
];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);

  const exportData = async () => {
    const [jobs, clients, settings, photos, measurements] = await Promise.all([
      db.jobs.toArray(),
      db.clients.toArray(),
      db.settings.toArray(),
      db.photos.toArray(),
      db.measurements.toArray(),
    ]);
    const blob = new Blob([JSON.stringify({ jobs, clients, settings, photos, measurements }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bidmate-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  return (
    <div className="pb-8">
      <ScreenHeader title="Settings" back />
      <div className="space-y-2 px-5 pt-3">
        {links.map((l) => (
          <button
            key={l.to}
            onClick={() => navigate(l.to)}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left active:bg-elev"
          >
            <l.icon size={20} className="text-ink-2" />
            <span className="flex-1 text-[15px] font-medium text-ink-1">{l.label}</span>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
        ))}

        <div className="pt-4">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-3">Data</p>
          <button
            onClick={exportData}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left active:bg-elev"
          >
            <Database size={20} className="text-ink-2" />
            <span className="flex-1 text-[15px] font-medium text-ink-1">Export All Data (JSON)</span>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-ink-3">© Jon Honeycutt, 2026</p>
      </div>
    </div>
  );
}
