import { CheckCircle2, ShieldAlert, Sparkles, Zap } from "lucide-react";

const stats = [
  { label: "Attendance Punch Speed", value: "1-Tap", desc: "Clock in & out in less than a second", icon: Zap, color: "text-amber-400 bg-amber-400/10" },
  { label: "System Service Uptime", value: "99.9%", desc: "Highly resilient hosted Supabase DB", icon: CheckCircle2, color: "text-cyan-400 bg-cyan-400/10" },
  { label: "Security & Encryption", value: "100%", desc: "Hardened row-level database RLS", icon: ShieldAlert, color: "text-rose-400 bg-rose-400/10" },
];

function AboutUs() {
  return (
    <section id="about-us" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 z-0 h-[250px] w-[250px] rounded-full bg-violet-600/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Manifesto Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/5 px-4 py-1.5 text-xs font-bold text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.12)]">
              <Sparkles size={13} className="text-violet-300 animate-pulse" />
              About Trackly
            </div>
            
            <h2 className="mt-5 text-[clamp(2rem,3.8vw,3.2rem)] font-black leading-tight text-white">
              Attendance tracking built for <span className="gradient-text">local teams</span>
            </h2>
            
            <p className="mt-6 text-sm leading-relaxed text-slate-300">
              Trackly V3 was founded on a simple principle: **timekeeping should be bulletproof, compliant, and zero-friction.** Legacy biometric scanners are expensive, standard HR suites are clunky, and manual syncing leads to payroll errors. We bridge the gap between admins and employees with a modern Progressive Web App (PWA) that operates securely on any device.
            </p>
            
            {/* Mission, Vision, Goals Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4 flex flex-col justify-between hover:border-cyan-300/20 transition-all duration-300">
                <h4 className="text-xs font-black text-cyan-300 uppercase tracking-widest">Our Mission</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  To eliminate time-tracking friction by providing modern, lightweight, and legally compliant tools for local businesses.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4 flex flex-col justify-between hover:border-violet-500/20 transition-all duration-300">
                <h4 className="text-xs font-black text-violet-300 uppercase tracking-widest">Our Vision</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  To become the primary localized workforce platform, building absolute transparency between employers and teams.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4 flex flex-col justify-between hover:border-emerald-400/20 transition-all duration-300">
                <h4 className="text-xs font-black text-emerald-300 uppercase tracking-widest">Our Goals</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  Maintain a sub-second punching speed, provide 100% accurate PH contribution mappings, and secure data using postgres RLS locks.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Column */}
          <div className="lg:col-span-5 grid gap-5">
            {stats.map(({ label, value, desc, icon: Icon, color }) => (
              <div
                key={label}
                className="glass-panel border-white/5 bg-white/[0.01] rounded-2xl p-5 flex items-center gap-5 hover:border-cyan-300/25 transition duration-300"
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
                    {label}
                  </span>
                  <span className="block text-2xl font-black text-white mt-1">
                    {value}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1 leading-snug">
                    {desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
