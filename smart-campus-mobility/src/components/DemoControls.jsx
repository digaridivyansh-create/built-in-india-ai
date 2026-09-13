export default function DemoControls({ demoDelayActive, onSimulateDelay, onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-blue/30 bg-brand-blue/5 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/15">
          <svg className="h-3.5 w-3.5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-blue">
          Hackathon Demo Controls
        </p>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Trigger a live delay on BUS12 to see the AI recommendation switch in real time across
        every connected view.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onSimulateDelay}
          disabled={demoDelayActive}
          className="inline-flex items-center gap-2 rounded-xl bg-status-delayed px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simulate Delay
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-navy-900 shadow-soft transition hover:bg-slate-50"
        >
          Reset Demo
        </button>
      </div>
    </div>
  );
}
