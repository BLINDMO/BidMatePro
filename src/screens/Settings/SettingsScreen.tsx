import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, HardHat, Percent, FileText, Database, Upload, ChevronRight } from 'lucide-react';
import { db } from '../../db/database';
import { useUIStore } from '../../stores/uiStore';
import { useJobStore } from '../../stores/jobStore';
import { useClientStore } from '../../stores/clientStore';
import { useSettingsStore } from '../../stores/settingsStore';
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
  const fileRef = useRef<HTMLInputElement>(null);

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!confirm('Restore this backup? It will overwrite all current data.')) return;
      await db.transaction('rw', db.jobs, db.clients, db.settings, db.photos, db.measurements, async () => {
        await Promise.all([
          db.jobs.clear(),
          db.clients.clear(),
          db.settings.clear(),
          db.photos.clear(),
          db.measurements.clear(),
        ]);
        if (parsed.jobs) await db.jobs.bulkPut(parsed.jobs);
        if (parsed.clients) await db.clients.bulkPut(parsed.clients);
        if (parsed.settings) await db.settings.bulkPut(parsed.settings);
        if (parsed.photos) await db.photos.bulkPut(parsed.photos);
        if (parsed.measurements) await db.measurements.bulkPut(parsed.measurements);
      });
      await Promise.all([
        useSettingsStore.getState().loadSettings(),
        useJobStore.getState().loadJobs(),
        useClientStore.getState().loadClients(),
      ]);
      showToast('Backup restored');
    } catch {
      showToast('Invalid backup file', 'error');
    }
  };

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
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left active:bg-elev"
          >
            <Upload size={20} className="text-ink-2" />
            <span className="flex-1 text-[15px] font-medium text-ink-1">Import / Restore Backup</span>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = '';
            }}
          />
        </div>

        <p className="mt-8 text-center text-xs text-ink-3">© Jon Honeycutt, 2026</p>
      </div>
    </div>
  );
}
