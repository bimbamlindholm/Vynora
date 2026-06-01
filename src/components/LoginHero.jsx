import { BarChart3, ShieldCheck, Sparkles, Zap } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    text: "Your account stays protected with encrypted access and careful data handling.",
  },
  {
    icon: Zap,
    title: "Track in Real-time",
    text: "Jump back into your dashboard and see your latest time records instantly.",
  },
  {
    icon: BarChart3,
    title: "Built for Productivity",
    text: "Keep your attendance, work hours, and progress moving in one place.",
  },
];

function LoginHero({ portal }) {
  return (
    <section className="login-hero order-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/5 px-4 py-2 text-xs font-bold text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.12)]">
        <Sparkles size={15} className="text-violet-300" />
        {portal.badge}
      </div>

      <h1 className="mt-6 max-w-2xl text-[clamp(2.45rem,5.2vw,4.25rem)] font-black leading-[1.08] tracking-tight text-white">
        {portal.headline}
      </h1>

      <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
        {portal.subtitle}
      </p>

      <div className="mt-8 grid gap-5">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/8 text-cyan-300 shadow-[0_0_28px_rgba(6,182,212,0.12)]">
              <Icon size={26} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{title}</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LoginHero;
