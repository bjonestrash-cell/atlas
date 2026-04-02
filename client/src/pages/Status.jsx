import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Plus, Search, X, Trash2, ChevronRight, Award, Plane, Building2, Car } from 'lucide-react';
import { api } from '../utils/api';
import { daysUntil } from '../utils/format';

const AIRLINE_ALLIANCE = {
  'American Airlines': 'Oneworld', 'British Airways': 'Oneworld', 'Qantas': 'Oneworld',
  'Cathay Pacific': 'Oneworld', 'Japan Airlines': 'Oneworld', 'Qatar Airways': 'Oneworld',
  'Iberia': 'Oneworld', 'Finnair': 'Oneworld', 'Alaska Airlines': 'Oneworld',
  'United Airlines': 'Star Alliance', 'Lufthansa': 'Star Alliance', 'ANA': 'Star Alliance',
  'Singapore Airlines': 'Star Alliance', 'Air Canada': 'Star Alliance', 'Swiss': 'Star Alliance',
  'Turkish Airlines': 'Star Alliance', 'Ethiopian Airlines': 'Star Alliance', 'EVA Air': 'Star Alliance',
  'Delta Air Lines': 'SkyTeam', 'Air France': 'SkyTeam', 'KLM': 'SkyTeam',
  'Korean Air': 'SkyTeam', 'Aeromexico': 'SkyTeam', 'Vietnam Airlines': 'SkyTeam',
  'Garuda Indonesia': 'SkyTeam', 'China Airlines': 'SkyTeam',
  'Southwest Airlines': 'None', 'JetBlue': 'None', 'Emirates': 'None',
};

