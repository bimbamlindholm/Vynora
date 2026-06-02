import { useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Menu, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = ["Features", "How It Works", "Pricing", "About Us", "Contact"];
const loginTypes = [
  { icon: UserRound, label: "Personal", to: "/personal-login" },
  { icon: BriefcaseBusiness, label: "Workspace", to: "/workspace-login" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07111F]/65 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Vynora home">
          <img
            src="/vynora-logo.png"
            alt="Vynora"
            className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(45,212,191,0.38)]"
          />
          <div className="leading-none">
            <span className="block text-xl font-black tracking-wide text-white">VYNORA</span>
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-[0.34em] text-cyan-300 sm:block">
              Track Time. Grow Better.
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
              className="text-sm font-semibold text-slate-200 transition hover:text-cyan-300"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          {loginTypes.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs font-black text-slate-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <Icon size={15} className="text-cyan-300" />
              {label}
            </Link>
          ))}
          <Link to="/choose-account-type" className="glow-button rounded-xl px-6 py-3 text-sm font-bold text-white">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl border border-white/10 bg-[#0B1020]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:hidden"
        >
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-cyan-300"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {loginTypes.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-black text-white"
                >
                  <Icon size={15} className="text-cyan-300" />
                  {label}
                </Link>
              ))}
            </div>
            <Link
              to="/choose-account-type"
              onClick={() => setIsOpen(false)}
              className="glow-button rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

export default Navbar;
