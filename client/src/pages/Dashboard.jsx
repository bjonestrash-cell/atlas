import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { usePointsStore } from '../store/pointsStore';
import StatCard from '../components/StatCard';
import { formatCurrency, formatPoints, formatDateShort, daysUntil, STATUS_BG, STATUS_COLORS, getMonthsOfYear } from '../utils/format';
import { format, parseISO } from 'date-fns';

const YEAR = new Date().getFullYear();
const MONTHS = getMonthsOfYear(YEAR);
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-atlas-text">Dashboard</h1>
        <span className="text-sm text-atlas-muted">{YEAR} Travel Journal</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Trips" value={trips.length} sub={`${upcomingTrips.length} upcoming`} />
        <StatCard label="Total Points" value={formatPoints(totalPoints)} accent />
        <StatCard label="Portfolio Value" value={formatCurrency(totalValue)} />
        <StatCard
          label="Next Trip"
          value={nextTrip ? `${nextDays}d` : '—'}
          sub={nextTrip ? nextTrip.destination : 'No upcoming trips'}
        />
      </div>

      {/* Annual Calendar */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-atlas-muted mb-4">Annual Calendar</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MONTHS.map((m, i) => {
            const monthTrips = tripsByMonth[m] || [];
            const isCurrentMonth = m === format(new Date(), 'yyyy-MM');
            return (
              <div
                key={m}
                className={`rounded-lg border p-3 ${
                  isCurrentMonth ? 'border-atlas-accent bg-atlas-accent/5' : 'border-atlas-border bg-atlas-bg/50'
                }`}
              >
                <div className="text-xs font-semibold text-atlas-muted mb-2">{MONTH_LABELS[i]}</div>
                {monthTrips.length === 0 ? (
                  <div className="text-xs text-atlas-border">No trips</div>
                ) : (
                  <div className="space-y-1.5">
                    {monthTrips.map((t) => (
                      <div
                        key={t.id}
                        className={`text-xs px-2 py-1 rounded border ${STATUS_BG[t.status]}`}
                      >
                        <div className="font-medium truncate">{t.destination.split(',')[0]}</div>
                        <div className="opacity-70">
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-atlas-muted">Upcoming Trips</h2>
          <Link to="/destinations" className="text-xs text-atlas-accent hover:underline">View all</Link>
        </div>
        {upcomingTrips.length === 0 ? (
          <p className="text-atlas-muted text-sm">No upcoming trips planned.</p>
        ) : (
          <div className="space-y-3">
            {upcomingTrips.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-atlas-bg/60 border border-atlas-border">
                <div>
                  <div className="font-medium text-atlas-text">{t.destination}</div>
                  <div className="text-xs text-atlas-muted">
                    {formatDateShort(t.start_date)} – {formatDateShort(t.end_date)} · {t.airline || 'No airline'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  <span className="text-sm font-display font-bold text-atlas-accent">{daysUntil(t.start_date)}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
