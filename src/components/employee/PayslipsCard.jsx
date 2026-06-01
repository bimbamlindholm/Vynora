import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { EmptyState } from "./employeeComponents";

export default function PayslipsCard({ profile, onViewPayslip }) {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchPayslips = async () => {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabase
          .from("payslips")
          .select(`
            *,
            payroll_batches!inner (
              start_date,
              end_date,
              status
            )
          `)
          .eq("user_id", profile.id)
          .eq("status", "released")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPayslips(data || []);
      } catch (err) {
        console.error("Error fetching employee payslips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [profile?.id]);

  if (loading) {
    return (
      <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-black text-white sm:text-2xl">My Payslips</h2>
        <p className="mt-2 text-sm text-slate-400">Loading released payslips...</p>
      </section>
    );
  }

  return (
    <section className="glass-panel relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-6 border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-slate-900/60 shadow-xl">
      {/* Background glowing aura */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div className="transition-all duration-300">
        <h2 className="text-xl font-black text-white sm:text-2xl">My Payslips</h2>
        <div className="mt-4 grid gap-3">
          {payslips.length === 0 ? (
            <EmptyState text="No released payslips available." />
          ) : (
            payslips.map((payslip) => (
              <div
                key={payslip.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm transition hover:border-cyan-300/30 cursor-pointer"
                onClick={() => onViewPayslip(payslip)}
              >
                <div className="min-w-0">
                  <p className="font-black text-white">
                    {payslip.payroll_batches.start_date} to {payslip.payroll_batches.end_date}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Released</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-black text-cyan-300">
                    PHP {Number(payslip.net_pay).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">View Details</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </section>
  );
}
