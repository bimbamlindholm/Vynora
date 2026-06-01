import { Sparkles } from "lucide-react";

/**
 * Presentational view displayed when an employee account is not yet connected to any active workspace.
 */
export default function WorkspaceConnectSection({
  profile,
  connectCode,
  setConnectCode,
  connectError,
  connecting,
  onSubmit,
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="glass-panel rounded-3xl border-cyan-300/30 p-8 shadow-[0_0_80px_rgba(6,182,212,0.15)] text-center relative overflow-hidden bg-slate-900/40 backdrop-blur-md">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
        
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <Sparkles size={28} className="animate-pulse" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wide">Connect to Workspace</h2>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Welcome, <span className="text-cyan-300 font-bold">{profile?.full_name || "Employee"}</span>! To access your DTR dashboard, enter the Workspace Code provided by your manager or admin (e.g., <span className="font-bold tracking-widest text-slate-300">TRK-12345</span>).
        </p>

        {connectError && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
            ⚠️ {connectError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="TRK-XXXXX"
              value={connectCode}
              onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
              disabled={connecting}
              maxLength={10}
              required
              className="h-14 w-full rounded-xl border border-white/10 bg-[#0E1726] px-4 text-center text-lg font-black tracking-widest text-white outline-none transition placeholder:text-slate-600 placeholder:tracking-normal focus:border-cyan-400/50 focus:bg-cyan-500/[0.04] disabled:opacity-50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={connecting}
            className="glow-button flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-black text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? "Connecting to Admin..." : "Link My Account"}
          </button>
        </form>

        <p className="mt-5 text-[10px] text-slate-500 font-semibold leading-normal">
          Your profile and future clock-in details will automatically sync with this workspace once linked.
        </p>
      </div>
    </div>
  );
}