const STATUS_TIERS = {
  'American Airlines': ['Gold', 'Platinum', 'Platinum Pro', 'Executive Platinum', 'Concierge Key'],
  'Delta Air Lines': ['Silver Medallion', 'Gold Medallion', 'Platinum Medallion', 'Diamond Medallion'],
  'United Airlines': ['Silver', 'Gold', 'Platinum', '1K', 'Global Services'],
  'Southwest Airlines': ['A-List', 'A-List Preferred', 'Companion Pass'],
  'Alaska Airlines': ['MVP', 'MVP Gold', 'MVP Gold 75K', 'MVP Gold 100K'],
  'JetBlue': ['Mosaic', 'Mosaic+'],
  'British Airways': ['Bronze', 'Silver', 'Gold', 'Gold Guest List'],
  'Air France': ['Silver', 'Gold', 'Platinum', 'Ultimate'],
  'KLM': ['Silver', 'Gold', 'Platinum'],
  'Lufthansa': ['Frequent Traveller', 'Senator', 'HON Circle'],
  'Singapore Airlines': ['KrisFlyer Elite Silver', 'KrisFlyer Elite Gold', 'PPS Club'],
  'Qantas': ['Silver', 'Gold', 'Platinum', 'Platinum One', 'Chairman\'s Lounge'],
  'Cathay Pacific': ['Green', 'Silver', 'Gold', 'Diamond'],
  'Japan Airlines': ['Crystal', 'Sapphire', 'JGC Premier', 'Diamond', 'JGC Five Star'],
  'Qatar Airways': ['Silver', 'Gold', 'Platinum'],
  'Turkish Airlines': ['Classic Plus', 'Elite', 'Elite Plus'],
  'Korean Air': ['Morning Calm', 'Morning Calm Premium', 'Million Miler'],
  'ANA': ['Bronze', 'Platinum', 'Diamond', 'Super Flyers'],
  'Emirates': ['Silver', 'Gold', 'Platinum'],
  'Marriott Bonvoy': ['Member', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Titanium Elite', 'Ambassador Elite'],
  'Hilton Honors': ['Member', 'Silver', 'Gold', 'Diamond'],
  'World of Hyatt': ['Member', 'Discoverist', 'Explorist', 'Globalist'],
  'IHG One Rewards': ['Club', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Diamond Elite'],
  'Wyndham Rewards': ['Blue', 'Gold', 'Platinum', 'Diamond'],
  'Choice Privileges': ['Member', 'Gold', 'Platinum', 'Diamond'],
  'Best Western Rewards': ['Blue', 'Gold', 'Platinum', 'Diamond', 'Diamond Select'],
  'Radisson Rewards': ['Club', 'Silver', 'Gold', 'Platinum'],
  'Avis Preferred': ['Preferred', 'Preferred Plus', 'President\'s Club'],
  'Enterprise Plus': ['Silver', 'Gold', 'Platinum'],
  'Hertz Gold Plus': ['Gold', 'Five Star', 'President\'s Circle'],
  'National Emerald Club': ['Emerald Club', 'Emerald Club Executive', 'Emerald Club Executive Elite'],
  'Budget Fastbreak': ['Fastbreak'],
  'Sixt Loyalty': ['Gold', 'Platinum', 'Diamond'],
  'Dollar Express': ['Express'],
  'Alamo Insiders': ['Insider'],
};

const ALL_PROGRAMS = [
  { name: 'American Airlines', category: 'airline' },
  { name: 'Delta Air Lines', category: 'airline' },
  { name: 'United Airlines', category: 'airline' },
  { name: 'Southwest Airlines', category: 'airline' },
  { name: 'Alaska Airlines', category: 'airline' },
  { name: 'JetBlue', category: 'airline' },
  { name: 'British Airways', category: 'airline' },
  { name: 'Air France', category: 'airline' },
  { name: 'KLM', category: 'airline' },
  { name: 'Lufthansa', category: 'airline' },
  { name: 'Singapore Airlines', category: 'airline' },
  { name: 'Qantas', category: 'airline' },
  { name: 'Cathay Pacific', category: 'airline' },
  { name: 'Japan Airlines', category: 'airline' },
  { name: 'Qatar Airways', category: 'airline' },
  { name: 'Turkish Airlines', category: 'airline' },
  { name: 'Korean Air', category: 'airline' },
  { name: 'ANA', category: 'airline' },
  { name: 'Emirates', category: 'airline' },
  { name: 'Marriott Bonvoy', category: 'hotel' },
  { name: 'Hilton Honors', category: 'hotel' },
  { name: 'World of Hyatt', category: 'hotel' },
  { name: 'IHG One Rewards', category: 'hotel' },
  { name: 'Wyndham Rewards', category: 'hotel' },
  { name: 'Choice Privileges', category: 'hotel' },
  { name: 'Best Western Rewards', category: 'hotel' },
  { name: 'Radisson Rewards', category: 'hotel' },
  { name: 'Avis Preferred', category: 'rental_car' },
  { name: 'Enterprise Plus', category: 'rental_car' },
  { name: 'Hertz Gold Plus', category: 'rental_car' },
  { name: 'National Emerald Club', category: 'rental_car' },
  { name: 'Budget Fastbreak', category: 'rental_car' },
  { name: 'Sixt Loyalty', category: 'rental_car' },
  { name: 'Dollar Express', category: 'rental_car' },
  { name: 'Alamo Insiders', category: 'rental_car' },
];

const CAT_CONFIG = {
  airline: { label: 'Airlines', color: '#8C7355', Icon: Plane },
  hotel: { label: 'Hotels', color: '#C4B9A8', Icon: Building2 },
  rental_car: { label: 'Rental Cars', color: '#B39370', Icon: Car },
};
const CAT_ORDER = ['airline', 'hotel', 'rental_car'];

function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0" style={{ background: 'rgba(28,26,23,0.6)' }} onClick={onClose} />
      <div className={`absolute bottom-0 left-0 right-0 max-h-[92vh] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`} style={{ background: 'var(--cream)', borderTop: '1px solid var(--stone)', boxShadow: '0 -16px 48px rgba(28,26,23,0.06)' }}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-px" style={{ background: 'var(--stone)' }} /></div>
        {children}
      </div>
    </div>
  );
}

