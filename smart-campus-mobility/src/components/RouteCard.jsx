import RouteProgress from './RouteProgress';
import StatusBadge from './StatusBadge';

export default function RouteCard({ route, buses }) {
  const routeBuses = buses.filter((b) => b.routeId === route.id);
  const hasDelay = routeBuses.some((b) => b.status === 'delayed');
  const overallStatus = hasDelay ? 'delayed' : 'on_time';

  // pick the most-advanced bus to visualise progress against the stop list
  const leadBus = [...routeBuses].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];
  const activeIndex = leadBus
    ? Math.min(
        route.stops.length - 1,
        Math.floor((leadBus.progress ?? 0) * route.stops.length)
      )
    : -1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-extrabold text-navy-900">{route.id}</p>
          <p className="text-xs font-medium text-slate-400">{route.durationMin} min approx. duration</p>
        </div>
        <StatusBadge status={overallStatus} />
      </div>

      <div className="mt-5">
        <RouteProgress stops={route.stops} activeIndex={activeIndex} />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Active buses
        </p>
        <div className="flex flex-wrap gap-2">
          {routeBuses.length === 0 && (
            <span className="text-sm text-slate-400">No active buses</span>
          )}
          {routeBuses.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-navy-800"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  b.status === 'delayed' ? 'bg-status-delayed' : 'bg-status-ontime'
                }`}
              />
              {b.id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
