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

    return { monthRevenue, ytdRevenue, categoryData, avgJob, outstanding };
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
