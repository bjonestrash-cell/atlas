import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { usePointsStore } from '../store/pointsStore';
import StatCard from '../components/StatCard';
import { formatCurrency, formatPoints, formatDateShort, daysUntil, STATUS_COLORS, getMonthsOfYear } from '../utils/format';
import { format, parseISO } from 'date-fns';

const YEAR = new Date().getFullYear();
const MONTHS = getMonthsOfYear(YEAR);
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return ['Good morning', 'morning'];
  if (h < 17) return ['Good afternoon', 'afternoon'];
  return ['Good evening', 'evening'];
}

export default function Dashboard() {
  const { trips, fetchTrips } = useTripStore();
  const { programs, fetchPrograms } = usePointsStore();

  useEffect(() => { fetchTrips(); fetchPrograms(); }, []);

  const totalPoints = useMemo(() => programs.reduce((s, p) => s + p.balance, 0), [programs]);
  const totalValue = useMemo(() => programs.reduce((s, p) => s + (p.balance * p.cpp) / 100, 0), [programs]);

  const upcomingTrips = useMemo(() => {
    const now = new Date();
    return trips.filter((t) => t.status !== 'completed' && parseISO(t.start_date) > now)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [trips]);

  const nextTrip = upcomingTrips[0];
  const nextDays = nextTrip ? daysUntil(nextTrip.start_date) : null;

  const tripsByMonth = useMemo(() => {
    const map = {};
    for (const m of MONTHS) map[m] = [];
    for (const t of trips) { const m = t.start_date.slice(0, 7); if (map[m]) map[m].push(t); }
    return map;
  }, [trips]);

  const [greetFull, greetWord] = getGreeting();

  return (
    <div>
      {/* Greeting */}
      <div className="mb-16">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 300, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.1 }}>
          Good <em>{greetWord}</em>, Ben
        </h1>
        <p className="mt-2" style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 400, letterSpacing: '0.35em', color: 'var(--bronze)', textTransform: 'uppercase' }}>
          {YEAR} Travel Journal
        </p>
      </div>

      {/* Stats row — borderless, separated by vertical rules */}
      <div style={{ borderTop: '1px solid var(--stone)', borderBottom: '1px solid var(--stone)', padding: '48px 0' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard label="Total Trips" value={trips.length} sub={`${upcomingTrips.length} upcoming`} />
          <div className="hidden md:block" style={{ borderLeft: '1px solid var(--stone)', paddingLeft: 48 }}>
            <StatCard label="Total Points" value={formatPoints(totalPoints)} accent />
          </div>
          <div className="md:hidden"><StatCard label="Total Points" value={formatPoints(totalPoints)} accent /></div>
          <div className="hidden md:block" style={{ borderLeft: '1px solid var(--stone)', paddingLeft: 48 }}>
            <StatCard label="Portfolio Value" value={formatCurrency(totalValue)} />
          </div>
          <div className="md:hidden"><StatCard label="Portfolio Value" value={formatCurrency(totalValue)} /></div>
          <div className="hidden md:block" style={{ borderLeft: '1px solid var(--stone)', paddingLeft: 48 }}>
            <StatCard label="Next Trip" value={nextTrip ? `${nextDays}d` : '—'} sub={nextTrip ? nextTrip.destination : 'No upcoming trips'} />
          </div>
          <div className="md:hidden"><StatCard label="Next Trip" value={nextTrip ? `${nextDays}d` : '—'} sub={nextTrip ? nextTrip.destination : 'No upcoming trips'} /></div>
        </div>
      </div>

      {/* Annual Calendar */}
      <div className="mt-16">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)', marginBottom: 32 }}>
          Annual Calendar
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
          {MONTHS.map((m, i) => {
            const monthTrips = tripsByMonth[m] || [];
            const isCurrent = m === format(new Date(), 'yyyy-MM');
            return (
              <div
                key={m}
                className="transition-colors"
                style={{
                  border: '1px solid var(--stone)', borderRight: 'none', padding: '20px 24px',
                  borderColor: isCurrent ? 'var(--bronze)' : 'var(--stone)',
                  ...(i % (window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 3) === (window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2) ? { borderRight: '1px solid var(--stone)' } : {}),
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isCurrent ? 'var(--bronze)' : 'var(--stone)'; }}
              >
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 400, letterSpacing: '0.25em', color: isCurrent ? 'var(--bronze)' : 'var(--ink)', textTransform: 'uppercase', marginBottom: 8 }}>
                  {MONTH_LABELS[i]}
                </div>
                {monthTrips.length === 0 ? (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 300, color: 'var(--stone)' }}>No trips</div>
                ) : (
                  <div className="space-y-1.5">
                    {monthTrips.map((t) => (
                      <div key={t.id} style={{ borderLeft: '1px solid var(--bronze)', paddingLeft: 8 }}>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 400, color: 'var(--ink)' }}>{t.destination.split(',')[0]}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 300, color: 'var(--slate)' }}>
                          {formatDateShort(t.start_date)}–{formatDateShort(t.end_date)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mt-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--ink)' }}>Upcoming Trips</h2>
          <Link to="/trips" style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none', fontWeight: 400 }}>
            View All
          </Link>
        </div>
        {upcomingTrips.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 300, color: 'var(--slate)', fontStyle: 'italic' }}>No journeys recorded.</p>
        ) : (
          <div>
            {upcomingTrips.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between" style={{ padding: '24px 0', borderBottom: '1px solid var(--sand)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--ink)' }}>{t.destination}</div>
                  <div className="mt-1" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 300, color: 'var(--slate)' }}>
                    {formatDateShort(t.start_date)} – {formatDateShort(t.end_date)} · {t.airline || 'No airline'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--slate)', border: '1px solid var(--stone)', padding: '3px 10px' }}>
                    {t.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'var(--ink)' }}>{daysUntil(t.start_date)}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
