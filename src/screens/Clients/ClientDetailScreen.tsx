import { useParams } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { useClientStore } from '../../stores/clientStore';
import { useJobStore } from '../../stores/jobStore';
import { fmtCurrency, fmtPhone, initials } from '../../utils/format';
import ScreenHeader from '../../components/layout/ScreenHeader';
import JobCard from '../../components/job/JobCard';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientDetailScreen() {
  const { id = '' } = useParams();
  const client = useClientStore((s) => s.clients.find((c) => c.id === id));
  const jobs = useJobStore((s) => s.jobs.filter((j) => j.clientId === id));

  if (!client) {
    return (
      <div>
        <ScreenHeader title="Client" back />
        <EmptyState icon="🤷" title="Client not found" />
      </div>
    );
  }

  const revenue = jobs.reduce((s, j) => s + j.totalPaid, 0);
  const pipeline = jobs.reduce((s, j) => s + j.estimateTotal, 0);

  return (
    <div className="pb-8">
      <ScreenHeader title={client.name} back />
      <div className="px-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky/15 text-lg font-bold text-sky">
            {initials(client.name)}
          </div>
          <div>
            <p className="text-xl font-bold text-ink-1">{client.name}</p>
            <p className="text-sm text-ink-2">{jobs.length} jobs</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-md bg-elev py-2.5 text-sm text-ink-1">
              <Phone size={16} /> {fmtPhone(client.phone)}
            </a>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-md bg-elev py-2.5 text-sm text-ink-1">
              <Mail size={16} /> Email
            </a>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-line bg-card p-3">
            <p className="text-lg font-bold text-jade">{fmtCurrency(revenue)}</p>
            <p className="text-xs text-ink-2">Total Paid</p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-3">
            <p className="text-lg font-bold text-amber">{fmtCurrency(pipeline)}</p>
            <p className="text-xs text-ink-2">Pipeline</p>
          </div>
        </div>

        <h2 className="mb-3 mt-6 text-base font-semibold text-ink-1">Jobs</h2>
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <EmptyState icon="📋" title="No jobs yet" />
          ) : (
            jobs.map((j) => <JobCard key={j.id} job={j} />)
          )}
        </div>
      </div>
    </div>
  );
}
