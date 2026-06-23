import { useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useJobStore } from '../../stores/jobStore';
import { getCategory } from '../../data/categories';
import { fmtCurrency } from '../../utils/format';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Card from '../../components/ui/Card';

export default function ReportsScreen() {
  const jobs = useJobStore((s) => s.jobs);

  const data = useMemo(() => {
    const now = new Date();
    const monthRevenue = jobs.reduce(
      (s, j) =>
        s +
        j.payments
          .filter((p) => {
            const d = new Date(p.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((a, p) => a + p.amount, 0),
      0,
    );
    const ytdRevenue = jobs.reduce(
      (s, j) =>
        s +
        j.payments
          .filter((p) => new Date(p.date).getFullYear() === now.getFullYear())
          .reduce((a, p) => a + p.amount, 0),
      0,
    );

    const byCategory = new Map<string, number>();
    for (const j of jobs) {
      byCategory.set(j.categoryId, (byCategory.get(j.categoryId) ?? 0) + j.estimateTotal);
    }
    const categoryData = [...byCategory.entries()]
      .map(([id, value]) => ({ name: getCategory(id)?.name ?? id, value, color: getCategory(id)?.color ?? '#8896B3' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const avgJob = jobs.length ? jobs.reduce((s, j) => s + j.estimateTotal, 0) / jobs.length : 0;
    const outstanding = jobs
      .filter((j) => j.status !== 'paid' && j.status !== 'cancelled')
      .reduce((s, j) => s + Math.max(0, j.balanceDue), 0);

    // Aging of outstanding balances, bucketed by days since invoice/creation.
    const aging = { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 };
    for (const j of jobs) {
      if (j.status === 'paid' || j.status === 'cancelled' || j.balanceDue <= 0) continue;
      const ref = new Date(j.invoiceSentAt ?? j.createdAt).getTime();
      const days = Math.floor((now.getTime() - ref) / 864e5);
      if (days < 30) aging['0-30'] += j.balanceDue;
      else if (days < 60) aging['30-60'] += j.balanceDue;
      else if (days < 90) aging['60-90'] += j.balanceDue;
      else aging['90+'] += j.balanceDue;
    }

    return { monthRevenue, ytdRevenue, categoryData, avgJob, outstanding, aging };
  }, [jobs]);

  return (
    <div className="pb-8">
      <ScreenHeader title="Reports" back />
      <div className="space-y-3 px-5 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Card>
            <p className="text-xs text-ink-2">Revenue This Month</p>
            <p className="text-2xl font-extrabold text-jade">{fmtCurrency(data.monthRevenue)}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-2">Revenue YTD</p>
            <p className="text-2xl font-extrabold text-ink-1">{fmtCurrency(data.ytdRevenue)}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-2">Avg Job Value</p>
            <p className="text-xl font-bold text-amber">{fmtCurrency(data.avgJob)}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-2">Outstanding</p>
            <p className="text-xl font-bold text-rose">{fmtCurrency(data.outstanding)}</p>
          </Card>
        </div>

        <Card>
          <p className="mb-3 text-sm font-semibold text-ink-1">Outstanding by Age</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['0-30', '30-60', '60-90', '90+'] as const).map((bucket) => (
              <div key={bucket} className="rounded-xl bg-surf p-2">
                <p className={`text-sm font-bold ${data.aging[bucket] > 0 ? 'text-rose' : 'text-ink-3'}`}>
                  {fmtCurrency(data.aging[bucket])}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-3">{bucket} d</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-semibold text-ink-1">Revenue by Category</p>
          {data.categoryData.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8896B3' }} interval={0} angle={-30} textAnchor="end" height={50} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: '#162035', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.categoryData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
