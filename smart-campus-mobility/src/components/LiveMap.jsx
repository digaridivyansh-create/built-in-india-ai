import { useMemo, useState } from 'react';
import { STOPS, initialRoutes } from '../data/mockData';
import MapMarker from './MapMarker';

const STOP_MAP = Object.fromEntries(STOPS.map((s) => [s.name, s]));

const ROUTE_COLOR = {
  R1: '#3b82f6',
  R2: '#22d3ee',
  R3: '#a78bfa',
};

function pointsForRoute(route) {
  return route.stops.map((name) => STOP_MAP[name]).filter(Boolean);
}

function positionAlongRoute(route, progress) {
  const pts = pointsForRoute(route);
  if (pts.length < 2) return pts[0] || { x: 0, y: 0 };
  const segCount = pts.length - 1;
  const clamped = Math.min(Math.max(progress, 0), 0.999);
  const segIndex = Math.floor(clamped * segCount);
  const segProgress = clamped * segCount - segIndex;
  const a = pts[segIndex];
  const b = pts[segIndex + 1] || a;
  return {
    x: a.x + (b.x - a.x) * segProgress,
    y: a.y + (b.y - a.y) * segProgress,
  };
}

export default function LiveMap({ buses, onSelectBus, height = 380 }) {
  const [selected, setSelected] = useState(null);
  const routesById = useMemo(
    () => Object.fromEntries(initialRoutes.map((r) => [r.id, r])),
    []
  );

  const handleSelect = (bus) => {
    setSelected(bus.id);
    onSelectBus?.(bus);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-[#f7f9fc] shadow-soft">
      <svg viewBox="0 0 600 420" className="w-full" style={{ height }}>
        {/* background grid */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e7ebf2" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="600" height="420" fill="url(#grid)" />

        {/* "land" blocks to suggest buildings */}
        {STOPS.map((s) => (
          <rect
            key={`land-${s.id}`}
            x={s.x - 34}
            y={s.y - 24}
            width="68"
            height="48"
            rx="10"
            fill="#eef1f6"
          />
        ))}

        {/* route roads */}
        {initialRoutes.map((route) => {
          const pts = pointsForRoute(route);
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          return (
            <path
              key={route.id}
              d={d}
              fill="none"
              stroke={ROUTE_COLOR[route.id] || '#94a3b8'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 10"
              opacity="0.55"
            />
          );
        })}

        {/* stops */}
        {STOPS.map((s) => (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r="5" fill="white" stroke="#94a3b8" strokeWidth="2" />
            <text
              x={s.x}
              y={s.y - 30}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#1c2740"
              fontFamily="Inter, sans-serif"
            >
              {s.name}
            </text>
          </g>
        ))}

        {/* buses */}
        {buses.map((bus) => {
          const route = routesById[bus.routeId];
          if (!route) return null;
          const pos = positionAlongRoute(route, bus.progress ?? 0.5);
          return (
            <MapMarker
              key={bus.id}
              bus={bus}
              x={pos.x}
              y={pos.y}
              onClick={handleSelect}
              selected={selected === bus.id}
            />
          );
        })}
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-medium text-slate-500 backdrop-blur">
        {initialRoutes.map((r) => (
          <span key={r.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ROUTE_COLOR[r.id] }} />
            {r.id}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-status-ontime animate-pulseDot" />
          Live positions (simulated)
        </span>
      </div>
    </div>
  );
}
