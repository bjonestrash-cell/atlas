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
        <h1 className="font-display text-5xl tracking-wider text-atlas-text">FINANCIAL SUMMARY</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Entry</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Annual Budget" value={formatCurrency(totalPlanned)} />
        <StatCard label="Actual Spend" value={formatCurrency(totalActual)} accent />
        <StatCard label="Remaining" value={formatCurrency(totalPlanned - totalActual)} sub={totalPlanned > 0 ? `${((totalActual / totalPlanned) * 100).toFixed(0)}% used` : ''} />
        <StatCard label="Entries" value={entries.length} />
      </div>

      <div className="card">
        <h2 className="font-display text-2xl tracking-wider text-atlas-text mb-4">Monthly Budget vs. Actual</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8cad8" />
            <XAxis dataKey="name" stroke="#5a7a8e" fontSize={12} />
            <YAxis stroke="#5a7a8e" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#dce6ee', border: '1px solid #b8cad8', borderRadius: '6px', color: '#1a2a3a' }} formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="Planned" fill="#b8cad8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Actual" fill="#2c5f8a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="font-display text-2xl tracking-wider text-atlas-text mb-4">Cumulative Spend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b8cad8" />
            <XAxis dataKey="name" stroke="#5a7a8e" fontSize={12} />
            <YAxis stroke="#5a7a8e" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#dce6ee', border: '1px solid #b8cad8', borderRadius: '6px', color: '#1a2a3a' }} formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Line type="monotone" dataKey="Planned" stroke="#b8cad8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="Actual" stroke="#2c5f8a" strokeWidth={2} dot={{ r: 3, fill: '#2c5f8a' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {summary.byCategory.length > 0 && (
        <div className="card">
          <h2 className="font-display text-2xl tracking-wider text-atlas-text mb-4">By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from(new Set(summary.byCategory.map((c) => c.category))).map((cat) => {
              const planned = summary.byCategory.find((c) => c.category === cat && c.type === 'planned');
              const actual = summary.byCategory.find((c) => c.category === cat && c.type === 'actual');
              const pct = planned && planned.total > 0 ? ((actual?.total || 0) / planned.total) * 100 : 0;
              return (
                <div key={cat} className="p-3 rounded-lg bg-atlas-bg/60 border border-atlas-border">
                  <div className="text-xs font-semibold text-atlas-muted uppercase tracking-wider mb-1">{cat}</div>
                  <div className="font-display text-2xl text-atlas-text">{formatCurrency(actual?.total || 0)}</div>
                  <div className="text-xs text-atlas-muted">of {formatCurrency(planned?.total || 0)} planned</div>
                  <div className="w-full bg-atlas-border rounded-full h-1.5 mt-2">
                    <div className={`h-1.5 rounded-full ${pct > 100 ? 'bg-atlas-danger' : 'bg-atlas-accent'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-display text-2xl tracking-wider text-atlas-text mb-4">Recent Entries</h2>
        {entries.length === 0 ? (
          <p className="text-atlas-muted text-sm">No budget entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-atlas-border">
                  <th className="text-left py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Month</th>
                  <th className="text-left py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="text-left py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Type</th>
                  <th className="text-right py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Amount</th>
                  <th className="text-left py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Notes</th>
                  <th className="text-right py-2"></th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(-20).reverse().map((e, i) => (
                  <tr key={e.id} className={`border-b border-atlas-border/30 ${i % 2 === 1 ? 'bg-atlas-bg/40' : ''}`}>
                    <td className="py-2 text-atlas-text">{formatMonth(e.month)}</td>
                    <td className="py-2 text-atlas-text">{e.category}</td>
                    <td className="py-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${e.type === 'planned' ? 'bg-atlas-blue/10 text-atlas-blue' : 'bg-atlas-success/10 text-atlas-success'}`}>{e.type}</span>
                    </td>
                    <td className="py-2 text-right font-heading font-semibold text-atlas-text">{formatCurrency(e.amount)}</td>
                    <td className="py-2 text-atlas-muted text-xs">{e.notes}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleDelete(e.id)} className="text-xs text-atlas-danger hover:underline">Del</button>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Month *</label>
              <input type="month" value={form.month} onChange={set('month')} className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={set('category')} className="w-full">
                <option>Flights</option><option>Hotels</option><option>Car Rental</option><option>Food</option><option>Activities</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Amount (USD) *</label>
              <input type="number" value={form.amount} onChange={set('amount')} placeholder="500" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Type</label>
              <select value={form.type} onChange={set('type')} className="w-full">
                <option value="planned">Planned</option><option value="actual">Actual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Notes</label>
            <input value={form.notes} onChange={set('notes')} placeholder="Optional notes" className="w-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1">Add Entry</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
