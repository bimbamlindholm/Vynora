import { BarChart3, Rocket, ShieldCheck, Zap } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    text: "Your data is encrypted and secure with enterprise-grade protection.",
  },
  {
    icon: Zap,
    title: "Fast & Simple",
    text: "Create your account in seconds and get started right away.",
  },
  {
    icon: BarChart3,
    title: "Built for Productivity",
    text: "Powerful tools to help you stay on track and achieve more.",
  },
];

function RegisterHero() {
  return (
    <section className="order-2 lg:order-1">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/5 px-4 py-2 text-xs font-bold text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.12)]">
        <Rocket size={15} className="text-violet-300" />
        Start Tracking. Start Growing.
      </div>

      <h1 className="mt-7 max-w-2xl text-[clamp(2.65rem,6vw,4.5rem)] font-black leading-[1.08] tracking-tight text-white">
        Create your account
        <br />
        and <span className="gradient-text">take control</span>
        <br />
        of your time.
      </h1>

      <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
        Join Vynora and experience a smarter way to track attendance, manage work hours, and boost your productivity.
      </p>

      <div className="mt-10 grid gap-7">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/8 text-cyan-300 shadow-[0_0_28px_rgba(6,182,212,0.12)]">
              <Icon size={30} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">{title}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400 sm:text-base">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RegisterHero;
