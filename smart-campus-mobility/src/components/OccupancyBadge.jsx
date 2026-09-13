import { getOccupancyLabel } from '../services/mockMobility';

const BAR_COUNT = { low: 1, moderate: 2, high: 3 };
const BAR_COLOR = {
  low: 'bg-brand-blue',
  moderate: 'bg-status-warning',
  high: 'bg-status-delayed',
};

export default function OccupancyBadge({ occupancy }) {
  const active = BAR_COUNT[occupancy] || 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5 h-3.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{ height: `${i * 4 + 2}px` }}
            className={`w-1 rounded-sm ${
              i <= active ? BAR_COLOR[occupancy] || BAR_COLOR.low : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-slate-600">{getOccupancyLabel(occupancy)}</span>
    </div>
  );
}
