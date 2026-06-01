import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, getRedirectPathByRole } from "../contexts/AuthContext";
import VynoraNavbar from "../components/vynora/VynoraNavbar";
import VynoraFooter from "../components/vynora/VynoraFooter";
import PageTransition from "../components/PageTransition";
import SkeletonLoader from "../components/SkeletonLoader";
import { Sparkles, Shield, Clock, BarChart3, CloudLightning, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!role) {
        navigate("/complete-registration", { replace: true });
      } else {
        navigate(getRedirectPathByRole(role), { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <PageTransition>
      <main className="relative min-h-screen lg:h-screen lg:overflow-hidden bg-[#07111F] text-slate-50 flex flex-col justify-between select-none">
        {/* Futuristic Backgrounds */}
        <div className="galaxy-bg" />
        <div className="noise-overlay" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 filter blur-[120px] pointer-events-none" />

        {/* 1. Navbar */}
        <VynoraNavbar />

        {/* 2. Main One-Screen Hero Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-8 lg:py-0">
          <div className="w-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 px-6 sm:px-12 xl:px-24 items-center h-full">
            
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-5 lg:space-y-6 w-full mb-10 lg:mb-0">
              {/* Intelligent Platform Badge */}
              <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[9px] sm:text-[10px] font-black tracking-widest text-cyan-300 uppercase shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Sparkles size={11} className="animate-pulse text-cyan-300" />
                Intelligent Workforce Platform
              </div>

              {/* Bold Headlines */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight select-none">
                Track Time. <br className="hidden sm:inline" />
                Empower People. <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(34,211,238,0.2)]">
                  Elevate Growth.
                </span>
              </h1>

              {/* Tagline Description */}
              <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-lg select-none">
                Vynora helps teams track attendance, manage work hours, automate payroll, and boost productivity — all in one secure and intelligent platform.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/register"
                  className="glow-button inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-95"
                >
                  Get Started for Free
                  <ArrowRight size={13} />
                </Link>
                <Link
                  to="/features"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-300/30 hover:bg-cyan-300/5 hover:text-cyan-200 px-6 text-xs font-black uppercase tracking-wider text-slate-200 transition hover:scale-[1.02] active:scale-95"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Dashboard Mockup & Mobile Overlay */}
            <div className="lg:col-span-7 flex relative items-center justify-center h-full max-h-[440px] xl:max-h-[480px] w-full px-4 select-none">
              
              {/* A. PREMIUM ADMIN DASHBOARD PREVIEW MOCKUP */}
              <div className="relative overflow-hidden w-full max-w-[550px] aspect-[1.6] rounded-[2rem] border border-white/10 bg-[#0B1424]/90 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex select-none">
                {/* Orbital glow inner aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                
                {/* 1. Sidebar Panel */}
                <div className="w-16 sm:w-20 bg-slate-950/60 border-r border-white/5 p-3 flex flex-col items-center justify-between shrink-0">
                  <div className="flex flex-col gap-4 items-center w-full">
                    {/* Logo in Mockup */}
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-2 shadow-inner">
                      <img src="/vynora-logo.png" alt="Icon" className="h-5 w-5 object-contain" />
                    </div>
                    {/* Mock Icon items */}
                    <div className="h-6 w-full rounded-lg bg-cyan-400/10 border border-cyan-500/20" />
                    <div className="h-6 w-full rounded-lg bg-white/[0.02]" />
                    <div className="h-6 w-full rounded-lg bg-white/[0.02]" />
                    <div className="h-6 w-full rounded-lg bg-white/[0.02]" />
                  </div>
                  <div className="h-7 w-7 rounded-full bg-slate-800" />
                </div>

                {/* 2. Main content mock area */}
                <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden min-w-0">
                  {/* Top Bar inside Mockup */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 shrink-0">
                    <div>
                      <span className="block text-[8px] font-black text-cyan-400 uppercase tracking-widest leading-none">Workspace Dashboard</span>
                      <span className="block text-[11px] font-black text-white mt-1">Vynora Admin Hub</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.02] border border-white/5 text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Live
                    </div>
                  </div>

                  {/* 4 Small Metrics Cards grid */}
                  <div className="grid grid-cols-4 gap-2 shrink-0">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center shadow-md">
                      <span className="block text-[6px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Staff</span>
                      <span className="block text-xs font-black text-white truncate mt-0.5">148</span>
                    </div>
                    <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl p-2 text-center shadow-md">
                      <span className="block text-[6px] font-bold text-emerald-400/70 uppercase tracking-wider truncate">Present</span>
                      <span className="block text-xs font-black text-emerald-300 truncate mt-0.5">142</span>
                    </div>
                    <div className="bg-violet-500/[0.03] border border-violet-500/10 rounded-xl p-2 text-center shadow-md">
                      <span className="block text-[6px] font-bold text-violet-400/70 uppercase tracking-wider truncate">On Leave</span>
                      <span className="block text-xs font-black text-violet-300 truncate mt-0.5">4</span>
                    </div>
                    <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-xl p-2 text-center shadow-md">
                      <span className="block text-[6px] font-bold text-rose-400/70 uppercase tracking-wider truncate">Absent</span>
                      <span className="block text-xs font-black text-rose-300 truncate mt-0.5">2</span>
                    </div>
                  </div>

                  {/* Attendance SVGA Chart & Circular Stats */}
                  <div className="flex-1 flex gap-3 mt-3 min-h-0 items-center">
                    {/* Left side Graph */}
                    <div className="flex-1 bg-white/[0.015] border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between h-full min-w-0">
                      <span className="text-[6px] font-black text-slate-500 uppercase tracking-wider shrink-0 leading-none">Cutoff Weekly Attendance Wave</span>
                      {/* Interactive Graph Drawing */}
                      <div className="flex-1 w-full flex items-end mt-2 overflow-hidden shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="svgGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.01" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,40 Q10,12 25,18 T50,8 T75,15 T100,5 L100,40 L0,40 Z"
                            fill="url(#svgGradient)"
                          />
                          <path
                            d="M0,40 Q10,12 25,18 T50,8 T75,15 T100,5"
                            fill="none"
                            stroke="url(#svgStroke)"
                            strokeWidth="1.5"
                          />
                          <linearGradient id="svgStroke" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </svg>
                      </div>
                    </div>

                    {/* Right side circular ring stats */}
                    <div className="w-[84px] bg-white/[0.015] border border-white/5 rounded-2xl p-2.5 flex flex-col items-center justify-center shrink-0 h-full">
                      <div className="relative h-11 w-11 flex items-center justify-center">
                        {/* Circular ring SVG */}
                        <svg className="absolute h-full w-full -rotate-90">
                          <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                          <circle cx="22" cy="22" r="18" fill="transparent" stroke="#06b6d4" strokeWidth="3" strokeDasharray="113" strokeDashoffset="4" strokeLinecap="round" />
                        </svg>
                        <span className="text-[7px] font-black text-white z-10">96.4%</span>
                      </div>
                      <span className="text-[5px] font-black text-slate-500 uppercase tracking-widest mt-2 block text-center leading-none">Presence Rate</span>
                    </div>
                  </div>

                  {/* Recent DTR log widget */}
                  <div className="mt-3 shrink-0 flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[6px] text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="font-semibold truncate">DTR Clocked: **Jane Doe** timed in at Office</span>
                    </div>
                    <span className="text-slate-600 font-extrabold tracking-wider shrink-0 ml-1">8:58 AM</span>
                  </div>
                </div>
              </div>

              {/* B. SLICK MOBILE CLOCK-IN PREVIEW OVERLAY */}
              <div 
                className="absolute right-0 sm:right-6 bottom-[-24px] w-[184px] aspect-[0.55] rounded-[2rem] border border-cyan-400/30 bg-[#08101E]/95 p-3.5 shadow-[0_0_35px_rgba(6,182,212,0.25)] z-20 flex flex-col justify-between relative select-none animate-[float_4s_ease-in-out_infinite]"
                style={{
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 25px rgba(6,182,212,0.08)",
                }}
              >
                {/* Camera / Speaker Notch */}
                <div className="h-3 w-16 bg-slate-950 rounded-full mx-auto shrink-0 mb-2 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-blue-900" />
                </div>

                <div className="flex-1 flex flex-col justify-between select-none">
                  {/* Header Title inside Phone */}
                  <div className="text-center shrink-0">
                    <span className="block text-[5px] font-bold text-slate-500 uppercase tracking-[0.16em]">Vynora mobile</span>
                    <span className="block text-[8px] font-black text-white mt-0.5 tracking-wider uppercase">Biometric DTR</span>
                  </div>

                  {/* Pulsing clock checkmark widget */}
                  <div className="flex flex-col items-center justify-center flex-1 my-2">
                    <span className="text-base font-black text-white tracking-wide">11:10 AM</span>
                    <span className="text-[5px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">June 1, 2026</span>
                    
                    {/* Glowing circular node */}
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 my-2.5 shadow-[0_0_20px_rgba(16,185,129,0.25)] relative">
                      <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping opacity-75" />
                      <span className="text-base">✔</span>
                    </div>

                    <div className="space-y-1 w-full text-center">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-[5px] font-black text-emerald-300 uppercase tracking-widest">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 inline-block animate-pulse" /> GPS: Within Range
                      </span>
                      <span className="block text-[5px] text-slate-400 font-semibold truncate leading-none">AI Face Match Profile Verified</span>
                    </div>
                  </div>

                  {/* Pulsing button widget */}
                  <div className="shrink-0 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      disabled
                      className="glow-button w-full h-8 rounded-lg text-[7px] font-black uppercase tracking-widest text-white shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Clock In Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Bottom Compact Feature Strip */}
        <div className="relative z-10 w-full bg-[#07111F]/90 border-t border-white/5 py-4 no-print">
          <div className="w-full px-6 sm:px-12 xl:px-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Card 1: Secure */}
              <div className="glass-panel border-white/5 bg-slate-950/20 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md hover:border-cyan-500/20 transition-all select-none">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate">Secure & Private</h4>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider truncate">AES-256 encrypted DTR</p>
                </div>
              </div>

              {/* Card 2: Real-time */}
              <div className="glass-panel border-white/5 bg-slate-950/20 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md hover:border-emerald-500/20 transition-all select-none">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate">Real-time Sync</h4>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider truncate">Instant DTR syncing</p>
                </div>
              </div>

              {/* Card 3: Insights */}
              <div className="glass-panel border-white/5 bg-slate-950/20 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md hover:border-indigo-500/20 transition-all select-none">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                  <BarChart3 size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate">Productivity AI</h4>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider truncate">AI shift analytics</p>
                </div>
              </div>

              {/* Card 4: Cloud */}
              <div className="glass-panel border-white/5 bg-slate-950/20 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md hover:border-purple-500/20 transition-all select-none">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  <CloudLightning size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate">Cloud Powered</h4>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider truncate">99.99% global SLA uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Compact Footer */}
        <VynoraFooter />
      </main>
    </PageTransition>
  );
}
