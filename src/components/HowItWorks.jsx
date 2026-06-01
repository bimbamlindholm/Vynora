import { UserPlus, Settings, Share2, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Select Portal Mode",
    text: "Select whether you are managing an organization (Admin), clocking in under a company (Employee), or tracking work solo (Personal).",
    glow: "rgba(168,85,247,0.15)", // violet
    accent: "text-violet-400",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure Rules",
    text: "Admins establish custom payroll cutoff dates, geofence radius coordinates, overtime thresholds, and statutory PH deduction metrics.",
    glow: "rgba(6,182,212,0.15)", // cyan
    accent: "text-cyan-400",
  },
  {
    number: "03",
    icon: Share2,
    title: "Link Employees",
    text: "Admins share a unique workspace code. Employees input the code on their dashboard to inherit shifting rules and geofence locations.",
    glow: "rgba(16,185,129,0.15)", // emerald
    accent: "text-emerald-400",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Secure & Payroll",
    text: "Log attendance with live AI Face Matching. Admins approve corrections, lock cutting periods, and release payslips cleanly.",
    glow: "rgba(14,165,233,0.15)", // sky
    accent: "text-sky-400",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">How to get started</p>
        <h2 className="mt-4 text-[clamp(2.1rem,4vw,3.6rem)] font-black leading-tight text-white">
          Simple and direct <span className="gradient-text">timekeeping</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-400">
          Get your team set up and logging hours in less than five minutes.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ number, icon: Icon, title, text, glow, accent }, idx) => (
          <article
            key={title}
            className="group relative glass-panel rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-cyan-300/35 hover:shadow-[0_0_34px_rgba(6,182,212,0.12)]"
            style={{ "--glow-color": glow }}
          >
            {/* Number background badge */}
            <span className="absolute top-4 right-6 text-5xl font-black text-white/[0.03] select-none group-hover:text-cyan-300/[0.04] transition">
              {number}
            </span>

            {/* Icon */}
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-white/[0.03] border border-white/5 ${accent}`}>
              <Icon size={22} />
            </div>

            {/* Content */}
            <h3 className="mt-8 text-lg font-black text-white group-hover:text-cyan-200 transition">
              {title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-400 group-hover:text-slate-300 transition">
              {text}
            </p>

            {/* Connector arrow for larger screens (hidden on last step & mobile) */}
            {idx < 3 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20 text-slate-600 font-bold text-xl pointer-events-none select-none">
                →
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
