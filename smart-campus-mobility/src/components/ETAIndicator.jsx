export default function ETAIndicator({ minutes, size = 'md' }) {
  const sizes = {
    md: { num: 'text-2xl', label: 'text-[10px]' },
    lg: { num: 'text-4xl', label: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center leading-none">
      <span className={`${s.num} font-bold text-navy-900 tabular-nums transition-all duration-300`}>
        {minutes}
      </span>
      <span className={`${s.label} font-medium uppercase tracking-wider text-slate-400 mt-1`}>
        min ETA
      </span>
    </div>
  );
}
