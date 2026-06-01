import { motion } from "framer-motion";
import { Check, Sparkles, Shield, User, Landmark } from "lucide-react";
import VynoraNavbar from "../../components/vynora/VynoraNavbar";
import VynoraFooter from "../../components/vynora/VynoraFooter";
import PageTransition from "../../components/PageTransition";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Solo Tracker",
    icon: User,
    price: "PHP 0",
    period: "forever free",
    desc: "Perfect for freelancers and solo professionals managing personal timesheets and invoices.",
    features: [
      "Manual time tracking",
      "Shift schedule organizer",
      "DTR spreadsheet logging",
      "Personal PDF invoice exports",
      "Baseline productivity analytics",
      "Standard client support"
    ],
    highlight: false,
    glow: "rgba(255,255,255,0.02)",
    border: "border-white/5",
    btnText: "Start Free",
    to: "/register"
  },
  {
    name: "Solo Pro",
    icon: Sparkles,
    price: "PHP 149",
    period: "per month",
    desc: "Advanced time, metrics, and premium exports designed for independent professionals.",
    features: [
      "All Solo Tracker features",
      "Advanced salary estimations",
      "Dynamic earnings dashboard",
      "Export premium watermarked PDFs",
      "Custom deductions manager",
      "High-priority client support"
    ],
    highlight: false,
    glow: "rgba(16,185,129,0.05)",
    border: "border-emerald-500/20",
    btnText: "Upgrade Solo",
    to: "/register"
  },
  {
    name: "Workspace Premium",
    icon: Landmark,
    price: "PHP 299",
    period: "per month",
    desc: "Enterprise-grade suite for organizations connecting Workspace Admins and Employees.",
    features: [
      "Unlimited employee sync",
      "AI Face Verification check-in",
      "GPS Geofencing office zones",
      "Automated Philippine payroll",
      "Official payslip release engine",
      "System audit logging",
      "Cutoff locking mechanics",
      "24/7 Dedicated account manager"
    ],
    highlight: true,
    glow: "rgba(6,182,212,0.12)",
    border: "border-cyan-500/30",
    btnText: "Launch Premium Workspace",
    to: "/choose-account-type"
  }
];

export default function PricingPage() {
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
                Subscription Plans
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Flexible Plans for <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Teams & Solo Professionals</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                No hidden setup fees. Scale, downgrade, or cancel your workspace subscription tier instantly at any time.
              </p>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="grid gap-6 lg:grid-cols-3 items-stretch max-w-6xl mx-auto">
              {plans.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative overflow-hidden glass-panel border ${feat.border} p-6 sm:p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl transition-all duration-300 ${
                      feat.highlight
                        ? "border-cyan-500/35 bg-gradient-to-br from-slate-950 via-slate-900/60 to-cyan-950/20 scale-[1.03] lg:-translate-y-2 ring-1 ring-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
                        : "bg-slate-950/40 hover:border-cyan-500/20"
                    }`}
                    style={{
                      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.25), inset 0 0 50px ${feat.glow}`
                    }}
                  >
                    {feat.highlight && (
                      <div className="absolute top-4 right-4 text-[9px] font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <Sparkles size={9} /> Recommended
                      </div>
                    )}
                    
                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-2xl bg-white/[0.02] border ${feat.border} flex items-center justify-center ${feat.highlight ? 'text-cyan-300' : 'text-slate-400'}`}>
                          <Icon size={18} />
                        </div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider">
                          {feat.name}
                        </h2>
                      </div>
                      
                      {/* Price Section */}
                      <div className="mt-6 flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{feat.price}</span>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{feat.period}</span>
                      </div>
                      
                      <p className="mt-4 text-xs leading-relaxed text-slate-400">
                        {feat.desc}
                      </p>

                      {/* Features List */}
                      <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Includes:</h3>
                        {feat.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <div className={`h-4 w-4 shrink-0 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-300 mt-0.5`}>
                              <Check size={10} />
                            </div>
                            <span className="leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <Link
                        to={feat.to}
                        className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition duration-300 active:scale-98 ${
                          feat.highlight
                            ? "glow-button text-white shadow-lg shadow-cyan-500/15"
                            : "border border-white/10 bg-white/[0.02] text-slate-100 hover:border-cyan-300/30 hover:bg-cyan-300/5 hover:text-cyan-200"
                        }`}
                      >
                        {feat.btnText}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Trusted Shield Badging */}
            <div className="mt-16 text-center flex flex-col sm:flex-row items-center justify-center gap-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <Shield size={14} className="text-cyan-400" />
              <span>All payments processed securely. Dynamic subscription upgrades take effect instantly.</span>
            </div>
          </section>
        </div>
        
        <VynoraFooter />
      </main>
    </PageTransition>
  );
}
