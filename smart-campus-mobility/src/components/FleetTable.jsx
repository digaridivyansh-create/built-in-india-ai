import StatusBadge from './StatusBadge';
import OccupancyBadge from './OccupancyBadge';

export default function FleetTable({ buses, routesById }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3">Bus</th>
              <th className="px-5 py-3">Route</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">ETA</th>
              <th className="px-5 py-3">Speed</th>
              <th className="px-5 py-3">Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr
                key={bus.id}
                className={`border-b border-slate-50 last:border-0 transition-colors duration-300 ${
                  bus.status === 'delayed' ? 'bg-red-50/40' : ''
                }`}
              >
                <td className="px-5 py-4 font-bold text-navy-900">{bus.id}</td>
                <td className="px-5 py-4 text-slate-500">{routesById[bus.routeId]?.id || bus.routeId}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={bus.status} />
                </td>
                <td className="px-5 py-4 font-semibold tabular-nums text-navy-800">{bus.eta} min</td>
                <td className="px-5 py-4 text-slate-500 tabular-nums">{bus.speed} km/h</td>
                <td className="px-5 py-4">
                  <OccupancyBadge occupancy={bus.occupancy} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
