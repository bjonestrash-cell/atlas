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
    <nav className="bg-white border-b border-atlas-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-atlas-green flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <ellipse cx="12" cy="12" rx="4" ry="10" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-atlas-text tracking-tight">Atlas</span>
          </NavLink>
          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'font-semibold text-atlas-text' : 'text-atlas-muted hover:text-atlas-text'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-atlas-green" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
