import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function RegisterNavbar() {
  return (
    <header className="relative z-20 border-b border-white/10 bg-[#07111F]/55 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Trackly home">
          <img
            src="/trackly-logo.png"
            alt="Trackly"
            className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_0_22px_rgba(45,212,191,0.38)] sm:h-14 sm:w-14"
          />
          <div className="leading-none">
            <span className="block text-xl font-black tracking-wide text-white sm:text-2xl">TRACKLY</span>
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-[0.34em] text-cyan-300 sm:block">
              Track Time. Grow Better.
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-cyan-200 sm:flex"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
          <span className="hidden text-sm text-slate-300 md:inline">Already have an account?</span>
          <Link
            to="/login"
            className="rounded-xl border border-cyan-300/30 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10 sm:px-7"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default RegisterNavbar;
