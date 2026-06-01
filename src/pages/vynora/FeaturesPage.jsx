import { motion } from "framer-motion";
import { Camera, MapPin, CreditCard, BarChart3, Lock, Calendar, Clock, ShieldCheck, Sparkles } from "lucide-react";
import VynoraNavbar from "../../components/vynora/VynoraNavbar";
import VynoraFooter from "../../components/vynora/VynoraFooter";
import PageTransition from "../../components/PageTransition";

const features = [
  {
    icon: Camera,
    title: "AI Face Verification",
    desc: "Ensure high-integrity clock-ins with real-time, on-device AI face recognition. Anti-spoofing guarantees no proxy check-ins.",
    glow: "rgba(6,182,212,0.15)",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-300"
  },
  {
    icon: MapPin,
    title: "GPS Geofencing",
    desc: "Track accurate office or client site attendance boundaries. Dynamic range checking verifies physical employee coordinates.",
    glow: "rgba(16,185,129,0.15)",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-300"
  },
  {
    icon: CreditCard,
    title: "Auto Payroll Integration",
    desc: "Calculate SSS, PhilHealth, Pag-IBIG, overtime premiums, and custom adjustments dynamically with zero manual effort.",
    glow: "rgba(99,102,241,0.15)",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-300"
  },
  {
    icon: BarChart3,
    title: "Dynamic Analytics",
    desc: "Generate comprehensive DTR, payroll summaries, and productivity charts instantly. Export CSV/PDF formats in one click.",
    glow: "rgba(139,92,246,0.15)",
    border: "border-violet-500/20",
    iconColor: "text-violet-300"
  },
  {
    icon: Lock,
    title: "Cutoff Locking",
    desc: "Lock historical payroll periods permanently upon release. Prevent double payouts, adjustments, or proxy log overrides.",
    glow: "rgba(244,63,94,0.15)",
    border: "border-rose-500/20",
    iconColor: "text-rose-300"
  },
  {
    icon: Calendar,
    title: "Shift Scheduler",
    desc: "Schedule flexible team rosters, custom holidays, and rest days. Set employee-specific grace periods and work models.",
    glow: "rgba(245,158,11,0.15)",
    border: "border-amber-500/20",
    iconColor: "text-amber-300"
  },
  {
    icon: Clock,
    title: "Leave & Overtime Multi-approvals",
    desc: "Structured workflows for DTR corrections, leave applications, and overtime overrides. Multi-level admin approvals.",
    glow: "rgba(20,184,166,0.15)",
    border: "border-teal-500/20",
    iconColor: "text-teal-300"
  },
  {
    icon: ShieldCheck,
    title: "Granular Roles & Permissions",
    desc: "Enforce strict SaaS privacy controls. Manage supervisors, managers, admins, and custom employee module accesses.",
    glow: "rgba(59,130,246,0.15)",
    border: "border-blue-500/20",
    iconColor: "text-blue-300"
  }
];

export default function FeaturesPage() {
  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50 flex flex-col justify-between">
        <div className="galaxy-bg" />
        <div className="noise-overlay" />
        
        <div>
          <VynoraNavbar />
          
          <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Top Heading */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                <Sparkles size={11} className="animate-pulse" />
                Intelligent Feature Suite
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Empowering Teams with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Next-Gen SaaS Power</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Explore the advanced automation modules designed to streamline attendance tracking, lock down security, and automate payroll.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`relative overflow-hidden glass-panel border ${feat.border} bg-slate-950/40 p-6 rounded-[2rem] shadow-xl group hover:border-cyan-500/30 transition-all duration-300`}
                    style={{
                      boxShadow: `0 4px 30px rgba(0, 0, 0, 0.2), inset 0 0 40px ${feat.glow}`
                    }}
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-full filter blur-[40px] pointer-events-none" 
                         style={{ backgroundColor: feat.glow }} />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        {/* Glowing Icon Card */}
                        <div className={`h-11 w-11 rounded-2xl bg-white/[0.03] border ${feat.border} flex items-center justify-center ${feat.iconColor} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={20} />
                        </div>
                        
                        <h3 className="mt-5 text-sm font-black text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wider">
                          {feat.title}
                        </h3>
                        <p className="mt-3 text-xs leading-relaxed text-slate-400">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
        
        <VynoraFooter />
      </main>
    </PageTransition>
  );
}
