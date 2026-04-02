import { useEffect, useState } from 'react';
import { useAlertStore } from '../store/alertStore';
import { usePointsStore } from '../store/pointsStore';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, daysUntil, formatPoints } from '../utils/format';
import { api } from '../utils/api';
import { ExternalLink, RefreshCw, CreditCard, Plane, Building2, Car, Star } from 'lucide-react';

const TABS = [
  { key: 'favorites', label: 'Favorites', Icon: Star },
  { key: 'credit_card', label: 'Cards', Icon: CreditCard },
  { key: 'airline', label: 'Airlines', Icon: Plane },
  { key: 'hotel', label: 'Hotels', Icon: Building2 },
  { key: 'rental_car', label: 'Cars', Icon: Car },
];

const CAT_CONFIG = {
  credit_card: { label: 'Credit Cards', color: '#0D0D0B' },
  airline: { label: 'Airlines', color: '#8C7355' },
  hotel: { label: 'Hotels', color: '#C4B9A8' },
  rental_car: { label: 'Rental Cars', color: '#B39370' },
};
const CAT_ORDER = ['credit_card', 'airline', 'hotel', 'rental_car'];

export default function Alerts() {
  const { alerts, fetchAlerts, createAlert, updateAlert, deleteAlert } = useAlertStore();
  const { programs, fetchPrograms } = usePointsStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ origin: '', destination: '', target_price: '', date: '' });

  // Promotions state
  const [promoData, setPromoData] = useState(null); // { news, favorites, activeCats }
  const [promoLoading, setPromoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    fetchAlerts();
    fetchPrograms();
    loadPromotions('favorites');
  }, []);

  const loadPromotions = async (tab) => {
    setPromoLoading(true);
    try {
      const data = await api.getPromotions(tab);
      setPromoData(data);
    } catch (e) {
      console.error(e);
    }
    setPromoLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadPromotions(tab);
  };

  const handleRefresh = () => {
    loadPromotions(activeTab);
  };

  const handleSave = async () => {
    if (!form.origin || !form.destination || !form.target_price) return;
    await createAlert({ ...form, target_price: parseFloat(form.target_price) });
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

  // Current tab news items
  const currentNews = promoData?.news || {};
  const activeCats = promoData?.activeCats || {};
  const favoritesList = promoData?.favorites || [];

  const tabHasNews = (tab) => {
    if (tab === 'favorites') return CAT_ORDER.some((c) => (currentNews[c] || []).length > 0);
    return (currentNews[tab] || []).length > 0;
  };

  const isTabDisabled = (tab) => {
    if (tab === 'favorites') return false;
    return (activeCats[tab] || 0) === 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-atlas-text">Alerts & News</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Price Alert</button>
      </div>

      {/* Points Expiration Warnings */}
      {expirationWarnings.length > 0 && (
        <div className="card border-l-4" style={{ borderLeftColor: '#e6a817' }}>
          <h2 className="stat-label mb-3 text-atlas-warning">Points Expiration Warnings</h2>
          <div className="space-y-2">
            {expirationWarnings.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl ${
                p.urgency === 'critical' ? 'bg-red-50' : p.urgency === 'warning' ? 'bg-yellow-50' : 'bg-atlas-bg'
              }`}>
                <div>
                  <span className="font-semibold text-atlas-text text-sm">{p.program_name}</span>
                  <span className="text-xs text-atlas-muted ml-2">{formatPoints(p.balance)} pts</span>
                </div>
                <span className={`text-xs font-bold ${
                  p.urgency === 'critical' ? 'text-atlas-danger' : p.urgency === 'warning' ? 'text-yellow-700' : 'text-atlas-muted'
                }`}>
                  {p.daysLeft === 0 ? 'Expires today!' : `${p.daysLeft}d left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Alerts */}
      <div className="card">
        <h2 className="stat-label mb-4">Price Drop Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-atlas-muted text-sm">No price alerts set. Create one to track flight prices.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const isTriggered = alert.current_price && alert.current_price <= alert.target_price;
              return (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded-2xl ${
                  isTriggered ? 'bg-green-50' : !alert.active ? 'bg-atlas-bg opacity-50' : 'bg-atlas-bg'
                }`}>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold text-atlas-text text-sm">{alert.origin} → {alert.destination}</div>
                      {alert.date && <div className="text-xs text-atlas-muted">{formatDate(alert.date)}</div>}
                    </div>
                    <div className="text-xs">
                      <span className="text-atlas-muted">Target: </span>
                      <span className="font-bold text-atlas-text">{formatCurrency(alert.target_price)}</span>
                    </div>
                    {alert.current_price && (
                      <div className="text-xs">
                        <span className="text-atlas-muted">Now: </span>
                        <span className={`font-bold ${isTriggered ? 'text-atlas-success' : 'text-atlas-text'}`}>{formatCurrency(alert.current_price)}</span>
                      </div>
                    )}
                    {isTriggered && (
                      <span className="text-[10px] font-bold bg-atlas-green-light text-atlas-green-dark px-2 py-0.5 rounded-pill">PRICE DROP</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleAlert(alert)} className={`text-xs font-medium ${alert.active ? 'text-atlas-text' : 'text-atlas-muted'} hover:underline`}>
                      {alert.active ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => deleteAlert(alert.id)} className="text-xs text-atlas-danger hover:underline">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {alerts.length > 0 && <p className="text-[10px] text-atlas-muted mt-3">Checked daily at 8:00 AM via SerpApi</p>}
      </div>

      {/* Promotions & News — Tabbed */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-atlas-text">Promotions & News</h2>
        <button
          onClick={handleRefresh}
          disabled={promoLoading}
          className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 group"
        >
          <RefreshCw
            size={12}
            className={`transition-transform duration-500 ${promoLoading ? 'animate-[spin_0.8s_linear_infinite]' : 'group-hover:rotate-[20deg]'}`}
          />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const disabled = isTabDisabled(tab.key);
          const Icon = tab.Icon;
          return (
            <button
              key={tab.key}
              onClick={() => !disabled && handleTabChange(tab.key)}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-atlas-accent text-white'
                  : disabled
                    ? 'text-atlas-border cursor-not-allowed'
                    : 'text-atlas-sub hover:text-atlas-text border border-atlas-border'
              }`}
              style={{ borderRadius: '1px', fontWeight: isActive ? 400 : 300 }}
            >
              <Icon size={13} strokeWidth={isActive ? 2.5 : 1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {promoLoading && (
        <div className="card text-center py-8">
          <RefreshCw size={24} className="animate-[spin_0.8s_linear_infinite] mx-auto text-atlas-muted mb-2" />
          <p className="text-sm text-atlas-muted">Loading news...</p>
        </div>
      )}

      {!promoLoading && activeTab === 'favorites' && favoritesList.length === 0 && (
        <div className="card text-center py-10">
          <Star size={36} className="mx-auto text-atlas-border mb-3" />
          <p className="text-sm font-semibold text-atlas-text mb-1">No favorites yet</p>
          <p className="text-xs text-atlas-muted">Star a program in your Points Portfolio or Loyalty Status to see personalized news here.</p>
        </div>
      )}

      {!promoLoading && activeTab !== 'favorites' && isTabDisabled(activeTab) && (
        <div className="card text-center py-10">
          <p className="text-sm text-atlas-muted">Add a {CAT_CONFIG[activeTab]?.label?.toLowerCase()} program to see news here.</p>
        </div>
      )}

      {!promoLoading && promoData && (
        <div className="space-y-4">
          {CAT_ORDER.map((cat) => {
            if (activeTab !== 'favorites' && activeTab !== cat) return null;
            const catNews = currentNews[cat] || [];
            if (catNews.length === 0) return null;

            return catNews.map((group) => (
              <div key={group.program} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: CAT_CONFIG[cat]?.color || '#999' }} />
                  <div>
                    <div className="text-sm font-bold text-atlas-text">{group.program}</div>
                    <div className="text-[10px] text-atlas-muted uppercase tracking-wider">{CAT_CONFIG[cat]?.label}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {group.items.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-2xl bg-atlas-bg hover:bg-atlas-border/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-atlas-text group-hover:text-atlas-accent truncate">{item.title}</div>
                          {item.snippet && <div className="text-xs text-atlas-muted mt-0.5 line-clamp-2">{item.snippet}</div>}
                          <div className="text-[10px] text-atlas-muted mt-1">
                            {item.source}{item.date ? ` · ${item.date}` : ''}
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-atlas-muted shrink-0 mt-0.5 group-hover:text-atlas-accent" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ));
          })}
        </div>
      )}

      {/* Add Alert Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Price Alert">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-2">Origin *</label>
              <input value={form.origin} onChange={set('origin')} placeholder="LAX" maxLength={3} className="w-full" />
            </div>
            <div>
              <label className="stat-label block mb-2">Destination *</label>
              <input value={form.destination} onChange={set('destination')} placeholder="NRT" maxLength={3} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-2">Target Price (USD) *</label>
              <input type="number" value={form.target_price} onChange={set('target_price')} placeholder="500" className="w-full" />
            </div>
            <div>
              <label className="stat-label block mb-2">Travel Date</label>
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
