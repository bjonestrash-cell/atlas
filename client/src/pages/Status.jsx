import { useEffect, useState, useCallback } from 'react';
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
  'Southwest Airlines': 'None', 'JetBlue': 'None',
};

const PROGRAMS = {
  airline: [
    'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
    'Alaska Airlines', 'JetBlue', 'British Airways', 'Air France', 'KLM',
    'Lufthansa', 'Singapore Airlines', 'Qantas', 'Cathay Pacific',
    'Japan Airlines', 'Qatar Airways', 'Turkish Airlines', 'Korean Air', 'ANA', 'Emirates',
  ],
  hotel: [
    'Marriott Bonvoy', 'Hilton Honors', 'World of Hyatt', 'IHG One Rewards',
    'Wyndham Rewards', 'Choice Privileges', 'Best Western Rewards', 'Radisson Rewards',
  ],
  rental_car: [
    'Avis Preferred', 'Enterprise Plus', 'Hertz Gold Plus', 'National Emerald Club',
    'Budget Fastbreak', 'Sixt Loyalty', 'Dollar Express', 'Alamo Insiders',
  ],
};

const CAT_CONFIG = {
  airline: { label: 'Airlines', color: '#8bc34a' },
  hotel: { label: 'Hotels', color: '#999999' },
  rental_car: { label: 'Rental Cars', color: '#e6a817' },
};
const CAT_ORDER = ['airline', 'hotel', 'rental_car'];

export default function Status() {
  const [statuses, setStatuses] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    api.getStatus().then((saved) => {
      const m = {};
      saved.forEach((s) => {
        m[s.program_name] = { status_level: s.status_level || '', expiration_date: s.expiration_date || '', notes: s.notes || '', alliance: s.alliance || '' };
      });
      setStatuses(m);
    });
  }, []);

  const getStatus = (name) => statuses[name] || { status_level: '', expiration_date: '', notes: '', alliance: '' };

  const updateField = (name, field, value) => {
    setStatuses((prev) => ({
      ...prev,
      [name]: { ...getStatus(name), [field]: value },
    }));
  };

  const saveStatus = useCallback(async (name, category) => {
    const s = statuses[name] || {};
    const alliance = AIRLINE_ALLIANCE[name] || '';
    try {
      await api.saveStatus({
        program_name: name,
        category,
        status_level: s.status_level || '',
        alliance,
        expiration_date: s.expiration_date || '',
        notes: s.notes || '',
      });
      setLastSaved(new Date().toISOString());
    } catch (e) { console.error('Save failed:', e); }
  }, [statuses]);

  const hasAnyStatus = (name) => {
    const s = getStatus(name);
    return s.status_level || s.expiration_date || s.notes;
  };

  const activeCount = Object.keys(statuses).filter((k) => statuses[k]?.status_level).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-atlas-text">Loyalty Status</h1>
        <p className="text-sm text-atlas-muted mt-1">
          Track your elite status across airlines, hotels, and rental car programs
          {lastSaved && <span className="ml-2">· Last saved {new Date(lastSaved).toLocaleTimeString()}</span>}
        </p>
      </div>

      {activeCount > 0 && (
        <div className="card">
          <div className="text-center">
            <div className="stat-label mb-1">Active Statuses</div>
            <div className="text-4xl font-extrabold text-atlas-text">{activeCount}</div>
            <div className="text-sm text-atlas-muted mt-1">across {CAT_ORDER.length} categories</div>
          </div>
        </div>
      )}

      {CAT_ORDER.map((cat) => {
        const programs = PROGRAMS[cat];
        const config = CAT_CONFIG[cat];

        return (
          <div key={cat}>
            <h2 className="text-lg font-bold text-atlas-text mb-4">{config.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((name) => {
                const s = getStatus(name);
                const alliance = AIRLINE_ALLIANCE[name] || '';
                const daysLeft = s.expiration_date ? daysUntil(s.expiration_date) : null;
                const expiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;

                return (
                  <div key={name} className="bg-white rounded-card p-5 shadow-sm border-l-4" style={{ borderLeftColor: config.color }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-atlas-text text-sm">{name}</div>
                        {cat === 'airline' && alliance && alliance !== 'None' && (
                          <span className="text-xs bg-atlas-bg px-2 py-0.5 rounded-pill text-atlas-sub mt-1 inline-block">{alliance}</span>
                        )}
                      </div>
                      {expiring && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${daysLeft <= 30 ? 'bg-red-50 text-atlas-danger' : 'bg-yellow-50 text-yellow-700'}`}>
                          {daysLeft}d left
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={s.status_level}
                        onChange={(e) => updateField(name, 'status_level', e.target.value)}
                        onBlur={() => saveStatus(name, cat)}
                        placeholder="Status level (e.g. Gold, Platinum)"
                        className="w-full text-sm !py-2"
                      />
                      <input
                        type="date"
                        value={s.expiration_date}
                        onChange={(e) => updateField(name, 'expiration_date', e.target.value)}
                        onBlur={() => saveStatus(name, cat)}
                        className="w-full text-xs !py-2 text-atlas-muted"
                        title="Status expiration date"
                      />
                      <input
                        type="text"
                        value={s.notes}
                        onChange={(e) => updateField(name, 'notes', e.target.value)}
                        onBlur={() => saveStatus(name, cat)}
                        placeholder="Notes..."
                        className="w-full text-xs !py-2 text-atlas-muted"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
