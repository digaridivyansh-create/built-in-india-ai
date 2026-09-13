export default function RouteProgress({ stops, activeIndex = -1 }) {
  return (
    <div className="flex flex-col">
      {stops.map((stop, i) => {
        const isLast = i === stops.length - 1;
        const passed = activeIndex >= 0 && i <= activeIndex;
        return (
          <div key={stop} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 rounded-full ring-4 ${
                  passed
                    ? 'bg-brand-blue ring-brand-blue/15'
                    : 'bg-slate-300 ring-slate-100'
                }`}
              />
              {!isLast && (
                <span
                  className={`w-0.5 flex-1 ${passed ? 'bg-brand-blue/40' : 'bg-slate-200'}`}
                  style={{ minHeight: '28px' }}
                />
              )}
            </div>
            <p
              className={`pb-6 text-sm font-semibold ${
                passed ? 'text-navy-900' : 'text-slate-400'
              }`}
            >
              {stop}
            </p>
          </div>
        );
      })}
    </div>
  );
}
