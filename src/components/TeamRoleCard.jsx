import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

function TeamRoleCard({
  accent = "cyan",
  buttonLabel,
  description,
  features,
  icon: Icon,
  title,
  to,
}) {
  const isCyan = accent === "cyan";
  const cardTone = isCyan
    ? "border-cyan-300/55 shadow-[0_0_54px_rgba(6,182,212,0.16)] hover:shadow-[0_0_72px_rgba(6,182,212,0.24)]"
    : "border-violet-400/55 shadow-[0_0_54px_rgba(124,58,237,0.18)] hover:shadow-[0_0_72px_rgba(124,58,237,0.28)]";
  const iconTone = isCyan
    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-300 shadow-[0_0_42px_rgba(6,182,212,0.25)]"
    : "border-violet-400/40 bg-violet-400/10 text-violet-300 shadow-[0_0_42px_rgba(124,58,237,0.28)]";
  const checkTone = isCyan ? "text-teal-300" : "text-violet-300";
  const buttonTone = isCyan
    ? "bg-gradient-to-r from-violet-600 via-cyan-500 to-teal-400"
    : "bg-gradient-to-r from-violet-700 via-purple-600 to-cyan-500";

  return (
    <article
      className={`glass-panel flex min-h-[460px] flex-col rounded-[1.75rem] p-7 text-center transition duration-300 hover:-translate-y-2 sm:p-9 ${cardTone}`}
    >
      <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full border ${iconTone}`}>
        <Icon size={44} />
      </div>

      <h2 className="mt-8 text-2xl font-black text-white">{title}</h2>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-300 sm:text-base">{description}</p>

      <div className="mt-7 grid gap-3 border-y border-white/10 py-6 text-left">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm text-slate-300 sm:text-base">
            <CheckCircle2 className={`mt-0.5 shrink-0 ${checkTone}`} size={20} />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Link
        to={to}
        className={`${buttonTone} group relative mt-7 flex h-[60px] w-full items-center justify-center rounded-xl px-5 text-sm font-black text-white shadow-[0_18px_44px_rgba(6,182,212,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(124,58,237,0.25)] sm:text-base`}
      >
        {buttonLabel}
        <span className={`absolute right-5 grid h-10 w-10 place-items-center rounded-full bg-white transition group-hover:translate-x-1 ${isCyan ? "text-cyan-500" : "text-violet-600"}`}>
          <ArrowRight size={19} />
        </span>
      </Link>
    </article>
  );
}

export default TeamRoleCard;
