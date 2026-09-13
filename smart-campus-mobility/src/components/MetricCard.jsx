export default function MetricCard({ label, value, tone = 'default', icon }) {
  const toneStyles = {
    default: 'text-navy-900',
    good: 'text-status-ontime',
    bad: 'text-status-delayed',
    warn: 'text-status-warning',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        {icon}
      </div>
      <p className={`mt-2 text-3xl font-extrabold tabular-nums transition-colors duration-300 ${toneStyles[tone]}`}>
        {value}
      </p>
    </div>
  );
}
