import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Search, X, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatPoints, daysUntil } from '../utils/format';

const ALL_PROGRAMS = [
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
  { name: 'Avis Preferred Points', category: 'rental_car', cpp: 0.7 },
  { name: 'Enterprise Plus', category: 'rental_car', cpp: 0.6 },
  { name: 'Hertz Gold Plus', category: 'rental_car', cpp: 0.8 },
  { name: 'National Emerald Club', category: 'rental_car', cpp: 0.7 },
  { name: 'Budget Fastbreak', category: 'rental_car', cpp: 0.5 },
  { name: 'Sixt Loyalty', category: 'rental_car', cpp: 0.6 },
];

const CAT_CONFIG = {
  credit_card: { label: 'Credit Cards', color: '#1a1a1a' },
  airline: { label: 'Airlines', color: '#8bc34a' },
  hotel: { label: 'Hotels', color: '#999999' },
  rental_car: { label: 'Rental Cars', color: '#e6a817' },
};
const CAT_ORDER = ['credit_card', 'airline', 'hotel', 'rental_car'];

function fmtCommas(n) { return n ? new Intl.NumberFormat('en-US').format(n) : ''; }
function parseBal(s) { return parseInt(String(s).replace(/,/g, '')) || 0; }

// Bottom sheet component
function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-atlas-border" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PointsManager() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [barAnimated, setBarAnimated] = useState(false);

  // Sheet states
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('pick'); // 'pick' | 'edit'
  const [searchQuery, setSearchQuery] = useState('');
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editExpiration, setEditExpiration] = useState('');
  const balanceRef = useRef(null);

  // Load from DB
  useEffect(() => {
    api.getPoints().then((saved) => {
      const m = {};
      saved.forEach((s) => {
        if (s.balance > 0 || s.favorite) {
          m[s.program_name] = { balance: s.balance || 0, expiration_date: s.expiration_date || '', favorite: !!s.favorite, cpp: s.cpp };
        }
      });
      setPrograms(m);
      if (saved.length > 0) {
        const latest = saved.filter((s) => s.updated_at).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
        if (latest) setLastUpdated(latest.updated_at);
      }
    });
    setTimeout(() => setBarAnimated(true), 100);
  }, []);

  // Derived data
  const activePrograms = useMemo(() => {
    return Object.entries(programs)
      .filter(([, v]) => v.balance > 0)
      .map(([name, data]) => {
        const def = ALL_PROGRAMS.find((p) => p.name === name);
        return { name, ...data, cpp: def?.cpp || data.cpp || 1.0, category: def?.category || 'credit_card' };
      });
  }, [programs]);

  const favoriteCards = activePrograms.filter((p) => p.favorite);
  const totalCount = activePrograms.length;

  const totals = useMemo(() => {
    const r = { total: 0, totalPoints: 0 };
    CAT_ORDER.forEach((c) => { r[c] = 0; });
    activePrograms.forEach((p) => {
      const val = (p.balance * p.cpp) / 100;
      r.total += val;
      r.totalPoints += p.balance;
      r[p.category] = (r[p.category] || 0) + val;
    });
    return r;
  }, [activePrograms]);

  // Actions
  const saveProgram = useCallback(async (name, balance, expiration, favorite) => {
    const def = ALL_PROGRAMS.find((p) => p.name === name);
    const cpp = def?.cpp || 1.0;
    try {
      await api.createPoint({ program_name: name, balance, cpp, expiration_date: expiration || null, favorite: favorite ? 1 : 0 });
      setPrograms((prev) => ({ ...prev, [name]: { balance, expiration_date: expiration || '', favorite: !!favorite, cpp } }));
      setLastUpdated(new Date().toISOString());
    } catch (e) { console.error('Save failed:', e); }
  }, []);

  const deleteProgram = useCallback(async (name) => {
    try {
      await api.createPoint({ program_name: name, balance: 0, cpp: 1.0, expiration_date: null, favorite: 0 });
      setPrograms((prev) => { const n = { ...prev }; delete n[name]; return n; });
      setLastUpdated(new Date().toISOString());
    } catch (e) { console.error('Delete failed:', e); }
  }, []);

  const toggleFavorite = useCallback((name) => {
    const cur = programs[name];
    if (!cur) return;
    const newFav = !cur.favorite;
    saveProgram(name, cur.balance, cur.expiration_date, newFav);
  }, [programs, saveProgram]);

  // Sheet controls
  const openAddSheet = () => {
    setSheetMode('pick');
    setSearchQuery('');
    setEditName('');
    setEditBalance('');
    setEditExpiration('');
    setSheetOpen(true);
  };

  const selectProgram = (name) => {
    const def = ALL_PROGRAMS.find((p) => p.name === name);
    const existing = programs[name];
    setEditName(name);
    setEditBalance(existing?.balance > 0 ? String(existing.balance) : '');
    setEditExpiration(existing?.expiration_date || '');
    setSheetMode('edit');
    setTimeout(() => balanceRef.current?.focus(), 200);
  };

  const openEditSheet = (name) => {
    const data = programs[name];
    setEditName(name);
    setEditBalance(data?.balance > 0 ? String(data.balance) : '');
    setEditExpiration(data?.expiration_date || '');
    setSheetMode('edit');
    setSearchQuery('');
    setSheetOpen(true);
    setTimeout(() => balanceRef.current?.focus(), 300);
  };

  const handleSave = () => {
    const bal = parseBal(editBalance);
    if (!editName || bal <= 0) return;
    const existing = programs[editName];
    saveProgram(editName, bal, editExpiration, existing?.favorite || false);
    setSheetOpen(false);
  };

  const handleDelete = () => {
    if (!editName) return;
    deleteProgram(editName);
    setSheetOpen(false);
  };

  // Filtered search results
  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ALL_PROGRAMS.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const editProgramDef = ALL_PROGRAMS.find((p) => p.name === editName);
  const editCashValue = editProgramDef ? (parseBal(editBalance) * editProgramDef.cpp) / 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-atlas-text">Points Portfolio</h1>
        <button onClick={openAddSheet} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Points
        </button>
      </div>

      {/* Hero / Summary */}
      <div className="card text-center">
        <div className="stat-label mb-2">Total Portfolio Value</div>
        <div className="text-5xl font-extrabold text-atlas-text tracking-tight">{formatCurrency(totals.total)}</div>
        <div className="text-sm text-atlas-muted mt-2">
          {totalCount > 0
            ? `${formatPoints(totals.totalPoints)} points across ${totalCount} programs`
            : 'Add your first loyalty program to get started'}
        </div>

        {totalCount > 0 && (
          <>
            <div className="flex rounded-full overflow-hidden h-3 mt-5 mb-4 bg-atlas-bg">
              {CAT_ORDER.map((cat) => {
                const pct = totals.total > 0 ? (totals[cat] / totals.total) * 100 : 0;
                if (pct < 0.5) return null;
                return <div key={cat} className="h-full transition-all duration-1000 ease-out" style={{ width: barAnimated ? `${pct}%` : '0%', backgroundColor: CAT_CONFIG[cat].color }} />;
              })}
            </div>
            <div className="flex justify-center gap-5 flex-wrap">
              {CAT_ORDER.map((cat) => totals[cat] > 0 ? (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CAT_CONFIG[cat].color }} />
                  <span className="text-xs text-atlas-muted">{CAT_CONFIG[cat].label}</span>
                  <span className="text-xs font-bold text-atlas-text">{formatCurrency(totals[cat])}</span>
                </div>
              ) : null)}
            </div>
          </>
        )}
      </div>

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4 opacity-15">&#128179;</div>
          <p className="text-atlas-muted font-medium mb-4">No points programs added yet</p>
          <button onClick={openAddSheet} className="btn-secondary inline-flex items-center gap-2">
            <Plus size={16} /> Add Your First Program
          </button>
        </div>
      )}

      {/* Favorites pinned at top */}
      {favoriteCards.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-atlas-text mb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <Star size={14} fill="#e6a817" stroke="#e6a817" /> Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteCards.map((prog) => (
              <PortfolioCard key={`fav-${prog.name}`} prog={prog} onTap={openEditSheet} onToggleFav={toggleFavorite} />
            ))}
          </div>
        </div>
      )}

      {/* Cards by category — only categories with active programs */}
      {CAT_ORDER.map((cat) => {
        const catProgs = activePrograms.filter((p) => p.category === cat);
        if (catProgs.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-sm font-bold text-atlas-text mb-3 uppercase tracking-wider">{CAT_CONFIG[cat].label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catProgs.map((prog) => (
                <PortfolioCard key={prog.name} prog={prog} onTap={openEditSheet} onToggleFav={toggleFavorite} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Bottom Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {sheetMode === 'pick' ? (
          <div className="flex flex-col overflow-hidden">
            <div className="px-5 pb-3 pt-2">
              <h2 className="text-lg font-bold text-atlas-text mb-3">Add Points Program</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-atlas-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs..."
                  className="w-full !pl-10 !py-3.5 text-base"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-atlas-muted">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-8" style={{ maxHeight: '60vh' }}>
              {CAT_ORDER.map((cat) => {
                const items = filteredPrograms.filter((p) => p.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-atlas-muted mb-1.5 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_CONFIG[cat].color }} />
                      {CAT_CONFIG[cat].label}
                    </div>
                    {items.map((prog) => {
                      const hasBalance = programs[prog.name]?.balance > 0;
                      return (
                        <button
                          key={prog.name}
                          onClick={() => selectProgram(prog.name)}
                          className="w-full flex items-center justify-between px-3 py-3.5 rounded-2xl hover:bg-atlas-bg transition-colors text-left"
                        >
                          <div>
                            <div className="text-sm font-semibold text-atlas-text">{prog.name}</div>
                            <div className="text-xs text-atlas-muted">{prog.cpp}¢ per point</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasBalance && <span className="text-xs font-semibold text-atlas-success">{fmtCommas(programs[prog.name].balance)} pts</span>}
                            <ChevronRight size={16} className="text-atlas-border" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 pb-8 pt-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-atlas-text">{editName}</h2>
                {editProgramDef && <div className="text-xs text-atlas-muted">{editProgramDef.cpp}¢ per point · {CAT_CONFIG[editProgramDef.category]?.label}</div>}
              </div>
              <button onClick={() => setSheetMode('pick')} className="text-sm text-atlas-muted hover:text-atlas-text font-medium">Change</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="stat-label block mb-2">Point Balance</label>
                <input
                  ref={balanceRef}
                  type="text"
                  inputMode="numeric"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full text-3xl font-extrabold !py-4 text-center"
                />
                {parseBal(editBalance) > 0 && editProgramDef && (
                  <div className="text-center mt-2 text-sm font-semibold text-atlas-success">
                    ≈ {formatCurrency(editCashValue)}
                  </div>
                )}
              </div>

              <div>
                <label className="stat-label block mb-2">Expiration Date (optional)</label>
                <input type="date" value={editExpiration} onChange={(e) => setEditExpiration(e.target.value)} className="w-full !py-3.5" />
              </div>

              <button onClick={handleSave} disabled={parseBal(editBalance) <= 0} className="btn-primary w-full !py-4 text-base mt-2">
                Save
              </button>

              {programs[editName]?.balance > 0 && (
                <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-3 text-atlas-danger text-sm font-semibold hover:bg-red-50 rounded-2xl transition-colors">
                  <Trash2 size={16} /> Remove Program
                </button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

// Card component for active programs
function PortfolioCard({ prog, onTap, onToggleFav }) {
  const cashValue = (prog.balance * prog.cpp) / 100;
  const daysLeft = prog.expiration_date ? daysUntil(prog.expiration_date) : null;
  const expiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 60;
  const catColor = CAT_CONFIG[prog.category]?.color || '#999';

  return (
    <button
      onClick={() => onTap(prog.name)}
      className="bg-white rounded-card p-4 shadow-sm border-l-4 text-left w-full hover:shadow-md transition-shadow"
      style={{ borderLeftColor: catColor }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-atlas-text text-sm truncate">{prog.name}</div>
          <div className="text-xs text-atlas-muted">{prog.cpp}¢/pt</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {expiring && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${daysLeft <= 30 ? 'bg-red-50 text-atlas-danger' : 'bg-yellow-50 text-yellow-700'}`}>{daysLeft}d</span>
          )}
          <div
            onClick={(e) => { e.stopPropagation(); onToggleFav(prog.name); }}
            className="p-1 rounded-lg hover:bg-atlas-bg"
          >
            <Star size={14} fill={prog.favorite ? '#e6a817' : 'none'} stroke={prog.favorite ? '#e6a817' : '#ccc'} strokeWidth={2} />
          </div>
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-xl font-extrabold text-atlas-text">{fmtCommas(prog.balance)}</div>
        <div className="text-sm font-semibold text-atlas-success">≈ {formatCurrency(cashValue)}</div>
      </div>
    </button>
  );
}
