export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-4 py-0">
      <span className="stat-label">{label}</span>
      <div className="flex items-center gap-2">
        {accent && <div className="w-px h-8 shrink-0" style={{ background: 'var(--bronze)' }} />}
        <span className="stat-value">{value}</span>
      </div>
      {sub && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 300, color: 'var(--slate)' }}>{sub}</span>}
    </div>
  );
}
