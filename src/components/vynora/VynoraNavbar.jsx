import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, UserRound, X, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Features", to: "/features" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" }
];

export default function VynoraNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (to) => location.pathname === to;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07111F]/65 backdrop-blur-2xl no-print">
      <nav className="w-full flex h-20 items-center justify-between px-6 sm:px-12 xl:px-24">
        {/* Left Side: Brand Logo and Wordmark */}
        <Link to="/" className="flex min-w-0 items-center gap-3 group" aria-label="Vynora home">
          <img
            src="/vynora-logo.png"
            alt="Vynora Logo"
            className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(6,182,212,0.38)] group-hover:scale-105 transition-all duration-300"
          />
          <div className="leading-none">
            <span className="block text-xl font-black tracking-wide text-white group-hover:text-cyan-300 transition-colors">VYNORA</span>
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-[0.34em] text-cyan-400 sm:block">
              Intelligent Workforce Platform
            </span>
          </div>
        </Link>

        {/* Center: Main Nav Links */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-xs font-black uppercase tracking-wider transition-all duration-200 relative py-1.5 px-1.5 ${
                isActive(link.to)
                  ? "text-cyan-300"
                  : "text-slate-300 hover:text-cyan-200"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden items-center gap-2 xl:flex">
          <Link
            to="/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-xs font-black text-slate-100 transition-all hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-200 hover:scale-[1.02] active:scale-95"
          >
            <UserRound size={14} className="text-cyan-300" />
            Log In
          </Link>
          <Link 
            to="/register" 
            className="glow-button rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider text-white inline-flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-95"
          >
            <Sparkles size={13} />
            Get Started
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white lg:hidden cursor-pointer"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl border border-white/10 bg-[#07111F]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:hidden"
        >
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition ${
                  isActive(link.to)
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-cyan-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-3 pt-4 border-t border-white/5">
            <div className="grid gap-2 sm:grid-cols-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-black text-white hover:bg-white/5"
              >
                <UserRound size={14} className="text-cyan-300" />
                Log In
              </Link>
            </div>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="glow-button rounded-xl px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} />
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
