import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 md:px-16 pt-28 md:pt-32 pb-28 md:pb-20">
        {children}
      </main>
    </div>
  );
}
