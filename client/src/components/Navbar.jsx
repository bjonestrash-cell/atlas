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
      {/* Desktop nav — fixed, frosted glass */}
      <nav
        className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-[1000] h-14 px-12"
        style={{ background: 'rgba(250,247,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,202,184,0.6)' }}
      >
        <Link to="/" className="flex items-baseline gap-0">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, letterSpacing: '0.4em', color: '#1C1A17', textTransform: 'uppercase' }}>
            Atlas
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 300, letterSpacing: '0.25em', color: '#7A7060', textTransform: 'uppercase', marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #D4CAB8' }}>
            by Forme
          </span>
        </Link>
        <div className="flex items-center">
          {desktopLinks.map((link) => {
            const active = isActive(location.pathname, link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors"
                style={{
                  fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 400, letterSpacing: '0.18em',
                  textTransform: 'uppercase', textDecoration: 'none', padding: '0 16px',
                  color: active ? '#1C1A17' : '#3D3930',
                  borderBottom: active ? '1px solid #8B6F47' : '1px solid transparent',
                  paddingBottom: 2,
                }}
                onMouseEnter={(e) => { if (!active) e.target.style.color = '#8B6F47'; }}
                onMouseLeave={(e) => { if (!active) e.target.style.color = '#3D3930'; }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-[1000] flex items-center justify-center h-14"
        style={{ background: 'rgba(250,247,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,202,184,0.6)' }}
      >
        <div className="flex items-baseline gap-0">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, letterSpacing: '0.35em', color: 'var(--ink)', textTransform: 'uppercase' }}>
            Atlas
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 8, fontWeight: 300, letterSpacing: '0.3em', color: 'var(--slate)', textTransform: 'uppercase', marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid var(--stone)' }}>
            by Forme
          </span>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[1000]"
        style={{ height: 64, background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(212,202,184,0.4)' }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(location.pathname, tab.to);
            return (
              <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center gap-1 flex-1 h-full">
                <Icon size={18} strokeWidth={active ? 1.5 : 1} style={{ color: active ? 'var(--ink)' : 'var(--stone)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: active ? 400 : 300, letterSpacing: '0.15em', textTransform: 'uppercase', color: active ? 'var(--ink)' : 'var(--stone)' }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center justify-center gap-1 flex-1 h-full">
            <Menu size={18} strokeWidth={isMoreActive ? 1.5 : 1} style={{ color: isMoreActive ? 'var(--ink)' : 'var(--stone)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: isMoreActive ? 400 : 300, letterSpacing: '0.15em', textTransform: 'uppercase', color: isMoreActive ? 'var(--ink)' : 'var(--stone)' }}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* More drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[1100]">
          <div className="absolute inset-0" style={{ background: 'rgba(28,26,23,0.6)' }} onClick={() => setMoreOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0" style={{ background: 'var(--cream)', borderTop: '1px solid var(--stone)' }}>
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--ink)' }}>More</span>
              <button onClick={() => setMoreOpen(false)} style={{ color: 'var(--slate)' }} className="hover:opacity-70">
                <X size={18} strokeWidth={1} />
              </button>
            </div>
            <div className="px-8 pb-12">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(location.pathname, link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-4 py-5"
                    style={{ borderBottom: '1px solid var(--sand)', color: active ? 'var(--ink)' : 'var(--slate)', textDecoration: 'none' }}
                  >
                    <Icon size={16} strokeWidth={1} />
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: active ? 400 : 300, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      {link.label}
                    </span>
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