export default function Status() {
  const [statuses, setStatuses] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  // Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('pick');
  const [searchQuery, setSearchQuery] = useState('');
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editExpiration, setEditExpiration] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    api.getStatus().then((saved) => {
      const m = {};
      saved.forEach((s) => {
        if (s.status_level) {
          m[s.program_name] = { status_level: s.status_level, expiration_date: s.expiration_date || '', notes: s.notes || '', alliance: s.alliance || '', category: s.category || 'airline' };
        }
      });
      setStatuses(m);
    });
  }, []);

  const activeStatuses = useMemo(() => {
    return Object.entries(statuses)
      .filter(([, v]) => v.status_level)
      .map(([name, data]) => {
        const def = ALL_PROGRAMS.find((p) => p.name === name);
        return { name, ...data, category: def?.category || data.category };
      });
  }, [statuses]);

  const totalCount = activeStatuses.length;

  const saveStatus = useCallback(async (name, level, expiration, notes) => {
    const def = ALL_PROGRAMS.find((p) => p.name === name);
    const cat = def?.category || 'airline';
    const alliance = AIRLINE_ALLIANCE[name] || '';
    try {
      await api.saveStatus({ program_name: name, category: cat, status_level: level, alliance, expiration_date: expiration || '', notes: notes || '' });
      setStatuses((prev) => ({ ...prev, [name]: { status_level: level, expiration_date: expiration || '', notes: notes || '', alliance, category: cat } }));
      setLastSaved(new Date().toISOString());
    } catch (e) { console.error('Save failed:', e); }
  }, []);

  const deleteStatus = useCallback(async (name) => {
    try {
      await api.saveStatus({ program_name: name, category: 'airline', status_level: '', alliance: '', expiration_date: '', notes: '' });
      setStatuses((prev) => { const n = { ...prev }; delete n[name]; return n; });
    } catch (e) { console.error('Delete failed:', e); }
  }, []);

  // Sheet controls
  const openAddSheet = () => {
    setSheetMode('pick');
    setSearchQuery('');
    setEditName('');
    setEditLevel('');
    setEditExpiration('');
    setEditNotes('');
    setSheetOpen(true);
  };

  const selectProgram = (name) => {
    const existing = statuses[name];
    setEditName(name);
    setEditLevel(existing?.status_level || '');
    setEditExpiration(existing?.expiration_date || '');
    setEditNotes(existing?.notes || '');
    setSheetMode('edit');
  };

  const openEditSheet = (name) => {
    const data = statuses[name];
    setEditName(name);
    setEditLevel(data?.status_level || '');
    setEditExpiration(data?.expiration_date || '');
    setEditNotes(data?.notes || '');
    setSheetMode('edit');
    setSearchQuery('');
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!editName || !editLevel) return;
    saveStatus(editName, editLevel, editExpiration, editNotes);
    setSheetOpen(false);
  };

  const handleDelete = () => {
    if (!editName) return;
    deleteStatus(editName);
    setSheetOpen(false);
  };

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ALL_PROGRAMS.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const editProgramDef = ALL_PROGRAMS.find((p) => p.name === editName);
  const editTiers = STATUS_TIERS[editName] || [];
  const editAlliance = AIRLINE_ALLIANCE[editName] || '';

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--ink)' }}>Loyalty Status</h1>
        <button onClick={openAddSheet} className="btn-primary flex items-center gap-2">
          <Plus size={14} strokeWidth={1} /> Add Status
        </button>
      </div>

      {/* Hero */}
      <div className="text-center mb-16" style={{ borderTop: '1px solid var(--stone)', borderBottom: '1px solid var(--stone)', padding: '48px 0' }}>
        <div className="stat-label mb-4">Active Statuses</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1 }}>{totalCount}</div>
        <div className="mt-4" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 300, color: 'var(--slate)' }}>
          {totalCount > 0 ? `across ${CAT_ORDER.filter((c) => activeStatuses.some((s) => s.category === c)).length} categories` : 'Add your first loyalty status to get started'}
        </div>
      </div>

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="text-center py-20">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: 'var(--slate)', marginBottom: 24 }}>No statuses recorded.</p>
          <button onClick={openAddSheet} className="btn-primary inline-flex items-center gap-2">
            <Plus size={14} strokeWidth={1} /> Add Your First Status
          </button>
        </div>
      )}

      {/* Cards by category */}
      {CAT_ORDER.map((cat) => {
        const catStatuses = activeStatuses.filter((s) => s.category === cat);
        if (catStatuses.length === 0) return null;
        const config = CAT_CONFIG[cat];
        const CatIcon = config.Icon;
        return (
          <div key={cat}>
            <h2 className="stat-label mb-4 flex items-center gap-2"><CatIcon size={12} strokeWidth={1} /> {config.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catStatuses.map((s) => {
                const daysLeft = s.expiration_date ? daysUntil(s.expiration_date) : null;
                const expiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;
                const alliance = AIRLINE_ALLIANCE[s.name] || '';
                return (
                  <button
                    key={s.name}
                    onClick={() => openEditSheet(s.name)}
                    className="text-left w-full transition-all"
                    style={{ background: 'var(--mist)', border: '1px solid var(--sand)', borderLeft: '1px solid ' + config.color, padding: 24 }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--stone)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(28,26,23,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--sand)'; e.currentTarget.style.borderLeftColor = config.color; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--ink)' }} className="truncate">{s.name}</div>
                        {cat === 'airline' && alliance && alliance !== 'None' && (
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--slate)', border: '1px solid var(--stone)', padding: '2px 8px', display: 'inline-block', marginTop: 4 }}>{alliance}</span>
                        )}
                      </div>
                      {expiring && (
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: daysLeft <= 30 ? '#9B5B4F' : 'var(--slate)', border: '1px solid var(--stone)', padding: '2px 8px' }}>{daysLeft}d</span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--ink)', marginBottom: 4 }}>{s.status_level}</div>
                    {s.expiration_date && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 300, color: 'var(--slate)' }}>Expires {s.expiration_date}</div>}
                    {s.notes && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 300, color: 'var(--slate)', marginTop: 2 }} className="truncate">{s.notes}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {sheetMode === 'pick' ? (
          <div className="flex flex-col overflow-hidden">
            <div className="px-5 pb-3 pt-2">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--ink)', marginBottom: 16 }}>Add Loyalty Status</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-atlas-muted" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search programs..." className="w-full !pl-10 !py-3.5 text-base" autoFocus />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-atlas-muted"><X size={16} /></button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-8" style={{ maxHeight: '60vh' }}>
              {CAT_ORDER.map((cat) => {
                const items = filteredPrograms.filter((p) => p.category === cat);
                if (items.length === 0) return null;
                const config = CAT_CONFIG[cat];
                return (
                  <div key={cat} className="mb-4">
                    <div className="text-xs font-normal uppercase tracking-wider text-atlas-muted mb-1.5 flex items-center gap-2">
                      <div className="w-2 h-2 w-0.5" style={{ backgroundColor: config.color }} />
                      {config.label}
                    </div>
                    {items.map((prog) => {
                      const hasStatus = !!statuses[prog.name]?.status_level;
                      return (
                        <button key={prog.name} onClick={() => selectProgram(prog.name)} className="w-full flex items-center justify-between px-3 py-3.5 transition-colors hover:bg-atlas-bg transition-colors text-left">
                          <div>
                            <div className="text-sm font-normal text-atlas-text">{prog.name}</div>
                            {AIRLINE_ALLIANCE[prog.name] && AIRLINE_ALLIANCE[prog.name] !== 'None' && (
                              <div className="text-xs text-atlas-muted">{AIRLINE_ALLIANCE[prog.name]}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {hasStatus && <span className="text-xs font-normal text-atlas-success">{statuses[prog.name].status_level}</span>}
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
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--ink)' }}>{editName}</h2>
                <div className="text-xs text-atlas-muted">
                  {CAT_CONFIG[editProgramDef?.category]?.label || ''}
                  {editAlliance && editAlliance !== 'None' ? ` · ${editAlliance}` : ''}
                </div>
              </div>
              <button onClick={() => setSheetMode('pick')} className="text-sm text-atlas-muted hover:text-atlas-text font-medium">Change</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="stat-label block mb-2">Status Level</label>
                {editTiers.length > 0 ? (
                  <select value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="w-full !py-3.5 text-base font-normal">
                    <option value="">Select tier...</option>
                    {editTiers.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <input type="text" value={editLevel} onChange={(e) => setEditLevel(e.target.value)} placeholder="e.g. Gold, Platinum" className="w-full !py-3.5 text-base font-normal" />
                )}
              </div>

              <div>
                <label className="stat-label block mb-2">Status Expiration Date</label>
                <input type="date" value={editExpiration} onChange={(e) => setEditExpiration(e.target.value)} className="w-full !py-3.5" />
              </div>

              <div>
                <label className="stat-label block mb-2">Notes (optional)</label>
                <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="e.g. Need 10k more miles to requalify" className="w-full !py-3.5" />
              </div>

              <button onClick={handleSave} disabled={!editLevel} className="btn-primary w-full !py-4 text-base mt-2">Save</button>

              {statuses[editName]?.status_level && (
                <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-3 text-atlas-danger text-sm font-normal hover:bg-red-50 transition-colors transition-colors">
                  <Trash2 size={16} /> Remove Status
                </button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
