import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import type { Job } from '../../types/job.types';
import { fmtCurrency, fmtDateShort } from '../../utils/format';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';

export default function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="w-full rounded-2xl border border-line bg-card p-4 text-left active:bg-elev"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink-1">
            {job.clientName || 'Unnamed Client'}
          </p>
          <p className="truncate text-sm text-ink-2">
            {job.jobAddress ? `${job.jobAddress}, ${job.jobCity}` : 'No address'}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <CategoryBadge categoryId={job.categoryId} name={job.categoryName} />
        <span className="text-lg font-bold text-amber">{fmtCurrency(job.estimateTotal)}</span>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-ink-3">
        <span className="flex items-center gap-1">
          <Camera size={12} /> {job.photos.length} · {job.jobNumber}
        </span>
        <span>
          {job.balanceDue > 0 ? (
            <span className="text-rose">Bal {fmtCurrency(job.balanceDue)}</span>
          ) : job.startDate ? (
            fmtDateShort(job.startDate)
          ) : (
            fmtDateShort(job.createdAt)
          )}
        </span>
      </div>
    </button>
  );
}
