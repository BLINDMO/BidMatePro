import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';
import { STATUS_CONFIG, STATUS_ORDER, type JobStatus } from '../../types/job.types';
import ScreenHeader from '../../components/layout/ScreenHeader';
import JobCard from '../../components/job/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

type Filter = 'all' | JobStatus;
type Sort = 'created' | 'amount-desc' | 'amount-asc' | 'client';

export default function JobsListScreen() {
  const navigate = useNavigate();
  const jobs = useJobStore((s) => s.jobs);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('created');

  const filtered = useMemo(() => {
    let list = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);
    list = [...list];
    switch (sort) {
      case 'amount-desc':
        list.sort((a, b) => b.estimateTotal - a.estimateTotal);
        break;
      case 'amount-asc':
        list.sort((a, b) => a.estimateTotal - b.estimateTotal);
        break;
      case 'client':
        list.sort((a, b) => a.clientName.localeCompare(b.clientName));
        break;
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [jobs, filter, sort]);

  const chips: Filter[] = ['all', ...STATUS_ORDER];

  return (
    <div>
      <ScreenHeader
        title="Jobs"
        right={
          <button
            onClick={() => navigate('/estimate/new')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-dim text-amber active:opacity-80"
            aria-label="New job"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
        {chips.map((c) => {
          const active = filter === c;
          const label = c === 'all' ? 'All' : STATUS_CONFIG[c].label;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-amber text-[#0B0E16] shadow-amber'
                  : 'border border-line-md bg-surf text-ink-2 active:bg-elev'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end px-5">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-lg border border-line-md bg-surf px-2.5 py-1.5 text-xs text-ink-2 outline-none"
        >
          <option value="created">Newest</option>
          <option value="amount-desc">Amount ↓</option>
          <option value="amount-asc">Amount ↑</option>
          <option value="client">Client A–Z</option>
        </select>
      </div>

      <div className="mt-3 space-y-3 px-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={36} strokeWidth={1.5} />}
            title="No jobs here"
            subtitle="Create your first estimate to get started."
            action={
              <Button onClick={() => navigate('/estimate/new')}>
                <Plus size={18} /> New Estimate
              </Button>
            }
          />
        ) : (
          filtered.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
