import StatusBadge from './StatusBadge';

export default function AIRecommendation({ destination, recommendation, onViewBus }) {
  const { recommendedBus, eta, reason } = recommendation;

  if (!recommendedBus) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
          AI Mobility Recommendation
        </p>
        <p className="mt-4 text-slate-500">{reason}</p>
      </div>
    );
  }

  return (
    <div
      key={recommendedBus.id}
      className="relative overflow-hidden rounded-3xl border border-navy-800 bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 p-8 text-white shadow-card animate-fadeSlideIn"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-blue/20 blur-3xl" />

      <div className="relative flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/20">
          <span className="h-2 w-2 rounded-full bg-brand-cyan" />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-cyan">
          AI Mobility Recommendation
        </p>
      </div>

      <p className="relative mt-4 text-sm text-slate-300">
        Best option for <span className="font-semibold text-white">{destination}</span>
      </p>

      <div className="relative mt-3 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-4xl font-extrabold tracking-tight">{recommendedBus.id}</p>
          <div className="mt-2">
            <StatusBadge status={recommendedBus.status} />
          </div>
        </div>
        <div className="text-right leading-none">
          <span className="text-5xl font-extrabold tabular-nums">{eta}</span>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            min ETA
          </p>
        </div>
      </div>

      <div className="relative mt-6 rounded-2xl bg-white/5 p-4 backdrop-blur-sm ring-1 ring-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Why this bus?
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-100">{reason}</p>
      </div>

      <button
        onClick={onViewBus}
        className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-slate-100"
      >
        View Bus
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
