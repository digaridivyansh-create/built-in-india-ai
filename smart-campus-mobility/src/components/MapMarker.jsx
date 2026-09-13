const STATUS_COLOR = {
  on_time: '#16a34a',
  delayed: '#dc2626',
  warning: '#d97706',
};

export default function MapMarker({
  bus,
  x,
  y,
  onClick,
  selected,
}) {
  const color =
    STATUS_COLOR[bus.status] ||
    STATUS_COLOR.on_time;

  const busId = bus.busId || bus.id || 'BUS';

  const label = busId.replace('BUS', '');

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onClick?.(bus)}
      className="cursor-pointer"
      style={{
        transition: 'transform 1.2s ease-in-out',
      }}
    >
      <circle
        r="14"
        fill={color}
        opacity="0.18"
      >
        <animate
          attributeName="r"
          values="12;18;12"
          dur="2s"
          repeatCount="indefinite"
        />

        <animate
          attributeName="opacity"
          values="0.25;0;0.25"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        r="11"
        fill={color}
        stroke="white"
        strokeWidth="2.5"
        className={selected ? 'drop-shadow-lg' : ''}
      />

      <text
        textAnchor="middle"
        dy="4"
        fontSize="10"
        fontWeight="700"
        fill="white"
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}