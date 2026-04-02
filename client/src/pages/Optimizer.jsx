import { useEffect, useState, useMemo } from 'react';
import { useTripStore } from '../store/tripStore';
import { usePointsStore } from '../store/pointsStore';
import { formatCurrency, formatPoints } from '../utils/format';

export default function Optimizer() {
  const { trips, fetchTrips } = useTripStore();
  const { programs, fetchPrograms } = usePointsStore();

  const [selectedTrip, setSelectedTrip] = useState('');
  const [cashPrice, setCashPrice] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [pointsNeeded, setPointsNeeded] = useState('');

  useEffect(() => {
    fetchTrips();
    fetchPrograms();
  }, []);

  const activeTrips = trips.filter((t) => t.status !== 'completed');

  const program = programs.find((p) => p.program_name === selectedProgram);
  const cash = parseFloat(cashPrice) || 0;
  const points = parseInt(pointsNeeded) || 0;

  const analysis = useMemo(() => {
    if (!cash || !points || !program) return null;

    const pointsValueCents = points * program.cpp;
    const pointsValueDollars = pointsValueCents / 100;
    const effectiveCpp = cash > 0 && points > 0 ? (cash / points) * 100 : 0;
    const recommendation = effectiveCpp >= program.cpp ? 'points' : 'cash';
    const savings = recommendation === 'points' ? cash - pointsValueDollars : pointsValueDollars - cash;

    return {
      pointsValueDollars,
      effectiveCpp,
      recommendation,
      savings: Math.abs(savings),
      hasEnoughPoints: program.balance >= points,
    };
  }, [cash, points, program]);

  return (
    <div className="space-y-6">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--ink)' }}>Points vs. Cash</h1>

      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-atlas-muted mb-4">Trip Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Select Trip (optional)</label>
            <select value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)} className="w-full">
              <option value="">— Manual entry —</option>
              {activeTrips.map((t) => (
                <option key={t.id} value={t.id}>{t.destination} ({t.start_date})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Cash Price (USD) *</label>
              <input type="number" value={cashPrice} onChange={(e) => setCashPrice(e.target.value)} placeholder="500" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Points Program *</label>
              <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="w-full">
                <option value="">Select program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.program_name}>{p.program_name} ({formatPoints(p.balance)} pts)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-atlas-muted mb-1 uppercase tracking-wider">Points Needed *</label>
              <input type="number" value={pointsNeeded} onChange={(e) => setPointsNeeded(e.target.value)} placeholder="25000" className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div className={`card border-2 ${analysis.recommendation === 'points' ? 'border-atlas-success/50 bg-emerald-50/30' : 'border-atlas-accent/50 bg-atlas-accent/5'}`}>
            <div className="flex items-center gap-3">
              <div className={`text-3xl ${analysis.recommendation === 'points' ? 'text-atlas-success' : 'text-atlas-accent'}`}>
                {analysis.recommendation === 'points' ? '★' : '$'}
              </div>
              <div>
                <div className="font-display text-2xl text-atlas-text">
                  Recommendation: Use {analysis.recommendation === 'points' ? 'Points' : 'Cash'}
                </div>
                <div className="text-sm text-atlas-sub">
                  You save {formatCurrency(analysis.savings)} by paying with {analysis.recommendation}.
                  {!analysis.hasEnoughPoints && analysis.recommendation === 'points' && (
                    <span className="text-atlas-warning ml-1 font-medium">(Insufficient balance — need {formatPoints(points - program.balance)} more)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-atlas-muted mb-4">Side-by-Side Comparison</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-atlas-border">
                  <th className="text-left py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider"></th>
                  <th className="text-right py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Pay Cash</th>
                  <th className="text-right py-2 text-atlas-muted text-xs font-semibold uppercase tracking-wider">Use Points</th>
                </tr>
              </thead>
              <tbody className="text-atlas-text">
                <tr className="border-b border-atlas-border/50">
                  <td className="py-3 text-atlas-sub">Cost</td>
                  <td className="py-3 text-right font-display font-semibold">{formatCurrency(cash)}</td>
                  <td className="py-3 text-right font-display font-semibold">{formatPoints(points)} pts</td>
                </tr>
                <tr className="border-b border-atlas-border/50">
                  <td className="py-3 text-atlas-sub">Estimated Value</td>
                  <td className="py-3 text-right font-display font-semibold">{formatCurrency(cash)}</td>
                  <td className="py-3 text-right font-display font-semibold">{formatCurrency(analysis.pointsValueDollars)}</td>
                </tr>
                <tr className="border-b border-atlas-border/50">
                  <td className="py-3 text-atlas-sub">Effective CPP</td>
                  <td className="py-3 text-right">—</td>
                  <td className="py-3 text-right font-display font-semibold">{analysis.effectiveCpp.toFixed(2)}¢</td>
                </tr>
                <tr className="border-b border-atlas-border/50">
                  <td className="py-3 text-atlas-sub">Program Baseline CPP</td>
                  <td className="py-3 text-right">—</td>
                  <td className="py-3 text-right font-display font-semibold">{program.cpp}¢</td>
                </tr>
                <tr>
                  <td className="py-3 text-atlas-sub">Available Balance</td>
                  <td className="py-3 text-right">—</td>
                  <td className={`py-3 text-right font-display font-semibold ${analysis.hasEnoughPoints ? 'text-atlas-success' : 'text-atlas-danger'}`}>
                    {formatPoints(program.balance)} pts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card text-sm text-atlas-sub">
            <p>
              At {analysis.effectiveCpp.toFixed(2)}¢ per point, this redemption is
              {analysis.effectiveCpp >= program.cpp
                ? <span className="text-atlas-success font-medium"> above</span>
                : <span className="text-atlas-danger font-medium"> below</span>
              } the {program.cpp}¢ baseline for {program.program_name}.
              {analysis.effectiveCpp >= program.cpp
                ? ' This is a great use of your points.'
                : ' You\'d get more value keeping your points for a better redemption.'}
            </p>
          </div>
        </div>
      )}

      {!analysis && (
        <div className="text-center py-16 text-atlas-muted">
          <div className="text-4xl mb-3 opacity-30">&#9878;</div>
          <p>Enter a cash price, select a points program, and specify points needed to see the recommendation.</p>
        </div>
      )}
    </div>
  );
}
