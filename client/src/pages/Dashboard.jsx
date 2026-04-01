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
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-atlas-text">{getGreeting()}, Ben</h1>
        <p className="text-atlas-muted text-sm mt-1">{YEAR} Travel Journal</p>
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
        <h2 className="text-lg font-bold text-atlas-text mb-5">Annual Calendar</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MONTHS.map((m, i) => {
            const monthTrips = tripsByMonth[m] || [];
            const isCurrentMonth = m === format(new Date(), 'yyyy-MM');
            return (
              <div
                key={m}
                className={`rounded-2xl p-3 transition-colors ${
                  isCurrentMonth ? 'bg-atlas-green-light ring-1 ring-atlas-green/20' : 'bg-atlas-bg'
                }`}
              >
                <div className="text-xs font-medium text-atlas-muted mb-2">{MONTH_LABELS[i]}</div>
                {monthTrips.length === 0 ? (
                  <div className="text-xs text-atlas-muted/50">No trips</div>
                ) : (
                  <div className="space-y-1.5">
                    {monthTrips.map((t) => (
                      <div key={t.id} className="text-xs bg-white rounded-xl px-2.5 py-1.5 shadow-sm">
                        <div className="font-semibold truncate text-atlas-text">{t.destination.split(',')[0]}</div>
                        <div className="text-atlas-muted">
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-atlas-text">Upcoming Trips</h2>
          <Link to="/trips" className="text-sm font-semibold text-atlas-muted hover:text-atlas-text transition-colors">View all →</Link>
        </div>
        {upcomingTrips.length === 0 ? (
          <p className="text-atlas-muted text-sm">No upcoming trips planned.</p>
        ) : (
          <div className="space-y-3">
            {upcomingTrips.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-atlas-bg">
                <div>
                  <div className="font-semibold text-atlas-text">{t.destination}</div>
                  <div className="text-sm text-atlas-muted mt-0.5">
                    {formatDateShort(t.start_date)} – {formatDateShort(t.end_date)} · {t.airline || 'No airline'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-pill ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  <span className="text-2xl font-extrabold text-atlas-text">{daysUntil(t.start_date)}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
