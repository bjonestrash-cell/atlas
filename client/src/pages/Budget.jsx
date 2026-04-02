import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import { formatCurrency, formatMonth } from '../utils/format';

const YEAR = new Date().getFullYear().toString();
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Budget() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ monthly: [], byCategory: [] });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ month: '', category: 'Flights', amount: '', type: 'actual', notes: '' });

  const fetchData = async () => {
    const [ent, sum] = await Promise.all([api.getBudget(), api.getBudgetSummary(YEAR)]);
    setEntries(ent);
    setSummary(sum);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.month || !form.amount) return;
    await api.createBudgetEntry({ ...form, amount: parseFloat(form.amount) });
    setForm({ month: '', category: 'Flights', amount: '', type: 'actual', notes: '' });
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => { await api.deleteBudgetEntry(id); fetchData(); };

  const chartData = useMemo(() => {
    return MONTH_LABELS.map((label, i) => {
      const m = `${YEAR}-${String(i + 1).padStart(2, '0')}`;
      const planned = summary.monthly.find((r) => r.month === m && r.type === 'planned');
      const actual = summary.monthly.find((r) => r.month === m && r.type === 'actual');
      return { name: label, Planned: planned ? planned.total : 0, Actual: actual ? actual.total : 0 };
    });
  }, [summary]);

  const totalPlanned = chartData.reduce((s, d) => s + d.Planned, 0);
  const totalActual = chartData.reduce((s, d) => s + d.Actual, 0);

  const cumulativeData = useMemo(() => {
    let cumP = 0, cumA = 0;
    return chartData.map((d) => { cumP += d.Planned; cumA += d.Actual; return { name: d.name, Planned: cumP, Actual: cumA }; });
  }, [chartData]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--ink)' }}>Budget</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Entry</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Annual Budget" value={formatCurrency(totalPlanned)} />
        <StatCard label="Actual Spend" value={formatCurrency(totalActual)} accent />
        <StatCard label="Remaining" value={formatCurrency(totalPlanned - totalActual)} sub={totalPlanned > 0 ? `${((totalActual / totalPlanned) * 100).toFixed(0)}% used` : ''} />
        <StatCard label="Entries" value={entries.length} />
      </div>

      <div className="card">
        <h2 className="mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--ink)' }}>Monthly Budget vs. Actual</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
            <XAxis dataKey="name" stroke="#C4B9A8" fontSize={12} />
            <YAxis stroke="#C4B9A8" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#F0EBE1', border: '1px solid #E8DFD0', borderRadius: '2px', color: '#0D0D0B', boxShadow: '0 4px 16px rgba(13,13,11,0.08)' }} formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="Planned" fill="#E8DFD0" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Actual" fill="#8C7355" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--ink)' }}>Cumulative Spend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
            <XAxis dataKey="name" stroke="#C4B9A8" fontSize={12} />
            <YAxis stroke="#C4B9A8" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#F0EBE1', border: '1px solid #E8DFD0', borderRadius: '2px', color: '#0D0D0B', boxShadow: '0 4px 16px rgba(13,13,11,0.08)' }} formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Line type="monotone" dataKey="Planned" stroke="#C4B9A8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="Actual" stroke="#8C7355" strokeWidth={2.5} dot={{ r: 3, fill: '#8B6F47' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {summary.byCategory.length > 0 && (
        <div className="card">
          <h2 className="mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--ink)' }}>By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(summary.byCategory.map((c) => c.category))).map((cat) => {
              const planned = summary.byCategory.find((c) => c.category === cat && c.type === 'planned');
              const actual = summary.byCategory.find((c) => c.category === cat && c.type === 'actual');
              const pct = planned && planned.total > 0 ? ((actual?.total || 0) / planned.total) * 100 : 0;
              return (
                <div key={cat} className="p-4 rounded-2xl bg-atlas-bg">
                  <div className="stat-label mb-2">{cat}</div>
                  <div className="text-2xl font-extrabold text-atlas-text">{formatCurrency(actual?.total || 0)}</div>
                  <div className="text-xs text-atlas-muted mt-1">of {formatCurrency(planned?.total || 0)} planned</div>
                  <div className="w-full bg-atlas-border rounded-full h-1.5 mt-3">
                    <div className={`h-1.5 rounded-full ${pct > 100 ? 'bg-atlas-danger' : 'bg-atlas-accent'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--ink)' }}>Recent Entries</h2>
        {entries.length === 0 ? (
          <p className="text-atlas-muted text-sm">No budget entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-atlas-border">
                  <th className="text-left py-3 stat-label">Month</th>
                  <th className="text-left py-3 stat-label">Category</th>
                  <th className="text-left py-3 stat-label">Type</th>
                  <th className="text-right py-3 stat-label">Amount</th>
                  <th className="text-left py-3 stat-label">Notes</th>
                  <th className="text-right py-3"></th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(-20).reverse().map((e, i) => (
                  <tr key={e.id} className={`border-b border-atlas-border/50 ${i % 2 === 1 ? 'bg-atlas-bg/50' : ''}`}>
                    <td className="py-3 text-atlas-text font-medium">{formatMonth(e.month)}</td>
                    <td className="py-3 text-atlas-text">{e.category}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill ${e.type === 'planned' ? 'bg-atlas-bg text-atlas-sub' : 'bg-atlas-green-light text-atlas-green-dark'}`}>{e.type}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-atlas-text">{formatCurrency(e.amount)}</td>
                    <td className="py-3 text-atlas-muted text-xs">{e.notes}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(e.id)} className="text-xs text-atlas-danger hover:underline font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Budget Entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="stat-label block mb-2">Month *</label>
              <input type="month" value={form.month} onChange={set('month')} className="w-full" />
            </div>
            <div>
              <label className="stat-label block mb-2">Category</label>
              <select value={form.category} onChange={set('category')} className="w-full">
                <option>Flights</option><option>Hotels</option><option>Car Rental</option><option>Food</option><option>Activities</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="stat-label block mb-2">Amount (USD) *</label>
              <input type="number" value={form.amount} onChange={set('amount')} placeholder="500" className="w-full" />
            </div>
            <div>
              <label className="stat-label block mb-2">Type</label>
              <select value={form.type} onChange={set('type')} className="w-full">
                <option value="planned">Planned</option><option value="actual">Actual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="stat-label block mb-2">Notes</label>
            <input value={form.notes} onChange={set('notes')} placeholder="Optional notes" className="w-full" />
          </div>
          <div className="flex gap-3 pt-3">
            <button onClick={handleSave} className="btn-primary flex-1">Add Entry</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
