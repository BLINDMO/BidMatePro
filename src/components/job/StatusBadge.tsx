import Badge from '../ui/Badge';
import { STATUS_CONFIG, type JobStatus } from '../../types/job.types';

export default function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge color={cfg.color} bg={cfg.bg}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </Badge>
  );
}
