import { useEffect, useState } from 'react';
import { useAlertStore } from '../store/alertStore';
import { usePointsStore } from '../store/pointsStore';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, daysUntil, formatPoints } from '../utils/format';

export default function Alerts() {
  const { alerts, fetchAlerts, createAlert, updateAlert, deleteAlert } = useAlertStore();
  const { programs, fetchPrograms } = usePointsStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ origin: '', destination: '', target_price: '', date: '' });

  useEffect(() => {
    fetchAlerts();
    fetchPrograms();
  }, []);

  const handleSave = async () => {
    if (!form.origin || !form.destination || !form.target_price) return;
    await createAlert({
      ...form,
      target_price: parseFloat(form.target_price),
    });
    setForm({ origin: '', destination: '', target_price: '', date: '' });
    setShowModal(false);
  };

  const toggleAlert = async (alert) => {
    await updateAlert(alert.id, { active: !alert.active });
  };

  const expirationWarnings = programs
    .filter((p) => p.expiration_date)
    .map((p) => {
      const days = daysUntil(p.expiration_date);
      let urgency = null;
      if (days <= 7) urgency = 'critical';
      else if (days <= 30) urgency = 'warning';
      else if (days <= 60) urgency = 'notice';
      return { ...p, daysLeft: days, urgency };
    })
    .filter((p) => p.urgency && p.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-atlas-text">Alerts & Optimization</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Price Alert</button>
      </div>

      {/* Points Expiration Warnings */}
      {expirationWarnings.length > 0 && (
        <div className="card border-atlas-warning/40">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-atlas-warning mb-3">Points Expiration Warnings</h2>
          <div className="space-y-2">
            {expirationWarnings.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                p.urgency === 'critical' ? 'border-atlas-danger/40 bg-atlas-danger/5' :
                p.urgency === 'warning' ? 'border-atlas-warning/40 bg-amber-50/50' :
                'border-atlas-border bg-atlas-bg/50'
              }`}>
                <div>
                  <span className="font-medium text-atlas-text">{p.program_name}</span>
                  <span className="text-sm text-atlas-muted ml-2">{formatPoints(p.balance)} pts</span>
                </div>
                <div className={`text-sm font-semibold ${
                  p.urgency === 'critical' ? 'text-atlas-danger' :
                  p.urgency === 'warning' ? 'text-atlas-warning' :
                  'text-atlas-muted'
                }`}>
                  {p.daysLeft === 0 ? 'Expires today!' : `${p.daysLeft} days left`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Alerts */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-atlas-muted mb-4">Price Drop Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-atlas-muted text-sm">No price alerts set. Create one to track flight prices.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isTriggered = alert.current_price && alert.current_price <= alert.target_price;
              return (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  isTriggered ? 'border-atlas-success/40 bg-emerald-50/50' :
                  !alert.active ? 'border-atlas-border/50 opacity-50' :
                  'border-atlas-border bg-atlas-bg/50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium text-atlas-text">{alert.origin} → {alert.destination}</div>
                      {alert.date && <div className="text-xs text-atlas-muted">{formatDate(alert.date)}</div>}
                    </div>
                    <div className="text-sm">
                      <span className="text-atlas-muted">Target: </span>
                      <span className="text-atlas-accent font-semibold">{formatCurrency(alert.target_price)}</span>
                    </div>
                    {alert.current_price && (
                      <div className="text-sm">
                        <span className="text-atlas-muted">Current: </span>
                        <span className={`font-semibold ${isTriggered ? 'text-atlas-success' : 'text-atlas-text'}`}>
                          {formatCurrency(alert.current_price)}
                        </span>
                      </div>
                    )}
                    {isTriggered && (
                      <span className="text-xs font-semibold bg-atlas-success/15 text-atlas-success px-2 py-0.5 rounded">
                        PRICE DROP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert)}
                      className={`text-xs ${alert.active ? 'text-atlas-accent' : 'text-atlas-muted'} hover:underline`}
                    >
                      {alert.active ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => deleteAlert(alert.id)} className="text-xs text-atlas-danger hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {alerts.length > 0 && (
          <div className="text-xs text-atlas-muted mt-3">
            Prices checked daily at 8:00 AM via SerpApi
          </div>
        )}
      </div>

      {/* Add Alert Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Price Alert">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Origin *</label>
              <input value={form.origin} onChange={set('origin')} placeholder="LAX" maxLength={3} className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Destination *</label>
              <input value={form.destination} onChange={set('destination')} placeholder="NRT" maxLength={3} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Target Price (USD) *</label>
              <input type="number" value={form.target_price} onChange={set('target_price')} placeholder="500" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Travel Date</label>
              <input type="date" value={form.date} onChange={set('date')} className="w-full" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1">Create Alert</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
