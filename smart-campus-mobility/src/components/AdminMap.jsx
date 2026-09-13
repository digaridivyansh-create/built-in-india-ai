import LiveMap from './LiveMap';

export default function AdminMap({ buses }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-navy-900">Fleet Map</h3>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-status-ontime animate-pulseDot" />
          {buses.length} vehicles tracked
        </span>
      </div>
      <LiveMap buses={buses} height={340} />
    </div>
  );
}
