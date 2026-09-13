import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/student', label: 'Dashboard' },
  { to: '/routes', label: 'Routes' },
  { to: '/ai', label: 'AI Assistant' },
];

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <NavLink to="/student" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan">
            <svg className="h-4.5 w-4.5 text-white" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-8 5h4M4 4h16v16H4V4z" />
            </svg>
          </span>
          <span className="text-sm font-extrabold tracking-tight text-white sm:text-base">
            SMART CAMPUS <span className="text-brand-cyan">MOBILITY</span>
          </span>
        </NavLink>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-status-ontime">
            <span className="h-1.5 w-1.5 rounded-full bg-status-ontime animate-pulseDot" />
            LIVE
          </span>
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? 'bg-white text-navy-900'
                  : 'border border-white/15 text-white hover:bg-white/10'
              }`
            }
          >
            Admin
          </NavLink>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan text-xs font-extrabold text-white">
            SC
          </span>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-navy-800 bg-navy-950 px-4 py-3 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-status-ontime">
              <span className="h-1.5 w-1.5 rounded-full bg-status-ontime animate-pulseDot" />
              LIVE
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {[...NAV_LINKS, { to: '/admin', label: 'Admin' }].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
