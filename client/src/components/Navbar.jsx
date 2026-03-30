import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/flights', label: 'Flights' },
  { to: '/points', label: 'Points' },
  { to: '/optimizer', label: 'Optimizer' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/budget', label: 'Budget' },
];

export default function Navbar() {
  return (
    <nav className="bg-atlas-surface border-b border-atlas-border sticky top-0 z-50" style={{ boxShadow: '0 1px 3px rgba(26,42,58,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2">
            <svg className="w-6 h-6 text-atlas-accent" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="16" cy="16" rx="6" ry="14" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="font-display text-2xl tracking-widest text-atlas-text">ATLAS</span>
          </NavLink>
          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 font-heading font-semibold text-sm uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-atlas-accent text-atlas-accent'
                      : 'border-transparent text-atlas-muted hover:text-atlas-text hover:border-atlas-border'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
