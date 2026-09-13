import { useState, useMemo } from 'react';

export default function DestinationSearch({ destinations, value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      destinations.filter((d) => d.toLowerCase().includes(query.toLowerCase())),
    [destinations, query]
  );

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          value={open ? query : value}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a destination..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base font-medium text-navy-900 shadow-soft outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400">No matching destinations.</p>
          )}
          {filtered.map((d) => (
            <button
              key={d}
              onMouseDown={() => {
                onChange(d);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 ${
                d === value ? 'bg-brand-blue/5 text-brand-blue' : 'text-navy-800'
              }`}
            >
              {d}
              {d === value && (
                <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
