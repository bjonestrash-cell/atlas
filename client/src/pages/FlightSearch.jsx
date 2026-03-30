import { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '../utils/api';
import { formatCurrency, formatPoints } from '../utils/format';
import AirportAutocomplete from '../components/AirportAutocomplete';

const CABIN_CLASSES = [
  { value: '1', label: 'Economy' },
  { value: '2', label: 'Premium' },
  { value: '3', label: 'Business' },
  { value: '4', label: 'First' },
];

const TIME_RANGES = [
  { key: 'morning', label: 'Morning', range: [5, 12] },
  { key: 'afternoon', label: 'Afternoon', range: [12, 17] },
  { key: 'evening', label: 'Evening', range: [17, 21] },
  { key: 'redeye', label: 'Red-eye', range: [21, 5] },
];

function getHour(timeStr) {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d{2}):(\d{2})/);
  return match ? parseInt(match[1]) : -1;
}

function inTimeRange(hour, range) {
  if (range[0] < range[1]) return hour >= range[0] && hour < range[1];
  return hour >= range[0] || hour < range[1]; // wraps midnight
}

export default function FlightSearch() {
  const [searchParams] = useSearchParams();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [cabinClass, setCabinClass] = useState('1');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);
  const returnRef = useRef(null);

  // Filters
  const [nonstopOnly, setNonstopOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [airlineFilter, setAirlineFilter] = useState({});
  const [timeFilter, setTimeFilter] = useState('');
  const [sortBy, setSortBy] = useState('price');

  // Points mode
  const [mode, setMode] = useState('cash');
  const [pointsPrograms, setPointsPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');

  // Load points programs for points mode
  useEffect(() => {
    api.getPoints().then((progs) => {
      setPointsPrograms(progs.filter((p) => p.balance > 0));
    });
    // Check if pre-selected from Points page
    const preselect = searchParams.get('program');
    if (preselect) {
      setMode('points');
      setSelectedProgram(preselect);
    }
  }, []);

  const selectedProgramData = pointsPrograms.find((p) => p.program_name === selectedProgram);

  const formatDateParam = (d) => {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !departDate) return;
    setLoading(true);
    setError('');
    setResults([]);
    setAirlineFilter({});
    try {
      const params = { origin, destination, outbound_date: formatDateParam(departDate), travel_class: cabinClass };
      if (returnDate) params.return_date = formatDateParam(returnDate);
      const data = await api.searchFlights(params);
      setResults(data);
      if (data.length === 0) setError('No flights found for this route and date.');
      // Init airline filter with all airlines checked
      const airlines = {};
      data.forEach((f) => { if (f.airline) airlines[f.airline] = true; });
      setAirlineFilter(airlines);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartDateChange = (date) => {
    setDepartDate(date);
    if (returnDate && date && returnDate < date) setReturnDate(null);
    if (date) setTimeout(() => returnRef.current?.setOpen(true), 200);
  };

  // Filtered + sorted results
  const filteredResults = useMemo(() => {
    let filtered = results.filter((f) => {
      if (nonstopOnly && f.stops > 0) return false;
      if (maxPrice && f.price && f.price > parseFloat(maxPrice)) return false;
      if (f.airline && airlineFilter[f.airline] === false) return false;
      if (timeFilter) {
        const tr = TIME_RANGES.find((t) => t.key === timeFilter);
        if (tr) {
          const hour = getHour(f.departure);
          if (hour >= 0 && !inTimeRange(hour, tr.range)) return false;
        }
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'price') return (a.price || 9999) - (b.price || 9999);
      if (sortBy === 'duration') return (a.durationMinutes || 9999) - (b.durationMinutes || 9999);
      if (sortBy === 'departure') return (a.departure || '').localeCompare(b.departure || '');
      return 0;
    });

    return filtered;
  }, [results, nonstopOnly, maxPrice, airlineFilter, timeFilter, sortBy]);

  const uniqueAirlines = useMemo(() => {
    return [...new Set(results.map((f) => f.airline).filter(Boolean))];
  }, [results]);

  const toggleAirline = (airline) => {
    setAirlineFilter((f) => ({ ...f, [airline]: !f[airline] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl tracking-wider text-atlas-text">FLIGHT SEARCH</h1>
        {/* Cash / Points toggle */}
        <div className="flex rounded-lg overflow-hidden border border-atlas-border">
          <button
            type="button"
            onClick={() => setMode('cash')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${mode === 'cash' ? 'bg-atlas-accent text-white' : 'bg-atlas-surface text-atlas-sub'}`}
          >Cash</button>
          <button
            type="button"
            onClick={() => setMode('points')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${mode === 'points' ? 'bg-atlas-accent text-white' : 'bg-atlas-surface text-atlas-sub'}`}
          >Points</button>
        </div>
      </div>

      {/* Points program selector */}
      {mode === 'points' && (
        <div className="card !py-3">
          <div className="flex items-center gap-3">
            <label className="font-heading font-semibold text-xs uppercase tracking-wider text-atlas-muted whitespace-nowrap">Pay with</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="flex-1 text-sm"
            >
              <option value="">Select a program...</option>
              {pointsPrograms.map((p) => (
                <option key={p.program_name} value={p.program_name}>
                  {p.program_name} — {formatPoints(p.balance)} pts ({p.cpp}¢/pt)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="card">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <AirportAutocomplete value={origin} onChange={setOrigin} placeholder="City or airport code" label="Origin *" />
          <AirportAutocomplete value={destination} onChange={setDestination} placeholder="City or airport code" label="Destination *" />
          <div>
            <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Departure *</label>
            <DatePicker selected={departDate} onChange={handleDepartDateChange} minDate={new Date()} placeholderText="Select date" dateFormat="MMM d, yyyy" className="w-full" calendarClassName="atlas-calendar" popperPlacement="bottom-start" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">
              Return {returnDate && <button type="button" onClick={() => setReturnDate(null)} className="ml-1 text-atlas-danger font-normal normal-case tracking-normal hover:underline">clear</button>}
            </label>
            <DatePicker ref={returnRef} selected={returnDate} onChange={setReturnDate} minDate={departDate || new Date()} openToDate={departDate || new Date()} placeholderText={departDate ? 'Select return' : 'Pick departure first'} dateFormat="MMM d, yyyy" className="w-full" calendarClassName="atlas-calendar" popperPlacement="bottom-start" disabled={!departDate} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Cabin</label>
            <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="w-full">
              {CABIN_CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading || !origin || !destination || !departDate} className="btn-primary mt-4">
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      {error && (
        <div className="card border-atlas-danger/30 bg-atlas-danger/5">
          <p className="text-atlas-danger text-sm">{error}</p>
        </div>
      )}

      {/* Filter bar */}
      {results.length > 0 && (
        <div className="card !py-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-atlas-sub cursor-pointer">
            <input type="checkbox" checked={nonstopOnly} onChange={(e) => setNonstopOnly(e.target.checked)} className="!w-4 !h-4 !p-0 rounded" />
            Nonstop only
          </label>
          <div className="h-4 w-px bg-atlas-border" />
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="text-xs !py-1">
            <option value="">Any time</option>
            {TIME_RANGES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className="text-xs !py-1 w-24" />
          <div className="h-4 w-px bg-atlas-border" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs !py-1">
            <option value="price">Sort: Price</option>
            <option value="duration">Sort: Duration</option>
            <option value="departure">Sort: Departure</option>
          </select>
          <div className="h-4 w-px bg-atlas-border" />
          {uniqueAirlines.map((al) => (
            <label key={al} className="flex items-center gap-1 text-xs text-atlas-sub cursor-pointer">
              <input type="checkbox" checked={airlineFilter[al] !== false} onChange={() => toggleAirline(al)} className="!w-3.5 !h-3.5 !p-0 rounded" />
              {al}
            </label>
          ))}
          <span className="text-xs text-atlas-muted ml-auto">{filteredResults.length} of {results.length}</span>
        </div>
      )}

      {/* Results */}
      {filteredResults.length > 0 && (
        <div className="space-y-3">
          {filteredResults.map((flight) => {
            const pointsNeeded = mode === 'points' && selectedProgramData && flight.price
              ? Math.round((flight.price / selectedProgramData.cpp) * 100)
              : null;
            const isGoodDeal = pointsNeeded && selectedProgramData
              ? (flight.price / pointsNeeded * 100) >= selectedProgramData.cpp
              : null;

            return (
              <div key={flight.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-5 flex-1">
                  <div className="text-center min-w-[80px]">
                    <div className="font-heading font-semibold text-sm text-atlas-accent uppercase tracking-wide">{flight.airline}</div>
                    {flight.flightNumber && <div className="text-xs text-atlas-muted">{flight.flightNumber}</div>}
                    <div className="text-xs text-atlas-sub mt-0.5">
                      {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-atlas-text font-medium">
                      {flight.departure || '—'} → {flight.arrival || '—'}
                    </div>
                    <div className="text-xs text-atlas-muted">
                      {flight.departureAirport} → {flight.arrivalAirport}
                      {flight.duration && <span className="ml-2">· {flight.duration}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {mode === 'points' && pointsNeeded ? (
                    <>
                      <div className="font-display text-2xl text-atlas-success">{formatPoints(pointsNeeded)} pts</div>
                      <div className="text-xs text-atlas-muted">{formatCurrency(flight.price)} cash</div>
                      {isGoodDeal !== null && (
                        <span className={`text-xs font-semibold ${isGoodDeal ? 'text-atlas-success' : 'text-atlas-danger'}`}>
                          {isGoodDeal ? 'Good deal' : 'Poor deal'}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {flight.price ? (
                        <div className="font-display text-3xl text-atlas-gold">{formatCurrency(flight.price)}</div>
                      ) : (
                        <div className="text-sm text-atlas-muted">Price N/A</div>
                      )}
                      <button
                        onClick={() => setSaved(flight.id)}
                        className={`text-xs mt-1 ${saved === flight.id ? 'text-atlas-success font-semibold' : 'text-atlas-blue hover:underline'}`}
                      >
                        {saved === flight.id ? 'Saved!' : 'Save to trip'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-16 text-atlas-muted">
          <div className="text-4xl mb-3 opacity-30">&#9992;</div>
          <p>Enter a route and date to search for flights.</p>
          <p className="text-xs mt-1 opacity-60">Powered by SerpApi Google Flights</p>
        </div>
      )}
    </div>
  );
}
