import { useEffect } from 'react';

const TONE_STYLES = {
  info: 'border-slate-200 bg-white text-navy-900',
  success: 'border-green-200 bg-green-50 text-green-800',
  delayed: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  ai: 'border-brand-blue/30 bg-navy-900 text-white',
};

function Toast({ notification, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(notification.id), 4500);
    return () => clearTimeout(t);
  }, [notification.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto w-80 max-w-[90vw] animate-toastIn rounded-xl border px-4 py-3 shadow-card ${
        TONE_STYLES[notification.tone] || TONE_STYLES.info
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug">{notification.message}</p>
        <button
          onClick={() => onDismiss(notification.id)}
          className="shrink-0 text-current opacity-50 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function NotificationStack({ notifications, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
