import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../utils/api';
import { formatCurrency, formatPoints, daysUntil } from '../utils/format';

const DEFAULT_PROGRAMS = [
  { name: 'Chase Sapphire Reserve (UR)', category: 'credit_card', cpp: 2.0 },
  { name: 'Chase Sapphire Preferred (UR)', category: 'credit_card', cpp: 2.0 },
  { name: 'Chase Freedom Unlimited (UR)', category: 'credit_card', cpp: 2.0 },
  { name: 'Amex Platinum (MR)', category: 'credit_card', cpp: 2.0 },
  { name: 'Amex Gold (MR)', category: 'credit_card', cpp: 2.0 },
  { name: 'Amex Everyday (MR)', category: 'credit_card', cpp: 2.0 },
  { name: 'Citi Premier (ThankYou)', category: 'credit_card', cpp: 1.7 },
  { name: 'Citi Prestige (ThankYou)', category: 'credit_card', cpp: 1.7 },
  { name: 'Capital One Venture X', category: 'credit_card', cpp: 1.7 },
  { name: 'Capital One Venture', category: 'credit_card', cpp: 1.7 },
  { name: 'Bilt Mastercard', category: 'credit_card', cpp: 2.0 },
  { name: 'Wells Fargo Autograph', category: 'credit_card', cpp: 1.5 },
  { name: 'Delta SkyMiles', category: 'airline', cpp: 1.2 },
  { name: 'United MileagePlus', category: 'airline', cpp: 1.3 },
  { name: 'American AAdvantage', category: 'airline', cpp: 1.5 },
  { name: 'Southwest Rapid Rewards', category: 'airline', cpp: 1.5 },
  { name: 'Alaska Mileage Plan', category: 'airline', cpp: 1.8 },
  { name: 'JetBlue TrueBlue', category: 'airline', cpp: 1.3 },
  { name: 'Air France/KLM Flying Blue', category: 'airline', cpp: 1.4 },
  { name: 'British Airways Avios', category: 'airline', cpp: 1.5 },
  { name: 'Emirates Skywards', category: 'airline', cpp: 1.2 },
  { name: 'Lufthansa Miles & More', category: 'airline', cpp: 1.3 },
  { name: 'Marriott Bonvoy', category: 'hotel', cpp: 0.8 },
  { name: 'Hilton Honors', category: 'hotel', cpp: 0.6 },
  { name: 'World of Hyatt', category: 'hotel', cpp: 1.7 },
  { name: 'IHG One Rewards', category: 'hotel', cpp: 0.5 },
  { name: 'Wyndham Rewards', category: 'hotel', cpp: 1.1 },
  { name: 'Choice Privileges', category: 'hotel', cpp: 0.6 },
];

const CAT_CONFIG = {
  credit_card: { label: 'Credit Cards', color: '#1a1a1a' },
  airline: { label: 'Airlines', color: '#8bc34a' },
  hotel: { label: 'Hotels', color: '#999999' },
};
const CAT_ORDER = ['credit_card', 'airline', 'hotel'];

function fmtCommas(n) { return n ? new Intl.NumberFormat('en-US').format(n) : ''; }
function parseBal(s) { return parseInt(String(s).replace(/,/g, '')) || 0; }

