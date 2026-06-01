import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Sparkles, Gift } from "lucide-react";
import { formatPeso } from "./employeeConstants";

export default function ThirteenthMonthCard({ profile }) {
  const [accrued, setAccrued] = useState(0);
  const [payslipsCount, setPayslipsCount] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchPayslipsForAccrual = async () => {
      if (!profile?.id) return;
      try {
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        const { data, error } = await supabase
          .from("payslips")
          .select(`
            id,
            regular_pay,
            payroll_batches!inner (
              start_date,
              end_date,
              status
            )
          `)
          .eq("user_id", profile.id)
          .eq("payroll_batches.status", "released")
          .gte("payroll_batches.start_date", startOfYear)
          .lte("payroll_batches.end_date", endOfYear);

        if (error) throw error;

        if (data) {
          const totalBasic = data.reduce((sum, item) => sum + Number(item.regular_pay || 0), 0);
          setAccrued(totalBasic / 12);
          setPayslipsCount(data.length);
        }
      } catch (err) {
        console.error("Error calculating 13th month accrual:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslipsForAccrual();
  }, [profile?.id]);

  const currentMonth = new Date().getMonth() + 1; // 1 to 12
  const progressPercent = Math.min(100, Math.round((currentMonth / 12) * 100));

  if (loading) {
    return (
      <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-1/3 rounded bg-white/5"></div>
          <div className="h-8 w-2/3 rounded bg-white/5"></div>
          <div className="h-2 w-full rounded bg-white/5"></div>
        </div>
      </section>
    );
  }

  // Calculate estimated December payout if we project the remaining months
  const estimatedDecPayout = accrued > 0 && payslipsCount > 0 
    ? (accrued / currentMonth) * 12 
    : 0;

  return (
    <section className="glass-panel relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-6 border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-slate-900/60 shadow-xl">
      {/* Background glowing aura */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div className="transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
            <Gift size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1.5">
              13th Month Accrual
              <Sparkles size={13} className="text-cyan-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-500 font-bold">PD 851 PHILIPPINE COMPLIANT</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            {formatPeso(accrued)}
          </p>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            accrued so far this calendar year
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
            <span>Progress to December</span>
            <span className="text-violet-400">{progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Estimations & Metadatas */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4 text-xs font-semibold">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Dec Payout</p>
            <p className="mt-1 font-black text-emerald-300">
              {estimatedDecPayout > 0 ? formatPeso(estimatedDecPayout) : "PHP 0.00"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Released Payslips</p>
            <p className="mt-1 font-black text-white">
              {payslipsCount} cutoff{payslipsCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[10px] font-bold text-slate-500 leading-normal border-t border-white/5 pt-2">
          * Computed as 1/12 of your total released basic regular pay.
        </p>
      </div>

    </section>
  );
}
