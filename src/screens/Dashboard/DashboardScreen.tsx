import { useNavigate } from 'react-router-dom';
import { Plus, Ruler, ChevronRight } from 'lucide-react';
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
  const company = useSettingsStore((s) => s.settings?.companyName ?? 'BidMate Pro');

  const monthRevenue = getMonthRevenue();
  const activeCount = getByStatus('active').length;
  const estimateCount = getByStatus('estimate').length;
  const recent = jobs.slice(0, 6);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

  return (
    <div>
      <header
        className="flex items-center gap-3 px-5 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-dim text-sm font-bold text-amber">
          {initials(company) || 'BM'}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-ink-1">BidMate Pro</p>
          <p className="text-xs text-ink-2">{today}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2.5 px-5">
        <Stat label="This Month" value={fmtCurrency(monthRevenue)} accent="text-jade" />
        <Stat label="Active" value={String(activeCount)} accent="text-teal" />
        <Stat label="Pending Est." value={String(estimateCount)} accent="text-amber" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 px-5">
        <button
          onClick={() => navigate('/estimate/new')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-amber py-3.5 text-[15px] font-semibold text-bg active:opacity-80"
        >
          <Plus size={18} /> New Estimate
        </button>
        <button
          onClick={() => navigate('/measure')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-line-md bg-elev py-3.5 text-[15px] font-semibold text-ink-1 active:bg-card"
        >
          <Ruler size={18} /> Measure
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between px-5">
        <h2 className="text-base font-semibold text-ink-1">Recent Jobs</h2>
        {jobs.length > 0 && (
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center text-sm text-amber"
          >
            See All <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-3 px-5">
        {recent.length === 0 ? (
          <EmptyState
            icon="🔨"
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

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <p className={`text-xl font-extrabold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-2">{label}</p>
    </div>
  );
}
