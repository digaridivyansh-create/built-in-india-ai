import { getStatusLabel } from '../services/mockMobility';

const STYLES = {
  on_time: 'bg-green-50 text-status-ontime ring-1 ring-inset ring-green-200',
  delayed: 'bg-red-50 text-status-delayed ring-1 ring-inset ring-red-200',
  warning: 'bg-amber-50 text-status-warning ring-1 ring-inset ring-amber-200',
};

const DOT = {
  on_time: 'bg-status-ontime',
  delayed: 'bg-status-delayed',
  warning: 'bg-status-warning',
};

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${
        STYLES[status] || STYLES.on_time
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status] || DOT.on_time} ${status === 'delayed' ? '' : ''}`} />
      {getStatusLabel(status)}
    </span>
  );
}
