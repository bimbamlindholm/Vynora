import { useState } from "react";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const durations = [
  { id: "monthly", label: "Monthly", badge: null },
  { id: "yearly", label: "Yearly Saver", badge: "20% OFF" },
];

const plans = [
  {
    name: "Solo Tracker",
    desc: "Perfect for individual shift workers, freelancers, or students to log hours.",
    prices: {
      monthly: 0,
      yearly: 0,
    },
    periodText: {
      monthly: "/ month",
      yearly: "/ year",
    },
    features: [
      { text: "1-Tap Clock-in & Clock-out", included: true },
      { text: "Save schedules & shift rosters", included: true },
      { text: "PWA Mobile & Desktop Access", included: true },
      { text: "Real-time Gross Estimated Pay", included: false },
      { text: "Export personal DTR timesheets", included: false },
    ],
    popular: false,
    cta: "Get Started Free",
    to: "/choose-account-type",
  },
  {
    name: "Solo Pro",
    desc: "Designed for solo professionals seeking automated accumulated wage tracking.",
    prices: {
      monthly: 99,
      yearly: 799,
    },
    periodText: {
      monthly: "/ month",
      yearly: "/ year",
    },
    features: [
      { text: "1-Tap Clock-in & Clock-out", included: true },
      { text: "Save schedules & shift rosters", included: true },
      { text: "PWA Mobile & Desktop Access", included: true },
      { text: "Real-time Gross Estimated Pay", included: true },
      { text: "Export personal DTR timesheets", included: true },
    ],
    popular: false,
    cta: "Upgrade to Solo Pro",
    to: "/choose-account-type",
  },
  {
    name: "Workspace Premium",
    desc: "Full organization controls. Employees inherit premium access automatically if linked to this workspace.",
    prices: {
      monthly: 999,
      yearly: 7990,
    },
    periodText: {
      monthly: "/ month",
      yearly: "/ year",
    },
    features: [
      { text: "Admin Management Dashboard", included: true },
      { text: "All employees inherit Premium Pay access", included: true },
      { text: "SSS, PhilHealth, Pag-IBIG automatic calculations", included: true },
      { text: "GPS Geofencing & AI Face biometrics", included: true },
      { text: "Visual calendar multiple shifts/templates", included: true },
    ],
    popular: true,
    cta: "Activate Workspace Pro",
    to: "/choose-account-type",
  },
];

function Pricing() {
  const [billing, setBilling] = useState("monthly"); // monthly | yearly

  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Simple Pricing Plans</p>
        <h2 className="mt-4 text-[clamp(2.1rem,4vw,3.6rem)] font-black leading-tight text-white">
          Transparent plans for <span className="gradient-text">every team size</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-400">
          From individual shift tracking to fully automated corporate payroll timesheets.
        </p>

        {/* Duration switcher */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex p-1 glass-panel border-white/5 bg-white/[0.02] rounded-full gap-1">
            {durations.map(({ id, label, badge }) => (
              <button
                key={id}
                onClick={() => setBilling(id)}
                className={`relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 ${
                  billing === id
                    ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
                {badge && (
                  <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    billing === id
                      ? "bg-white/20 text-white"
                      : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 animate-pulse"
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 items-stretch md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map(({ name, prices, desc, features, popular, cta, to, periodText }) => {
          const currentPrice = prices[billing];
          const currentPeriodText = periodText[billing];

          return (
            <article
              key={name}
              className={`relative flex flex-col rounded-3xl p-6 sm:p-8 transition duration-300 ${
                popular
                  ? "glass-panel border-cyan-400/40 bg-white/[0.025] shadow-[0_0_80px_rgba(6,182,212,0.18)] border-2 scale-102"
                  : "glass-panel border-white/5 bg-white/[0.01]"
              }`}
            >
              {/* Featured Badge */}
              {popular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-cyan-500/20 shrink-0">
                  Best For Organizations
                </span>
              )}

              {/* Title & Desc */}
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">{name}</h3>
                  <p className="mt-4 text-xs leading-relaxed text-slate-400 min-h-[40px]">{desc}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline text-white">
                    <span className="text-[2.2rem] sm:text-[2.5rem] font-black tracking-tight leading-none">
                      ₱{currentPrice.toLocaleString("en-US")}
                    </span>
                    <span className="ml-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {currentPeriodText}
                    </span>
                  </div>

                  {billing === "yearly" && currentPrice > 0 && (
                    <p className="mt-2 text-[10px] font-bold text-cyan-300 animate-fadeIn uppercase tracking-wide">
                      Billed annually (₱{currentPrice.toLocaleString("en-US")} total)
                    </p>
                  )}

                  {/* Divider */}
                  <div className="my-6 h-px bg-white/10" />

                  {/* Features */}
                  <ul className="space-y-3.5 text-xs">
                    {features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" size={14} />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-slate-600 mt-0.5" size={14} />
                        )}
                        <span className={`leading-tight ${feature.included ? "text-slate-300" : "text-slate-500 line-through"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    to={to}
                    className={`block w-full rounded-xl py-3.5 text-center text-xs font-black transition ${
                      popular
                        ? "glow-button text-white"
                        : "border border-white/10 bg-white/[0.035] text-slate-100 hover:border-cyan-300/40 hover:bg-cyan-300/5 hover:text-cyan-200"
                    }`}
                  >
                    {cta}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Pricing;
