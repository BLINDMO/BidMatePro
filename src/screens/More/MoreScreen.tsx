import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Settings, ChevronRight, Briefcase } from 'lucide-react';
import ScreenHeader from '../../components/layout/ScreenHeader';
import { useSettingsStore } from '../../stores/settingsStore';

const links = [
  { to: '/clients', icon: Users, label: 'Clients', desc: 'Directory & history' },
  { to: '/reports', icon: BarChart3, label: 'Reports', desc: 'Revenue & analytics' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Company, rates, pricing' },
];

export default function MoreScreen() {
  const navigate = useNavigate();
  const company = useSettingsStore((s) => s.settings);

  return (
    <div>
      <ScreenHeader title="More" />
      <div className="px-5 pt-3">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-dim text-amber">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="font-semibold text-ink-1">{company?.companyName || 'Your Company'}</p>
            <p className="text-xs text-ink-2">{company?.licenseNumber || 'Set up your company info'}</p>
          </div>
        </div>

        <div className="space-y-2">
          {links.map((l) => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left active:bg-elev"
            >
              <l.icon size={20} className="text-ink-2" />
              <div className="flex-1">
                <p className="text-[15px] font-medium text-ink-1">{l.label}</p>
                <p className="text-xs text-ink-3">{l.desc}</p>
              </div>
              <ChevronRight size={18} className="text-ink-3" />
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-ink-3">Honeycutt Construction · © Jon Honeycutt, 2026</p>
      </div>
    </div>
  );
}
