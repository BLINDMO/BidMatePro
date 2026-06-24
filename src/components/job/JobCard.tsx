import { useNavigate } from 'react-router-dom';
import { Camera, MapPin } from 'lucide-react';
import type { Job } from '../../types/job.types';
import { fmtCurrency, fmtDateShort } from '../../utils/format';
import { getCategory } from '../../data/categories';
import { getCategoryIcon } from '../../data/categoryIcons';
import StatusBadge from './StatusBadge';

export default function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();
  const cat = getCategory(job.categoryId);
  const Icon = getCategoryIcon(job.categoryId);
  const color = cat?.color ?? '#8896B3';

  return (
    <button
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="w-full rounded-2xl border border-line bg-card p-4 text-left shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-base font-semibold text-ink-1">
              {job.clientName || 'Unnamed Client'}
            </p>
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-ink-2">
            <MapPin size={12} className="shrink-0 text-ink-3" />
            {job.jobAddress ? `${job.jobAddress}, ${job.jobCity}` : 'No address'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
        <div className="flex items-center gap-3 text-2xs text-ink-3">
          <span className="flex items-center gap-1">
            <Camera size={12} /> {job.photos.length}
          </span>
          <span>{job.jobNumber}</span>
          <span>{fmtDateShort(job.startDate ?? job.createdAt)}</span>
        </div>
        <div className="text-right">
          <p className="tnum text-lg font-bold text-ink-1">{fmtCurrency(job.estimateTotal)}</p>
          {job.balanceDue > 0 && job.totalPaid > 0 && (
            <p className="tnum text-2xs font-medium text-rose">{fmtCurrency(job.balanceDue)} due</p>
          )}
        </div>
      </div>
    </button>
  );
}
