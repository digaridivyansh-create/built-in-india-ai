import { useMemo, useState } from 'react';
import { STOPS, initialRoutes } from '../data/mockData';
import MapMarker from './MapMarker';

const STOP_MAP = Object.fromEntries(
  STOPS.map((s) => [s.name, s])
);

const ROUTE_COLOR = {
  R1: '#3b82f6',
  R2: '#22d3ee',
  R3: '#a78bfa',
};

const GEO_BOUNDS = {
  minLat: 28.6095,
  maxLat: 28.6205,
  minLon: 77.2015,
  maxLon: 77.2230,
};

function pointsForRoute(route) {
  return route.stops
    .map((name) => STOP_MAP[name])
    .filter(Boolean);
}

function gpsToSvg(latitude, longitude) {
  const latRange =
    GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat;

  const lonRange =
    GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon;

  const normalizedX =
    (longitude - GEO_BOUNDS.minLon) / lonRange;

  const normalizedY =
    (GEO_BOUNDS.maxLat - latitude) / latRange;

  return {
    x: normalizedX * 600,
    y: normalizedY * 420,
  };
}

function getBusPosition(bus) {
  if (
    Number.isFinite(Number(bus.latitude)) &&
    Number.isFinite(Number(bus.longitude))
  ) {
    return gpsToSvg(
      Number(bus.latitude),
      Number(bus.longitude)
    );
  }

  const route = initialRoutes.find(
    (r) => r.id === bus.routeId
  );

  if (!route) {
    return { x: 300, y: 210 };
  }

  const pts = pointsForRoute(route);

  if (pts.length === 0) {
    return { x: 300, y: 210 };
  }

  return pts[0];
}

export default function LiveMap({
  buses,
  onSelectBus,
  height = 380,
}) {
  const [selected, setSelected] = useState(null);

  const routesById = useMemo(
    () =>
      Object.fromEntries(
        initialRoutes.map((r) => [r.id, r])
      ),
    []
  );

  const handleSelect = (bus) => {
    const busId = bus.busId || bus.id;

    setSelected(busId);
    onSelectBus?.(bus);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-[#f7f9fc] shadow-soft">
      <svg
        viewBox="0 0 600 420"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="#e7ebf2"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect
          width="600"
          height="420"
          fill="url(#grid)"
        />

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

        {initialRoutes.map((route) => {
          const pts = pointsForRoute(route);

          const d = pts
            .map(
              (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            )
            .join(' ');

          return (
            <path
              key={route.id}
              d={d}
              fill="none"
              stroke={
                ROUTE_COLOR[route.id] ||
                '#94a3b8'
              }
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 10"
              opacity="0.55"
            />
          );
        })}

        {STOPS.map((s) => (
          <g key={s.id}>
            <circle
              cx={s.x}
              cy={s.y}
              r="5"
              fill="white"
              stroke="#94a3b8"
              strokeWidth="2"
            />

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

        {buses.map((bus) => {
          const busId = bus.busId || bus.id;

          const route =
            routesById[bus.routeId];

          if (!route) {
            return null;
          }

          const pos = getBusPosition(bus);

          return (
            <MapMarker
              key={busId}
              bus={{
                ...bus,
                id: busId,
              }}
              x={pos.x}
              y={pos.y}
              onClick={handleSelect}
              selected={selected === busId}
            />
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-medium text-slate-500 backdrop-blur">
        {initialRoutes.map((r) => (
          <span
            key={r.id}
            className="flex items-center gap-1.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  ROUTE_COLOR[r.id],
              }}
            />
            {r.id}
          </span>
        ))}

        <span className="ml-auto flex items-center gap-1.5 text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-status-ontime animate-pulseDot" />
          Live positions
        </span>
      </div>
    </div>
  );
}