function SortableCard({ prog, balance, display, onBalanceChange, onBalanceBlur, onBalanceFocus, onExpChange, onExpBlur, onFlyClick, catColor }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: prog.name });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const cashValue = (balance.balance * prog.cpp) / 100;
  const daysLeft = balance.expiration_date ? daysUntil(balance.expiration_date) : null;
  const expiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 60;

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-card p-5 flex flex-col gap-3 shadow-sm border-l-4" data-color={catColor}>
      <style>{`[data-color="${catColor}"] { border-left-color: ${catColor}; }`}</style>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-atlas-text text-sm">{prog.name}</div>
          <div className="text-xs text-atlas-muted mt-0.5">{prog.cpp}¢ per point</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {expiring && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${daysLeft <= 30 ? 'bg-red-50 text-atlas-danger' : 'bg-yellow-50 text-yellow-700'}`}>{daysLeft}d</span>
          )}
          <button {...attributes} {...listeners} className="cursor-grab text-atlas-muted hover:text-atlas-text p-1 rounded-lg hover:bg-atlas-bg" title="Drag to reorder">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input type="text" inputMode="numeric" value={display} onChange={(e) => onBalanceChange(prog.name, e.target.value)} onBlur={() => onBalanceBlur(prog.name)} onFocus={(e) => { onBalanceFocus(prog.name); e.target.select(); }} placeholder="0" className="flex-1 text-xl font-extrabold !py-2" style={{ minWidth: 0 }} />
        {balance.balance > 0 && <div className="text-sm font-semibold text-atlas-success whitespace-nowrap">≈ {formatCurrency(cashValue)}</div>}
      </div>
      <div className="flex items-center gap-2">
        <input type="date" value={balance.expiration_date} onChange={(e) => onExpChange(prog.name, e.target.value)} onBlur={() => onExpBlur(prog.name)} className="flex-1 text-xs !py-2 text-atlas-muted" />
        {balance.balance > 0 && (
          <button onClick={() => onFlyClick(prog.name)} className="text-xs font-semibold text-atlas-accent bg-atlas-bg px-3 py-1.5 rounded-pill hover:bg-atlas-border transition-colors whitespace-nowrap">
            Fly &#9992;
          </button>
        )}
      </div>
    </div>
  );
}

export default function PointsManager() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState(() => {
    const m = {};
    DEFAULT_PROGRAMS.forEach((p) => { m[p.name] = { balance: 0, expiration_date: '' }; });
    return m;
  });
  const [displayValues, setDisplayValues] = useState(() => {
    const m = {};
    DEFAULT_PROGRAMS.forEach((p) => { m[p.name] = ''; });
    return m;
  });
  const [order, setOrder] = useState(() => {
    const m = {};
    CAT_ORDER.forEach((cat) => { m[cat] = DEFAULT_PROGRAMS.filter((p) => p.category === cat).map((p) => p.name); });
    return m;
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [barAnimated, setBarAnimated] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    api.getPoints().then((saved) => {
      const nb = { ...balances };
      const nd = { ...displayValues };
      for (const s of saved) {
        if (nb[s.program_name] !== undefined) {
          nb[s.program_name] = { balance: s.balance || 0, expiration_date: s.expiration_date || '' };
          nd[s.program_name] = s.balance > 0 ? fmtCommas(s.balance) : '';
        }
      }
      setBalances(nb);
      setDisplayValues(nd);
      if (saved.length > 0) setLastUpdated(saved.reduce((a, b) => a.updated_at > b.updated_at ? a : b).updated_at);
    });
    setTimeout(() => setBarAnimated(true), 100);
  }, []);

  const saveProgram = useCallback(async (name) => {
    const b = balances[name];
    const p = DEFAULT_PROGRAMS.find((pr) => pr.name === name);
    if (!p) return;
    try {
      await api.createPoint({ program_name: name, balance: b.balance, cpp: p.cpp, expiration_date: b.expiration_date || null });
      setLastUpdated(new Date().toISOString());
    } catch (e) { console.error('Save failed:', e); }
  }, [balances]);

  const handleBalanceChange = (name, val) => {
    setDisplayValues((d) => ({ ...d, [name]: val }));
    setBalances((b) => ({ ...b, [name]: { ...b[name], balance: parseBal(val) } }));
  };
  const handleBalanceBlur = (name) => {
    const num = balances[name].balance;
    setDisplayValues((d) => ({ ...d, [name]: num > 0 ? fmtCommas(num) : '' }));
    saveProgram(name);
  };
  const handleBalanceFocus = (name) => {
    const num = balances[name].balance;
    if (num > 0) setDisplayValues((d) => ({ ...d, [name]: String(num) }));
  };
  const handleExpChange = (name, date) => setBalances((b) => ({ ...b, [name]: { ...b[name], expiration_date: date } }));
  const handleExpBlur = (name) => saveProgram(name);
  const handleFlyClick = (name) => navigate(`/flights?program=${encodeURIComponent(name)}`);

  const handleDragEnd = (cat, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const items = [...prev[cat]];
      const oldIdx = items.indexOf(active.id);
      const newIdx = items.indexOf(over.id);
      items.splice(oldIdx, 1);
      items.splice(newIdx, 0, active.id);
      return { ...prev, [cat]: items };
    });
  };

  const totals = useMemo(() => {
    const r = { total: 0, totalPoints: 0 };
    CAT_ORDER.forEach((c) => { r[c] = 0; });
    DEFAULT_PROGRAMS.forEach((p) => {
      const bal = balances[p.name]?.balance || 0;
      const val = (bal * p.cpp) / 100;
      r.total += val;
      r.totalPoints += bal;
      r[p.category] += val;
    });
    return r;
  }, [balances]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-atlas-text">Points Portfolio</h1>
        {lastUpdated && <p className="text-xs text-atlas-muted mt-1">Last updated {new Date(lastUpdated).toLocaleString()}</p>}
      </div>

      {/* Portfolio Summary */}
      <div className="card">
        <div className="text-center mb-6">
          <div className="stat-label mb-2">Total Portfolio Value</div>
          <div className="text-5xl font-extrabold text-atlas-text tracking-tight">{formatCurrency(totals.total)}</div>
          <div className="text-sm text-atlas-muted mt-2">{formatPoints(totals.totalPoints)} points across {DEFAULT_PROGRAMS.length} programs</div>
        </div>

        {/* Animated breakdown bar */}
        <div className="flex rounded-full overflow-hidden h-3 mb-4 bg-atlas-bg">
          {CAT_ORDER.map((cat) => {
            const pct = totals.total > 0 ? (totals[cat] / totals.total) * 100 : 0;
            if (pct < 0.5) return null;
            return (
              <div
                key={cat}
                className="h-full transition-all duration-1000 ease-out"
                style={{ width: barAnimated ? `${pct}%` : '0%', backgroundColor: CAT_CONFIG[cat].color }}
                title={`${CAT_CONFIG[cat].label}: ${formatCurrency(totals[cat])} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        <div className="flex justify-center gap-8">
          {CAT_ORDER.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CAT_CONFIG[cat].color }} />
              <div>
                <div className="text-xs text-atlas-muted">{CAT_CONFIG[cat].label}</div>
                <div className="text-sm font-bold text-atlas-text">{formatCurrency(totals[cat])}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Cards by Category with DnD */}
      {CAT_ORDER.map((cat) => {
        const catNames = order[cat];
        const config = CAT_CONFIG[cat];

        return (
          <div key={cat}>
            <h2 className="text-lg font-bold text-atlas-text mb-4">{config.label}</h2>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(cat, e)}>
              <SortableContext items={catNames} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catNames.map((name) => {
                    const prog = DEFAULT_PROGRAMS.find((p) => p.name === name);
                    if (!prog) return null;
                    return (
                      <SortableCard
                        key={name}
                        prog={prog}
                        balance={balances[name] || { balance: 0, expiration_date: '' }}
                        display={displayValues[name] || ''}
                        onBalanceChange={handleBalanceChange}
                        onBalanceBlur={handleBalanceBlur}
                        onBalanceFocus={handleBalanceFocus}
                        onExpChange={handleExpChange}
                        onExpBlur={handleExpBlur}
                        onFlyClick={handleFlyClick}
                        catColor={config.color}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );
      })}
    </div>
  );
}
