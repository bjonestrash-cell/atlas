export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card flex flex-col gap-3">
      <span className="stat-label">{label}</span>
      <div className="flex items-center gap-2">
        {accent && <div className="w-1.5 h-6 bg-atlas-accent shrink-0" />}
        <span className="stat-value">{value}</span>
      </div>
      {sub && <span className="text-xs text-atlas-muted font-light tracking-wide">{sub}</span>}
    </div>
  );
}
