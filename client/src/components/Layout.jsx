import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7F2' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8 pb-28 md:pb-12">
        {children}
      </main>
    </div>
  );
}
