import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Plane, CreditCard, MapPin, Menu, X, BarChart3, Bell, DollarSign, Award } from 'lucide-react';

const desktopLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/trips', label: 'Trips' },
  { to: '/flights', label: 'Flights' },
  { to: '/points', label: 'Points' },
  { to: '/status', label: 'Status' },
  { to: '/optimizer', label: 'Optimizer' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/budget', label: 'Budget' },
];

const mobileTabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/points', label: 'Points', icon: CreditCard },
  { to: '/trips', label: 'Trips', icon: MapPin },
];

const moreLinks = [
  { to: '/status', label: 'Status', icon: Award },
  { to: '/optimizer', label: 'Optimizer', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/budget', label: 'Budget', icon: DollarSign },
];

function isActive(path, to) {
  if (to === '/') return path === '/';
  return path.startsWith(to);
}

export default function Navbar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const isMoreActive = moreLinks.some((l) => isActive(location.pathname, l.to));

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:block bg-white border-b border-atlas-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-atlas-green flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <ellipse cx="12" cy="12" rx="4" ry="10" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold text-atlas-text tracking-tight">ATLAS</span>
                <span className="text-[9px] text-atlas-muted font-medium tracking-wider">by Forme</span>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              {desktopLinks.map((link) => {
                const active = isActive(location.pathname, link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${active ? 'font-semibold text-atlas-text' : 'text-atlas-muted hover:text-atlas-text'}`}
                  >
                    {link.label}
                    {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-atlas-green" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden bg-white border-b border-atlas-border sticky top-0 z-50 flex items-center justify-center h-14">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-atlas-green flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <ellipse cx="12" cy="12" rx="4" ry="10" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold text-atlas-text tracking-tight">ATLAS</span>
            <span className="text-[8px] text-atlas-muted font-medium tracking-wider">by Forme</span>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-atlas-border" style={{ height: 64 }}>
        <div className="flex items-center justify-around h-full px-2">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(location.pathname, tab.to);
            return (
              <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} className={active ? 'text-atlas-text' : 'text-atlas-muted'} />
                <span className={`text-[10px] font-medium ${active ? 'text-atlas-text' : 'text-atlas-muted'}`}>{tab.label}</span>
                {active && <span className="absolute top-1.5 w-1 h-1 rounded-full bg-atlas-green" />}
              </Link>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative">
            <Menu size={22} strokeWidth={isMoreActive ? 2.5 : 1.5} className={isMoreActive ? 'text-atlas-text' : 'text-atlas-muted'} />
            <span className={`text-[10px] font-medium ${isMoreActive ? 'text-atlas-text' : 'text-atlas-muted'}`}>More</span>
            {isMoreActive && <span className="absolute top-1.5 w-1 h-1 rounded-full bg-atlas-green" />}
          </button>
        </div>
      </div>

      {/* More drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMoreOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <span className="text-lg font-bold text-atlas-text">More</span>
              <button onClick={() => setMoreOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-atlas-bg text-atlas-muted hover:text-atlas-text">
                <X size={18} />
              </button>
            </div>
            <div className="px-4 pb-8 space-y-1">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(location.pathname, link.to);
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMoreOpen(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors ${active ? 'bg-atlas-bg font-semibold text-atlas-text' : 'text-atlas-sub hover:bg-atlas-bg'}`}>
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                    <span className="text-sm">{link.label}</span>
                    {active && <span className="ml-auto w-2 h-2 rounded-full bg-atlas-green" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
