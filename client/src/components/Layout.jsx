import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-atlas-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
