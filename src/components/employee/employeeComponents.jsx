export function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400">
      {text}
    </div>
  );
}

export function StatusPill({ label }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
      {label}
    </span>
  );
}

export function ActionButton({ disabled, label, loading, onClick }) {
  return (
    <button
      className="glow-button min-h-[58px] rounded-xl px-4 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {loading ? "Saving..." : label}
    </button>
  );
}

export function RecordFact({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-black text-white">{value}</p>
    </div>
  );
}

export function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-3 backdrop-blur-sm sm:p-4">
      <div className="glass-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl p-4 sm:max-h-[88vh] sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
