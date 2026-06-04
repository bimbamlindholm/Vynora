import { Clock4, Target, FileSpreadsheet, Lock, CalendarRange, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Clock4,
    title: "Seamless Time Tracking",
    text: "Record check-ins, check-outs, and breaks with a single tap. Designed to keep your workday simple and organized.",
    tone: "text-emerald-300 bg-emerald-400/10",
  },
  {
    icon: Target,
    title: "Productivity & Goals",
    text: "Set weekly productivity targets, track worked hours, and visually monitor your growth over time.",
    tone: "text-cyan-300 bg-cyan-400/10",
  },
  {
    icon: FileSpreadsheet,
    title: "Dynamic PH Deductions",
    text: "Automatically compute standard SSS, PhilHealth, Pag-IBIG contributions, and night differentials matching Philippine labour codes.",
    tone: "text-violet-300 bg-violet-400/10",
  },
  {
    icon: Lock,
    title: "Cutoff Period Locking",
    text: "Prevent backdated DTR edits and tampering once a payroll cutoff is finalized, keeping your historical records immutable.",
    tone: "text-sky-300 bg-sky-400/10",
  },
  {
    icon: CalendarRange,
    title: "Visual Shift Scheduler",
    text: "Establish custom schedules with shift colors, notes, and presets. Assign multiple shifts per date with visual templates.",
    tone: "text-amber-300 bg-amber-400/10",
  },
  {
    icon: MessageSquare,
    title: "Correction Approvals",
    text: "Seamless employee tools for correction claims and leave requests, with active real-time supervisor-to-admin routing.",
    tone: "text-rose-300 bg-rose-400/10",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 lg:p-9">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_2.05fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Why choose Vynora?</p>
            <h2 className="mt-5 max-w-md text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight text-white">
              Everything you need to <span className="text-violet-400">track</span> and{" "}
              <span className="text-cyan-300">grow.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
              Vynora is more than just a time tracker. It is your partner in building discipline, improving productivity, and achieving your goals.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text, tone }) => (
              <article
                key={title}
                className="feature-card glass-panel rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-cyan-300/30 hover:shadow-[0_0_34px_rgba(6,182,212,0.12)]"
              >
                <div className={`grid h-14 w-14 place-items-center rounded-full ${tone}`}>
                  <Icon size={27} />
                </div>
                <h3 className="mt-8 text-lg font-black text-white">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
