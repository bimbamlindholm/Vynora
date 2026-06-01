
// Navigation Item for Sidebar
export function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition duration-300 ${
        active
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]"
          : "bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

// Clock Actions Buttons
export function ClockButton({ icon: Icon, label, color, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={!active || disabled}
      className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center text-[11px] font-black transition-all duration-300 select-none active:scale-95 sm:gap-2 sm:p-3.5 sm:text-xs ${
        active 
          ? `${color} text-white border-transparent cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.1)]` 
          : "bg-slate-950/20 border-white/5 text-slate-600 cursor-not-allowed opacity-40"
      }`}
    >
      <Icon size={18} />
      <span className="max-w-full truncate text-[9px] uppercase tracking-wide sm:text-[10px]">{label}</span>
    </button>
  );
}

// Dashboard Stat Card Widget
export function StatCard({ icon: Icon, title, val, subtitle }) {
  return (
    <div className="glass-panel flex min-w-0 flex-col justify-between rounded-2xl border-white/5 bg-slate-900/30 p-4">
      <div className="flex justify-between items-center">
        <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
          <Icon size={12} />
        </div>
      </div>
      <div className="mt-3">
        <span className="block max-w-full truncate text-sm font-black tracking-tight text-white sm:text-base">{val}</span>
        <span className="block text-[9px] text-slate-500 font-bold truncate mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
}

// Analytics Detailed Block
export function StatBlock({ title, val, desc }) {
  return (
    <div className="glass-panel rounded-2xl p-5 border-white/5 bg-slate-900/30">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{title}</span>
      <span className="mt-1 block break-words text-lg font-black tracking-tight text-white">{val}</span>
      <span className="block text-[9px] text-slate-500 font-bold mt-0.5">{desc}</span>
    </div>
  );
}

// Period Filters Button
export function FilterBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-300 border ${
        active
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-transparent border-transparent text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

// Goals Progress Bar Indicator
export function ProgressBar({ percent, color }) {
  return (
    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
