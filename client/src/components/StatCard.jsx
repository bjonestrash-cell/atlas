export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card flex flex-col gap-2">
      <span className="stat-label">{label}</span>
      <div className="flex items-center gap-2">
        {accent && <div className="w-2 h-2 rounded-full bg-atlas-green shrink-0" />}
        <span className="stat-value">{value}</span>
      </div>
      {sub && <span className="text-sm text-atlas-muted">{sub}</span>}
    </div>
  );
}
