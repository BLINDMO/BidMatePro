import { useNavigate } from 'react-router-dom';
import { Plus, Ruler, ChevronRight, ClipboardList, Hammer, FileText, TrendingUp } from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { fmtCurrency, initials } from '../../utils/format';
import JobCard from '../../components/job/JobCard';
import EmptyState from '../../components/ui/EmptyState';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const jobs = useJobStore((s) => s.jobs);
  const getByStatus = useJobStore((s) => s.getByStatus);
  const getMonthRevenue = useJobStore((s) => s.getMonthRevenue);
  const getOpenBalance = useJobStore((s) => s.getOpenBalance);
  const company = useSettingsStore((s) => s.settings?.companyName ?? 'Honeycutt Construction');

  const monthRevenue = getMonthRevenue();
  const openBalance = getOpenBalance();
  const activeCount = getByStatus('active').length;
  const estimateCount = getByStatus('estimate').length;
  const recent = jobs.slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="safe-top">
      <header className="flex items-center gap-3.5 px-5 pb-5 pt-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-base font-bold text-white shadow-card">
          {initials(company) || 'HC'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink-2">{greeting}</p>
          <p className="truncate text-xl font-bold text-ink-1">{company}</p>
        </div>
      </header>

      {/* Featured revenue card */}
      <div className="px-5">
        <div className="relative overflow-hidden rounded-3xl border border-line-md bg-card p-5 shadow-card">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
              <TrendingUp size={15} className="text-amber" /> Revenue · {today}
            </div>
            <p className="tnum mt-1.5 text-[40px] font-extrabold leading-none text-ink-1">
              {fmtCurrency(monthRevenue)}
            </p>
            <p className="mt-2 text-[13px] text-ink-2">
              This month
              {openBalance > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-rose">{fmtCurrency(openBalance)}</span> outstanding
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        <StatChip icon={<Hammer size={18} />} value={activeCount} label="Active Jobs" color="text-teal" tint="bg-teal/12" />
        <StatChip icon={<FileText size={18} />} value={estimateCount} label="Estimates" color="text-amber" tint="bg-amber/12" />
      </div>

      {/* Primary actions */}
      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        <button
          onClick={() => navigate('/estimate/new')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-amber py-4 text-base font-semibold text-[#0B0E16] shadow-amber transition-transform active:scale-[0.98]"
        >
          <Plus size={20} /> New Estimate
        </button>
        <button
          onClick={() => navigate('/measure')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-line-md bg-elev py-4 text-base font-semibold text-ink-1 shadow-card transition-transform active:scale-[0.98]"
        >
          <Ruler size={20} /> Measure
        </button>
      </div>

      <div className="mt-7 flex items-center justify-between px-5">
        <h2 className="text-lg font-bold text-ink-1">Recent Jobs</h2>
        {jobs.length > 0 && (
          <button onClick={() => navigate('/jobs')} className="flex items-center text-sm font-semibold text-amber">
            See All <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-3 px-5">
        {recent.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={44} strokeWidth={1.5} />}
            title="No jobs yet"
            subtitle="Tap the + button to create your first estimate."
          />
        ) : (
          recent.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
  color,
  tint,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-card">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint} ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className={`tnum text-2xl font-extrabold leading-none ${color}`}>{value}</p>
        <p className="mt-1 truncate text-xs text-ink-2">{label}</p>
      </div>
    </div>
  );
}
