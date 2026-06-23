import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { useClientStore } from '../../stores/clientStore';
import { useJobStore } from '../../stores/jobStore';
import { useUIStore } from '../../stores/uiStore';
import { fmtCurrency, fmtPhone, initials } from '../../utils/format';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BottomSheet from '../../components/ui/BottomSheet';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientsListScreen() {
  const navigate = useNavigate();
  const clients = useClientStore((s) => s.clients);
  const createClient = useClientStore((s) => s.createClient);
  const jobs = useJobStore((s) => s.jobs);
  const showToast = useUIStore((s) => s.showToast);

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const stats = useMemo(() => {
    const map = new Map<string, { jobs: number; revenue: number }>();
    for (const j of jobs) {
      const cur = map.get(j.clientId) ?? { jobs: 0, revenue: 0 };
      cur.jobs += 1;
      cur.revenue += j.totalPaid;
      map.set(j.clientId, cur);
    }
    return map;
  }, [jobs]);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const submit = async () => {
    if (!name.trim()) return;
    await createClient({ name, phone, email });
    setName('');
    setPhone('');
    setEmail('');
    setAddOpen(false);
    showToast('Client added');
  };

  return (
    <div>
      <ScreenHeader
        title="Clients"
        back
        right={
          <button onClick={() => setAddOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-dim text-amber" aria-label="Add client">
            <Plus size={20} />
          </button>
        }
      />
      <div className="px-5 pt-3">
        <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-3 space-y-2 px-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No clients"
            subtitle="Add a client or create an estimate."
            action={<Button onClick={() => setAddOpen(true)}>Add Client</Button>}
          />
        ) : (
          filtered.map((c) => {
            const s = stats.get(c.id);
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/clients/${c.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-left active:bg-elev"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/15 text-sm font-bold text-sky">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-1">{c.name}</p>
                  <p className="truncate text-xs text-ink-3">
                    {c.phone ? fmtPhone(c.phone) : c.email || 'No contact'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-jade">{fmtCurrency(s?.revenue ?? 0)}</p>
                  <p className="text-[11px] text-ink-3">{s?.jobs ?? 0} jobs</p>
                </div>
                <ChevronRight size={16} className="text-ink-3" />
              </button>
            );
          })
        )}
      </div>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="New Client">
        <div className="space-y-3">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button full onClick={submit} disabled={!name.trim()}>
            Add Client
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
