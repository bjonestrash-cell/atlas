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
      <nav className="hidden md:block border-b border-atlas-border sticky top-0 z-50" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-light tracking-wide text-atlas-text" style={{ letterSpacing: '0.12em' }}>ATLAS</span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-atlas-soft font-light">by Forme</span>
            </Link>
            <div className="flex items-center gap-0">
              {desktopLinks.map((link) => {
                const active = isActive(location.pathname, link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-colors whitespace-nowrap ${active ? 'text-atlas-text' : 'text-atlas-soft hover:text-atlas-text'}`}
                    style={{ fontWeight: active ? 400 : 300 }}
                  >
                    {link.label}
                    {active && <span className="absolute bottom-0 left-4 right-4 h-px bg-atlas-accent" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden border-b border-atlas-border sticky top-0 z-50 flex items-center justify-center h-14" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-light tracking-[0.12em] text-atlas-text">ATLAS</span>
          <span className="text-[8px] tracking-[0.2em] uppercase text-atlas-soft font-light">by Forme</span>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-atlas-border" style={{ height: 64, backgroundColor: '#FAF7F2' }}>
        <div className="flex items-center justify-around h-full px-2">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(location.pathname, tab.to);
            return (
              <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative">
                <Icon size={20} strokeWidth={active ? 1.5 : 1} className={active ? 'text-atlas-text' : 'text-atlas-soft'} />
                <span className={`text-[9px] tracking-[0.1em] uppercase ${active ? 'text-atlas-text' : 'text-atlas-soft'}`} style={{ fontWeight: active ? 400 : 300 }}>{tab.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative">
            <Menu size={20} strokeWidth={isMoreActive ? 1.5 : 1} className={isMoreActive ? 'text-atlas-text' : 'text-atlas-soft'} />
            <span className={`text-[9px] tracking-[0.1em] uppercase ${isMoreActive ? 'text-atlas-text' : 'text-atlas-soft'}`} style={{ fontWeight: isMoreActive ? 400 : 300 }}>More</span>
          </button>
        </div>
      </div>

      {/* More drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMoreOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-atlas-surface" style={{ boxShadow: '0 -8px 40px rgba(13,13,11,0.08)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <span className="font-display text-xl font-light text-atlas-text">More</span>
              <button onClick={() => setMoreOpen(false)} className="w-8 h-8 flex items-center justify-center text-atlas-soft hover:text-atlas-text transition-colors">
                <X size={18} strokeWidth={1} />
              </button>
            </div>
            <div className="px-6 pb-10 space-y-1">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(location.pathname, link.to);
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMoreOpen(false)} className={`flex items-center gap-4 px-0 py-4 border-b border-atlas-border/50 transition-colors ${active ? 'text-atlas-text' : 'text-atlas-sub hover:text-atlas-text'}`}>
                    <Icon size={18} strokeWidth={1} />
                    <span className="text-[11px] tracking-[0.15em] uppercase" style={{ fontWeight: active ? 400 : 300 }}>{link.label}</span>
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
