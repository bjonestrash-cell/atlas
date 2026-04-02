import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 64px 96px' }}>
        {children}
      </main>
      {/* Mobile padding override */}
      <style>{`@media (max-width: 767px) { main { padding: 100px 24px 80px !important; } }`}</style>
    </div>
  );
}
