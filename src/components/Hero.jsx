import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Home,
  LineChart,
  Play,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap,
  Download,
  X,
  Smartphone,
  Laptop,
} from "lucide-react";

const benefits = [
  { icon: ShieldCheck, title: "Secure & Private", text: "Your data is safe with us." },
  { icon: Zap, title: "Real-time Tracking", text: "Accurate time logs in real-time." },
  { icon: BarChart3, title: "Productivity Insights", text: "Reports that help you grow every day." },
];



function ProgressRing({ small = false, percentage = 91 }) {
  const radius = small ? 28 : 45;
  const stroke = small ? 4 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative grid shrink-0 place-items-center ${small ? "h-20 w-20" : "h-32 w-32 sm:h-36 sm:w-36"}`}>
      <svg className="h-full w-full transform -rotate-90">
        <circle
          fill="transparent"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={small ? 40 : 64}
          cy={small ? 40 : 64}
        />
        <circle
          fill="transparent"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={small ? 40 : 64}
          cy={small ? 40 : 64}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-[0.55rem] font-semibold text-slate-500 uppercase tracking-wider leading-none">Present</p>
        <strong className={`${small ? "text-xs" : "text-lg"} block font-black text-white mt-0.5`}>{percentage}%</strong>
        <span className="text-[0.5rem] text-slate-400">22 / 24</span>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto w-full max-w-[660px]"
    >
      <div className="absolute -inset-10 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="glass-panel relative overflow-hidden rounded-[1.65rem] border-cyan-300/30 p-3 shadow-[0_0_60px_rgba(6,182,212,0.16)] sm:p-4">
        <div className="grid min-h-[430px] grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-[1.25rem] bg-[#08101F]/80 p-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5 sm:p-5">
          <aside className="flex flex-col justify-between border-r border-white/5 pr-3">
            <div>
              <div className="mb-7 flex items-center gap-2">
                <img src="/vynora-logo.png" alt="" className="h-7 w-7 object-contain" />
                <span className="hidden text-sm font-black text-white sm:inline uppercase">VYNORA V3</span>
              </div>
              <div className="space-y-2">
                {[
                  [Home, "Dashboard", true],
                  [Clock3, "Time Tracker"],
                  [CalendarDays, "Attendance"],
                  [LineChart, "Reports"],
                  [Settings, "Settings"],
                ].map(([Icon, label, active]) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold ${
                      active ? "bg-gradient-to-r from-violet-600 to-cyan-400 text-white" : "text-slate-400"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-xl bg-white/[0.04] p-2 sm:flex">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 to-violet-500" />
              <div>
                <p className="text-[0.66rem] font-bold text-white">John D.</p>
                <p className="text-[0.58rem] text-slate-500">Admin</p>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">Dashboard</h2>
                <p className="text-xs text-slate-400">Welcome back, Admin!</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.68rem] font-semibold text-slate-300">
                May 29, 2026
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-xs font-bold text-white">Today's Status</span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[0.65rem] font-bold text-emerald-300">
                      91% Present
                    </span>
                  </div>
                  <div className="grid gap-4 border-t border-white/5 pt-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Live Workspace Code</p>
                      <strong className="text-white tracking-widest font-mono">TRK-48291</strong>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">PH Deductions Model</p>
                      <strong className="text-white">SSS, Pag-IBIG, PhilHealth</strong>
                    </div>
                  </div>
                </div>
                <ProgressRing />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Invite Employee", "Approve DTR", "Calculate Payroll"].map((label, index) => (
                <button
                  key={label}
                  className={`rounded-xl border px-2 py-3 text-[10px] font-bold ${
                    index === 0
                      ? "border-emerald-400/20 bg-emerald-400/15 text-emerald-300"
                      : index === 1
                        ? "border-yellow-400/20 bg-yellow-400/12 text-yellow-300"
                        : "border-sky-400/20 bg-sky-400/12 text-sky-300"
                  }`}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="glass-panel mt-4 rounded-2xl p-4">
              <h3 className="mb-3 text-sm font-bold text-white">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  ["John Doe", "Timed In", "8:02 AM", "text-emerald-300"],
                  ["Vince Diaz", "Break Out", "12:45 PM", "text-sky-300"],
                  ["John Doe", "Timed Out", "5:00 PM", "text-rose-300"]
                ].map(([label, action, time, color]) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{label}</span>
                    <span className={`font-semibold ${color}`}>{action}</span>
                    <span className="text-slate-300">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

    </motion.div>
  );
}

function Hero() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:pb-24">
      <div className="relative z-10 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/5 px-4 py-2 text-xs font-bold text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.12)] lg:mx-0"
        >
          <Sparkles size={15} className="text-violet-300" />
          Smart Time Tracking, Simplified
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.75 }}
          className="mt-7 text-5xl font-black leading-[1.02] tracking-tight text-white sm:mt-8 sm:text-6xl lg:text-[6.85rem] lg:leading-[0.95]"
        >
          Track Time.
          <br />
          <span className="gradient-text">Grow</span> Better.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0"
        >
          Vynora helps individuals and teams track attendance, manage work hours, and grow productivity - all in one beautifully simple platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-8 grid gap-4 sm:mx-auto sm:mt-9 sm:max-w-xl sm:grid-cols-[1fr_auto] lg:mx-0"
        >
          <Link to="/choose-account-type" className="glow-button group flex h-16 items-center justify-center gap-4 rounded-xl px-7 text-base font-black text-white">
            Get Started for Free
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-cyan-500 transition group-hover:translate-x-1">
              <Play size={17} fill="currentColor" />
            </span>
          </Link>
          <button
            onClick={handleInstallClick}
            className="flex h-16 items-center justify-center gap-4 rounded-xl border border-cyan-300/30 bg-white/[0.03] px-7 text-base font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:shadow-[0_0_28px_rgba(6,182,212,0.16)]"
            type="button"
          >
            {isInstallable ? "Install App Now" : "Download App"}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-cyan-300">
              <Download size={16} />
            </span>
          </button>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3 lg:max-w-[620px]">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 text-left">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300 shadow-[0_0_24px_rgba(45,212,191,0.12)]">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:-mr-6 xl:-mr-16">
        <DashboardMockup />
      </div>
    </section>

    {/* PWA Guidance Modal */}
    <AnimatePresence>
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-panel relative w-full max-w-[520px] rounded-[2rem] border-cyan-500/30 bg-[#07111F]/90 p-6 text-left shadow-[0_0_80px_rgba(6,182,212,0.25)] sm:p-8 overflow-hidden"
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 text-sm font-black text-white shadow-lg">
                T
              </span>
              <div>
                <h3 className="text-xl font-black text-white">Download Vynora App</h3>
                <p className="text-xs text-slate-400">Run Vynora V3 natively on your desktop or mobile</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300">
                  <Laptop size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Desktop (Chrome, Edge, Opera)</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Look for the <strong className="text-cyan-300">Install icon (⊕)</strong> in the top-right of your browser's address bar next to the bookmark star, and click it to download the native app.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mobile Devices</h4>
                  <ul className="mt-1.5 space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-violet-400">•</span>
                      <span><strong>iOS Safari:</strong> Tap the Share button <strong className="text-white">📤</strong> in Safari, then scroll down and select <strong className="text-violet-300">Add to Home Screen</strong>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-violet-400">•</span>
                      <span><strong>Android Chrome:</strong> Tap the Menu button <strong className="text-white">⋮</strong> in Chrome, then choose <strong className="text-cyan-300">Add to Home screen</strong> or <strong className="text-cyan-300">Install app</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="glow-button flex h-11 items-center justify-center rounded-xl px-6 text-xs font-bold text-white"
              >
                Got It, Thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

export default Hero;
