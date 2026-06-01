import { motion } from "framer-motion";
import { Sparkles, Eye, ShieldCheck, Target, Heart } from "lucide-react";
import VynoraNavbar from "../../components/vynora/VynoraNavbar";
import VynoraFooter from "../../components/vynora/VynoraFooter";
import PageTransition from "../../components/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50 flex flex-col justify-between">
        <div className="galaxy-bg" />
        <div className="noise-overlay" />
        
        <div>
          <VynoraNavbar />
          
          <section className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Top Heading */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                <Sparkles size={11} className="animate-pulse" />
                Who We Are
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Our Story, <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Mission & Vision</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
                Discover the engineering values and workforce principles driving Vynora's modern HR management tools.
              </p>
            </div>

            {/* Narrative Story */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden glass-panel border border-white/5 bg-slate-950/40 p-6 sm:p-8 rounded-[2.5rem] shadow-xl mb-12"
            >
              <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-cyan-500/5 filter blur-3xl pointer-events-none" />
              <h2 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Heart size={16} className="text-cyan-300" /> The Vynora Story
              </h2>
              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4">
                <p>
                  Vynora was founded with a singular, ambitious goal: to replace outdated, fragmented, and insecure attendance tracking systems with a unified, high-integrity SaaS platform. 
                </p>
                <p>
                  We recognized that modern teams deserve more than manual Excel logs, easily manipulated proxy check-ins, and complex calculations. By integrating real-time GPS geofencing, advanced on-device AI face verification, and dynamic cutoff-locking, we created a workforce platform that respects employee privacy while guaranteeing absolute operational clarity for administrators.
                </p>
                <p>
                  Today, Vynora operates globally, serving solo freelancers, small teams, and fast-growing enterprises seeking to streamline automated payroll and empower human growth.
                </p>
              </div>
            </motion.div>

            {/* Mission, Vision, and Goals Cards */}
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative overflow-hidden glass-panel border border-emerald-500/10 bg-slate-950/40 p-6 rounded-[2rem] shadow-xl hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-2xl bg-white/[0.02] border border-emerald-500/10 flex items-center justify-center text-emerald-300 mb-4 shadow-md">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Our Mission</h3>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                  To empower organizations with high-integrity, automated workforce solutions that secure DTR logs, streamline payroll, and optimize operational growth.
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative overflow-hidden glass-panel border border-cyan-500/10 bg-slate-950/40 p-6 rounded-[2rem] shadow-xl hover:border-cyan-500/20 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-2xl bg-white/[0.02] border border-cyan-500/10 flex items-center justify-center text-cyan-300 mb-4 shadow-md">
                  <Eye size={18} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Our Vision</h3>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                  To become the global standard for intelligent HR automation, trusted by teams for absolute data integrity, privacy compliance, and dynamic cloud capabilities.
                </p>
              </motion.div>

              {/* Goals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative overflow-hidden glass-panel border border-violet-500/10 bg-slate-950/40 p-6 rounded-[2rem] shadow-xl hover:border-violet-500/20 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-2xl bg-white/[0.02] border border-violet-500/10 flex items-center justify-center text-violet-300 mb-4 shadow-md">
                  <Target size={18} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Our Goals</h3>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                  Achieve zero attendance disputes, reduce payroll processing times by 95%, and maintain a reliable, high-integrity SaaS uptime of 99.99%.
                </p>
              </motion.div>
            </div>
          </section>
        </div>
        
        <VynoraFooter />
      </main>
    </PageTransition>
  );
}
