import { Link } from "react-router-dom";

function SetupHeader({ actionLabel = "Log in", actionTo = "/login", helperText = "Already have an account?" }) {
  return (
    <header className="relative z-20 border-b border-white/10 bg-[#07111F]/55 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Vynora home">
          <img
            src="/vynora-logo.png"
            alt="Vynora"
            className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_0_22px_rgba(45,212,191,0.38)] sm:h-14 sm:w-14"
          />
          <div className="leading-none">
            <span className="block text-xl font-black tracking-wide text-white sm:text-2xl">VYNORA</span>
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-[0.34em] text-cyan-300 sm:block">
              Track Time. Grow Better.
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <span className="hidden text-sm text-slate-300 md:inline">{helperText}</span>
          <Link
            to={actionTo}
            className="rounded-xl border border-cyan-300/30 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10 sm:px-7"
          >
            {actionLabel}
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default SetupHeader;
