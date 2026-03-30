export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${accent ? 'text-atlas-accent' : ''}`}>{value}</span>
      {sub && <span className="text-xs text-atlas-muted">{sub}</span>}
    </div>
  );
}
