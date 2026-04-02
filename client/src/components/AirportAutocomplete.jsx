import { useState, useRef, useEffect } from 'react';
import airports from '../utils/airports.json';

function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
}

function searchAirports(query) {
  if (!query || query.length < 1) return [];
  const q = query.trim();
  const scored = airports.map((a) => {
    const iataScore = a.iata.toLowerCase() === q.toLowerCase() ? 10 :
                      a.iata.toLowerCase().startsWith(q.toLowerCase()) ? 6 : 0;
    const cityScore = fuzzyMatch(q, a.city);
    const nameScore = fuzzyMatch(q, a.name);
    const score = Math.max(iataScore, cityScore * 1.5, nameScore);
    return { ...a, score };
  }).filter((a) => a.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8);
}

function displayLabel(iata) {
  if (!iata) return '';
  const a = airports.find((ap) => ap.iata === iata);
  return a ? `${a.city} (${a.iata})` : iata;
}

export default function AirportAutocomplete({ value, onChange, placeholder, label }) {
  const [query, setQuery] = useState(() => displayLabel(value));
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedIata, setSelectedIata] = useState(value || '');
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (value !== selectedIata) {
      setSelectedIata(value || '');
      setQuery(displayLabel(value));
    }
  }, [value]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIata('');
    onChange('');
    const matches = searchAirports(val);
    setResults(matches);
    setOpen(matches.length > 0);
    setActiveIndex(-1);
  };

  const selectAirport = (airport) => {
    const label = `${airport.city} (${airport.iata})`;
    setQuery(label);
    setSelectedIata(airport.iata);
    onChange(airport.iata);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectAirport(results[activeIndex]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const handleBlur = () => { setTimeout(() => setOpen(false), 150); };
  const handleFocus = () => {
    if (selectedIata) inputRef.current?.select();
    if (query && !selectedIata) { const m = searchAirports(query); setResults(m); setOpen(m.length > 0); }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current?.children?.[activeIndex]) {
      listRef.current.children[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      {label && <label className="stat-label block mb-2">{label}</label>}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-40 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto"
          style={{ background: 'var(--cream)', border: '1px solid var(--stone)', boxShadow: '0 16px 48px rgba(28,26,23,0.06)' }}
        >
          {results.map((airport, i) => (
            <div
              key={airport.iata}
              onMouseDown={() => selectAirport(airport)}
              className="cursor-pointer flex items-center justify-between transition-colors"
              style={{
                padding: '10px 16px',
                background: i === activeIndex ? 'var(--sand)' : 'transparent',
                borderTop: i > 0 ? '1px solid var(--sand)' : 'none',
              }}
              onMouseEnter={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'var(--mist)'; }}
              onMouseLeave={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'transparent'; }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 300, color: 'var(--ink)' }}>{airport.city}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 300, color: 'var(--slate)' }}> — {airport.name}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 400, letterSpacing: '0.15em', color: 'var(--bronze)' }}>{airport.iata}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
