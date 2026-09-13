import StatusBadge from './StatusBadge';
import OccupancyBadge from './OccupancyBadge';

export default function BusCard({ bus, routeName, highlighted = false }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-card ${
        highlighted ? 'border-brand-cyan ring-2 ring-brand-cyan/30' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-navy-900">{bus.id}</p>
          <p className="text-xs font-medium text-slate-400">{routeName || bus.routeId}</p>
        </div>
        <StatusBadge status={bus.status} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="leading-none">
          <span className="text-3xl font-extrabold text-navy-900 tabular-nums">{bus.eta}</span>
          <span className="ml-1 text-xs font-semibold uppercase text-slate-400">min ETA</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Next stop</p>
          <p className="text-sm font-semibold text-navy-800">{bus.nextStop}</p>
        </div>
      </div>

      {/* Route progress */}
      <div className="mt-4">
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              bus.status === 'delayed' ? 'bg-status-delayed' : 'bg-brand-blue'
            }`}
            style={{ width: `${Math.round((bus.progress ?? 0.5) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <OccupancyBadge occupancy={bus.occupancy} />
        <span className="text-sm font-semibold text-slate-500">{Number(bus.speed).toFixed(2)} km/h</span>
      </div>
    </div>
  );
}
