import { useState } from "react";
import { X, Sparkles } from "lucide-react";

/**
 * Modal that guides users through a simulated premium checkout playground to unlock
 * Vynora Premium benefits (real-time earnings calculation, PDF payslip downloads, analytics, etc.)
 */
export default function EmployeeCheckoutModal({ profile, onClose, onSuccess }) {
  const [billing, setBilling] = useState("yearly"); // monthly | yearly | twoYears | lifetime
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [step, setStep] = useState(0); // 0: idle, 1, 2, 3

  const employeePlans = {
    monthly: { label: "Monthly", price: 49, desc: "Cancel anytime. Billed monthly.", period: "/ month" },
    yearly: { label: "1 Year", price: 399, desc: "Save 32%. Best value.", period: "/ year", popular: true },
    twoYears: { label: "2 Years", price: 699, desc: "Save 40%. Extended peace of mind.", period: "/ 2 years" },
    lifetime: { label: "Lifetime", price: 1499, desc: "Zero future fees. Pay once, use forever.", period: "one-time payment" },
  };

  const handleSimulatedCheckout = () => {
    setIsUpgrading(true);
    setStep(1);

    setTimeout(() => {
      setStep(2);
      setTimeout(() => {
        setStep(3);
        setTimeout(() => {
          localStorage.setItem("vynora_sub_" + profile.id, "true");
          window.dispatchEvent(new Event("vynora_subscription_changed"));
          setIsUpgrading(false);
          setStep(0);
          onSuccess();
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const selectedPlan = employeePlans[billing];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-3 backdrop-blur-sm sm:p-4">
      <div className="glass-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6 relative bg-slate-950/90 border border-white/10">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-amber-400">👑</span> Upgrade to Premium Access
          </h2>
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white" onClick={onClose} type="button" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content grid */}
        <div className="grid gap-6 md:grid-cols-12 items-stretch">
          {/* Plan Selector */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-4">Choose a flexible billing duration that works best for you.</p>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(employeePlans).map(([key, plan]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBilling(key)}
                    className={`relative text-left p-4 rounded-xl border transition-all duration-300 ${
                      billing === key
                        ? "border-amber-400 bg-amber-400/[0.04] shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-amber-400 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                        Recommended
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{plan.label}</span>
                      {billing === key && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />}
                    </div>
                    <p className="text-xl font-black text-white mt-1.5">
                      ₱{plan.price.toLocaleString("en-US")}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">{plan.period}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-5">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Upgrade Option</p>
                  <p className="text-xs font-black text-white mt-0.5">{selectedPlan.label} Premium</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-amber-300">₱{selectedPlan.price.toLocaleString("en-US")}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{selectedPlan.period}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulatedCheckout}
                disabled={isUpgrading}
                className="glow-button w-full h-11 rounded-xl text-xs font-black text-slate-950 transition flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:shadow-lg hover:shadow-amber-500/20 font-bold cursor-pointer"
              >
                {isUpgrading ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    Connecting Payment...
                  </>
                ) : (
                  `Upgrade & Unlock Premium Access`
                )}
              </button>
            </div>
          </div>

          {/* Premium features lists */}
          <div className="md:col-span-5 border-t border-white/5 md:border-t-0 md:border-l md:border-white/5 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" />
                Premium Features Unlocked
              </h3>
              <ul className="space-y-3 text-xs font-semibold text-slate-300">
                {[
                  "Track real-time accumulated basic salary & compliance earnings",
                  "Download, view, and print official PDF payslips directly from cutoff history",
                  "Enable advanced real-time attendance insights & analytics summary",
                  "Ad-free seamless dashboard operations",
                ].map((feat, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-amber-400 font-black">✓</span>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 text-[9px] text-slate-500 leading-normal font-bold">
              🛡️ Fully simulated checkout playground. Instantly activates premium license locally.
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Checkout Loader Overlay */}
      {isUpgrading && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-panel border-amber-400/40 shadow-[0_0_80px_rgba(245,158,11,0.2)] max-w-sm w-full p-8 rounded-3xl text-center bg-slate-900">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-amber-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-white/5 border-b-violet-400 animate-spin duration-700" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">💳</div>
            </div>

            <h3 className="text-lg font-black text-white">Simulated Payment</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 justify-center text-xs font-semibold">
                <span className={step >= 1 ? "text-amber-300 font-bold" : "text-slate-500"}>
                  {step >= 1 ? "✓" : "○"} Connecting to simulated gateway...
                </span>
              </div>
              <div className="flex items-center gap-3 justify-center text-xs font-semibold">
                <span className={step >= 2 ? "text-amber-300 font-bold font-black animate-pulse" : "text-slate-500"}>
                  {step >= 2 ? "✓" : "○"} Unlocking Premium features...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
