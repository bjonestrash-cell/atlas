import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(28,26,23,0.6)' }} onClick={onClose} />
      <div className="relative max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" style={{ background: 'var(--cream)', border: '1px solid var(--stone)', padding: 48 }}>
        <div className="flex items-center justify-between mb-8">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--ink)' }}>{title}</h2>
          <button onClick={onClose} style={{ color: 'var(--slate)', transition: 'color 0.3s' }} className="hover:opacity-70">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
