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
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { trips, fetchTrips } = useTripStore();
  const { programs, fetchPrograms } = usePointsStore();

  useEffect(() => {
    fetchTrips();
    fetchPrograms();
  }, []);

  const totalPoints = useMemo(() => programs.reduce((s, p) => s + p.balance, 0), [programs]);
  const totalValue = useMemo(() => programs.reduce((s, p) => s + (p.balance * p.cpp) / 100, 0), [programs]);

  const upcomingTrips = useMemo(() => {
    const now = new Date();
    return trips
      .filter((t) => t.status !== 'completed' && parseISO(t.start_date) > now)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [trips]);

  const nextTrip = upcomingTrips[0];
  const nextDays = nextTrip ? daysUntil(nextTrip.start_date) : null;

  const tripsByMonth = useMemo(() => {
    const map = {};
    for (const m of MONTHS) map[m] = [];
    for (const t of trips) {
      const m = t.start_date.slice(0, 7);
      if (map[m]) map[m].push(t);
    }
    return map;
  }, [trips]);

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <div className="pt-4">
        <h1 className="font-display text-4xl md:text-5xl font-light text-atlas-text" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {getGreeting()}, Ben
        </h1>
        <p className="text-[11px] tracking-[0.2em] uppercase text-atlas-soft mt-3 font-light">{YEAR} Travel Journal</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Trips" value={trips.length} sub={`${upcomingTrips.length} upcoming`} />
        <StatCard label="Total Points" value={formatPoints(totalPoints)} accent />
        <StatCard label="Portfolio Value" value={formatCurrency(totalValue)} />
        <StatCard
          label="Next Trip"
          value={nextTrip ? `${nextDays}d` : '—'}
          sub={nextTrip ? nextTrip.destination : 'No upcoming trips'}
        />
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Annual Calendar */}
      <div>
        <h2 className="font-display text-2xl font-light text-atlas-text mb-6">Annual Calendar</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MONTHS.map((m, i) => {
            const monthTrips = tripsByMonth[m] || [];
            const isCurrentMonth = m === format(new Date(), 'yyyy-MM');
            return (
              <div
                key={m}
                className={`p-3 transition-colors border ${
                  isCurrentMonth ? 'border-atlas-accent bg-atlas-surface' : 'border-transparent bg-atlas-surface/50'
                }`}
                style={{ borderRadius: '2px' }}
              >
                <div className="text-[10px] tracking-[0.2em] uppercase text-atlas-soft mb-2 font-light">{MONTH_LABELS[i]}</div>
                {monthTrips.length === 0 ? (
                  <div className="text-xs text-atlas-soft/40 font-light">No trips</div>
                ) : (
                  <div className="space-y-1.5">
                    {monthTrips.map((t) => (
                      <div key={t.id} className="text-xs border-l-2 border-atlas-accent pl-2">
                        <div className="font-normal text-atlas-text">{t.destination.split(',')[0]}</div>
                        <div className="text-atlas-muted text-[10px] font-light">
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

      {/* Divider */}
      <div className="divider" />

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-light text-atlas-text">Upcoming Trips</h2>
          <Link to="/trips" className="text-[11px] tracking-[0.15em] uppercase text-atlas-soft hover:text-atlas-accent transition-colors font-light">View all</Link>
        </div>
        {upcomingTrips.length === 0 ? (
          <p className="text-atlas-muted text-sm font-light">No upcoming trips planned.</p>
        ) : (
          <div className="space-y-3">
            {upcomingTrips.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-5 border-b border-atlas-border/50">
                <div>
                  <div className="font-display text-lg font-normal text-atlas-text">{t.destination}</div>
                  <div className="text-xs text-atlas-muted mt-1 font-light tracking-wide">
                    {formatDateShort(t.start_date)} – {formatDateShort(t.end_date)} · {t.airline || 'No airline'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-atlas-soft border border-atlas-border px-3 py-1">{t.status}</span>
                  <span className="font-display text-3xl font-light text-atlas-text">{daysUntil(t.start_date)}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
