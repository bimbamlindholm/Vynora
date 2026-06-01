import { motion } from "framer-motion";
import { UserPlus, Globe, Mail, Clock, ShieldCheck, Sparkles } from "lucide-react";
import VynoraNavbar from "../../components/vynora/VynoraNavbar";
import VynoraFooter from "../../components/vynora/VynoraFooter";
import PageTransition from "../../components/PageTransition";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    desc: "Register a secure administrator profile or sign up as an employee. Standard 2FA keeps your portal safe from start.",
    color: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/10"
  },
  {
    step: "02",
    icon: Globe,
    title: "Create Workspace",
    desc: "Establish your custom workspace dashboard, define working hours, configure SSS/PhilHealth settings, and map geofences.",
    color: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/10"
  },
  {
    step: "03",
    icon: Mail,
    title: "Invite Employees",
    desc: "Invite supervisors, supervisors, and employees to connect. Share workspace secure codes or register employee emails directly.",
    color: "from-indigo-500 to-violet-500",
    shadow: "shadow-indigo-500/10"
  },
  {
    step: "04",
    icon: Clock,
    title: "Track Attendance",
    desc: "Employees clock in with AI Face Verification or GPS verification. Real-time shifts, grace periods, and undertime are calculated.",
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/10"
  },
  {
    step: "05",
    icon: ShieldCheck,
    title: "Release Payslips",
    desc: "Admins review attendance breakdowns, lock calculations, and type RELEASE to authorize and send payslips securely.",
    color: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/10"
  }
];

export default function HowItWorksPage() {
  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50 flex flex-col justify-between">
        <div className="galaxy-bg" />
        <div className="noise-overlay" />
        
        <div>
          <VynoraNavbar />
          
          <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Top Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                <Sparkles size={11} className="animate-pulse" />
                Operational Workflow
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Simple Setup. <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Powerful Operations.</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Explore the five straightforward steps connecting Workspace Administrators and Employees on Vynora.
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="relative space-y-12 before:absolute before:inset-0 before:left-8 sm:before:left-1/2 before:w-0.5 before:bg-white/5 before:pointer-events-none">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-12 relative w-full ${
                      isEven ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Centered Node Icon */}
                    <div className="absolute left-8 sm:left-1/2 -translate-x-[15px] sm:-translate-x-1/2 top-2 h-8 w-8 rounded-full border-2 border-[#07111F] bg-slate-950 flex items-center justify-center z-20 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                      <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>

                    {/* Step Card Content */}
                    <div className="w-full sm:w-[calc(50%-2rem)] ml-14 sm:ml-0">
                      <div className={`relative overflow-hidden glass-panel border border-white/5 bg-slate-950/40 p-6 rounded-[2rem] shadow-xl hover:border-cyan-500/20 transition duration-300 ${item.shadow}`}>
                        {/* Background subtle color */}
                        <div className={`absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br ${item.color} opacity-5 filter blur-3xl`} />
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className={`h-11 w-11 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-cyan-300 shadow-md`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.step}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    
                    {/* Empty balancing column for alignment */}
                    <div className="hidden sm:block w-[calc(50%-2rem)]" />
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
