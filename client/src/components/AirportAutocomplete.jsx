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

  // Sync if parent resets value externally
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

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectAirport(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150);
  };

  const handleFocus = () => {
    // Select all text on focus so user can type over
    if (selectedIata) {
      inputRef.current?.select();
    }
    if (query && !selectedIata) {
      const matches = searchAirports(query);
      setResults(matches);
      setOpen(matches.length > 0);
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}
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
          className="absolute z-40 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-atlas-border"
          style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        >
          {results.map((airport, i) => (
            <div
              key={airport.iata}
              onMouseDown={() => selectAirport(airport)}
              className={`px-3 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                i === activeIndex ? 'bg-atlas-accent/10' : 'hover:bg-atlas-tertiary'
              } ${i > 0 ? 'border-t border-atlas-border/50' : ''}`}
            >
              <div>
                <span className="text-sm font-medium text-atlas-text">{airport.city}</span>
                <span className="text-sm text-atlas-muted"> — {airport.name}</span>
              </div>
              <span className="text-xs font-semibold text-atlas-accent ml-2 shrink-0">{airport.iata}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
