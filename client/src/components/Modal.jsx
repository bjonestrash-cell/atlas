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
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-atlas-surface border border-atlas-border max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" style={{ boxShadow: '0 12px 48px rgba(13,13,11,0.1)' }}>
        <div className="flex items-center justify-between p-6 border-b border-atlas-border">
          <h2 className="font-display text-xl font-light text-atlas-text">{title}</h2>
          <button onClick={onClose} className="text-atlas-soft hover:text-atlas-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
