import { 
  Printer, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Trash2, 
  Plus, 
  X, 
  Sparkles 
} from "lucide-react";

export default function PersonalPayrollCalculator({
  payrollStart,
  setPayrollStart,
  payrollEnd,
  setPayrollEnd,
  payrollSummary,
  settings,
  payrollDeductions,
  addPayrollDeduction,
  removePayrollDeduction,
  updatePayrollDeduction,
  handlePrintPayslip,
  role = "employee",
  payslipStatus = "none",
  loadingPayslipStatus = false,
  handleRequestPayslip
}) {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden glass-panel border-white/10 bg-gradient-to-r from-slate-950/70 via-slate-900/50 to-emerald-950/20 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
              <Sparkles size={11} className="animate-pulse" />
              Premium Payroll Module
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Payslip & Cutoff Calculator</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Review your worked hours, {role === "employee" ? "request payslip release, and print/export a premium corporate PDF payslip." : "add custom deductions, and print/export a premium corporate PDF payslip."}
            </p>
          </div>
          <div className="flex items-center">
            {role === "employee" ? (
              <>
                {payslipStatus === "none" && (
                  <button
                    type="button"
                    onClick={handleRequestPayslip}
                    disabled={loadingPayslipStatus}
                    className="glow-button inline-flex items-center justify-center gap-2.5 px-6 py-4 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-[0_8px_30px_rgba(16,185,129,0.25)] w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border border-emerald-500/30 cursor-pointer"
                  >
                    {loadingPayslipStatus ? "Processing..." : "Request Payslip"}
                  </button>
                )}
                {payslipStatus === "requested" && (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-xs font-black text-amber-300 border border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)] w-full md:w-auto cursor-not-allowed"
                  >
                    <Clock size={15} className="animate-pulse" />
                    Awaiting Admin Approval
                  </button>
                )}
                {payslipStatus === "approved" && (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-xs font-black text-cyan-300 border border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.05)] w-full md:w-auto cursor-not-allowed"
                  >
                    <Clock size={15} className="animate-pulse" />
                    Awaiting Admin Release
                  </button>
                )}
                {payslipStatus === "released" && (
                  <button
                    type="button"
                    onClick={handlePrintPayslip}
                    className="glow-button inline-flex items-center justify-center gap-2.5 px-6 py-4 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-[0_8px_30px_rgba(6,182,212,0.25)] w-full md:w-auto cursor-pointer"
                  >
                    <Printer size={15} />
                    Print Payslip PDF
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handlePrintPayslip}
                className="glow-button inline-flex items-center justify-center gap-2.5 px-6 py-4 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-[0_8px_30px_rgba(6,182,212,0.25)] w-full md:w-auto cursor-pointer"
              >
                <Printer size={15} />
                Print Payslip PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cutoff Date Range Filters card */}
      <div className="glass-panel border-white/5 bg-slate-900/20 p-6 rounded-[2rem] shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-white font-extrabold text-xs tracking-wider uppercase border-b border-white/5 pb-4 mb-4">
          <Calendar size={15} className="text-emerald-400" />
          Select Pay Period Cutoff {role === "employee" && "🔒 (View Only)"}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-2 text-xs text-slate-400 font-bold">
            Start Date
            <div className="relative">
              <input
                type="date"
                id="payrollFilterStart"
                name="payrollFilterStart"
                value={payrollStart}
                disabled={role === "employee"}
                onChange={(e) => setPayrollStart(e.target.value)}
                className="h-12 w-full px-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          </label>

          <label className="grid gap-2 text-xs text-slate-400 font-bold">
            End Date
            <div className="relative">
              <input
                type="date"
                id="payrollFilterEnd"
                name="payrollFilterEnd"
                value={payrollEnd}
                disabled={role === "employee"}
                onChange={(e) => setPayrollEnd(e.target.value)}
                className="h-12 w-full px-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          </label>

          <div className="flex flex-col justify-center bg-white/[0.01] border border-white/5 rounded-2xl p-4 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] text-slate-400 leading-relaxed italic block">
              {role === "employee" 
                ? "* The payoff period date is locked and managed exclusively by your workspace administrator." 
                : "* Defaults automatically to your cutoff cycle setting (" + settings.cutoffType + ")."}
            </span>
          </div>
        </div>
      </div>

      {/* Cutoff statistics aggregates */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Days Worked */}
        <div className="relative group overflow-hidden glass-panel rounded-[1.75rem] p-5 border-white/5 bg-gradient-to-br from-slate-900/40 to-emerald-500/[0.02] flex flex-col justify-between shadow-lg hover:border-emerald-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full filter blur-[15px]" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Days Worked</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/5">
              <Calendar size={14} />
            </div>
          </div>
          <div className="mt-4">
            <span className="block text-lg sm:text-xl font-black text-white tracking-tight truncate">{payrollSummary.totalDaysWorked} Days</span>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate mt-1">Completed DTR sessions</span>
          </div>
        </div>

        {/* Card 2: Worked Hours */}
        <div className="relative group overflow-hidden glass-panel rounded-[1.75rem] p-5 border-white/5 bg-gradient-to-br from-slate-900/40 to-cyan-500/[0.02] flex flex-col justify-between shadow-lg hover:border-cyan-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full filter blur-[15px]" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Worked Hours</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/5">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-4">
            <span className="block text-lg sm:text-xl font-black text-white tracking-tight truncate">{(payrollSummary.totalWorkedMinutes / 60).toFixed(2)} hrs</span>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate mt-1">Total actual duration</span>
          </div>
        </div>

        {/* Card 3: Overtime */}
        <div className="relative group overflow-hidden glass-panel rounded-[1.75rem] p-5 border-white/5 bg-gradient-to-br from-slate-900/40 to-violet-500/[0.02] flex flex-col justify-between shadow-lg hover:border-violet-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 h-16 w-16 bg-violet-500/5 rounded-full filter blur-[15px]" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Overtime</span>
            <div className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center text-violet-400 shadow-md shadow-violet-500/5">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-4">
            <span className="block text-lg sm:text-xl font-black text-white tracking-tight truncate">{(payrollSummary.totalOvertimeMinutes / 60).toFixed(2)} hrs</span>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate mt-1">Total approved OT</span>
          </div>
        </div>

        {/* Card 4: Cutoff Lateness */}
        <div className={`relative group overflow-hidden glass-panel rounded-[1.75rem] p-5 border-white/5 flex flex-col justify-between shadow-lg transition-all duration-300 ${payrollSummary.totalLateMinutes > 0 ? 'bg-gradient-to-br from-slate-900/40 to-rose-500/[0.03] hover:border-rose-500/30' : 'bg-gradient-to-br from-slate-900/40 to-slate-500/[0.01] hover:border-white/10'}`}>
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-full filter blur-[15px]" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cutoff Lateness</span>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-md ${payrollSummary.totalLateMinutes > 0 ? 'bg-rose-500/15 border border-rose-400/20 text-rose-400' : 'bg-slate-500/10 border border-white/10 text-slate-400'}`}>
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-4">
            <span className={`block text-lg sm:text-xl font-black tracking-tight truncate ${payrollSummary.totalLateMinutes > 0 ? 'text-rose-400' : 'text-white'}`}>{payrollSummary.totalLateMinutes} mins</span>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate mt-1">Total recorded delay</span>
          </div>
        </div>
      </div>

      {/* Dual Column Layout: Earnings vs Deductions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Earnings */}
        <div className="glass-panel border-white/5 bg-slate-900/20 p-6 rounded-[2rem] shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-white font-extrabold text-xs tracking-wider uppercase border-b border-white/5 pb-3">
            <DollarSign size={15} className="text-emerald-400" />
            Earnings Breakdown
          </div>
          <div className="space-y-3 font-semibold text-xs text-slate-300">
            <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
              <span>Basic Salary (Regular Hours)</span>
              <span className="text-white font-black text-sm">PHP {payrollSummary.basicEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {payrollSummary.overtimeEarnings > 0 && (
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <span>Overtime Pay</span>
                <span className="text-white font-black text-sm">PHP {payrollSummary.overtimeEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            {payrollSummary.nightDiffEarnings > 0 && (
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <span>Night Differential Pay</span>
                <span className="text-white font-black text-sm">PHP {payrollSummary.nightDiffEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-black text-sm text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]">
              <span>Total Gross Pay</span>
              <span className="text-base font-extrabold">PHP {payrollSummary.totalGrossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Deductions spreadsheet */}
        <div className="glass-panel border-white/5 bg-slate-900/20 p-6 rounded-[2rem] shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-xs tracking-wider uppercase">
              <Trash2 size={15} className="text-rose-400" />
              Deductions & Adjustments {role === "employee" && "🔒 (View Only)"}
            </div>
            {role !== "employee" && (
              <button
                type="button"
                onClick={addPayrollDeduction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 transition cursor-pointer"
              >
                <Plus size={12} /> Add Deduction
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {/* Baseline Lateness Docking */}
            {payrollSummary.latenessDeduction > 0 && (
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs font-semibold">
                <span className="text-rose-300">Cutoff Lateness Docking</span>
                <span className="text-rose-400 font-bold">PHP {payrollSummary.latenessDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {/* Custom Dynamic Deductions list */}
            {payrollDeductions.length === 0 && payrollSummary.latenessDeduction === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 italic bg-slate-950/20 rounded-2xl border border-dashed border-white/5">
                No active deductions. {role !== "employee" ? 'Tap "Add Deduction" to create a named cutoff deduction slot.' : 'No admin-applied deductions for this cutoff period.'}
              </div>
            )}

            {payrollDeductions.map((ded) => (
              <div key={ded.id} className="flex gap-2.5 items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id={`dedName_${ded.id}`}
                    name={`dedName_${ded.id}`}
                    placeholder="e.g. SSS Loan, Uniform"
                    value={ded.name}
                    disabled={role === "employee"}
                    onChange={(e) => updatePayrollDeduction(ded.id, "name", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/40 focus:bg-slate-950 transition-all placeholder:text-slate-600 disabled:opacity-75 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="relative w-36">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">PHP</span>
                  <input
                    type="number"
                    id={`dedAmount_${ded.id}`}
                    name={`dedAmount_${ded.id}`}
                    placeholder="0.00"
                    value={ded.amount}
                    disabled={role === "employee"}
                    onChange={(e) => updatePayrollDeduction(ded.id, "amount", e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white text-right outline-none focus:border-emerald-500/40 focus:bg-slate-950 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-600 disabled:opacity-75 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                {role !== "employee" && (
                  <button
                    type="button"
                    onClick={() => removePayrollDeduction(ded.id)}
                    className="h-11 w-11 rounded-xl border border-white/10 bg-slate-950/60 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-90 transition-all shrink-0 cursor-pointer"
                    aria-label="Remove deduction"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}

            {/* Deductions aggregates summary */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 font-black text-sm text-rose-400 mt-2 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
              <span>Total Deductions</span>
              <span className="text-base font-extrabold">PHP {payrollSummary.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Hero Summary Panel */}
      <div className="relative overflow-hidden glass-panel border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/60 to-emerald-950/20 p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(16,185,129,0.08)] border-t border-white/15">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full filter blur-[60px] animate-pulse" />
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-widest">
            <Sparkles size={13} className="text-emerald-400" />
            Net Take-Home Pay
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your final {role === "employee" ? "approved" : "estimated"} salary for this cutoff period after late docking and custom deductions.
          </p>
        </div>
        <div className="text-left md:text-right space-y-1">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Computed Net Pay</span>
          <span className="block text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_24px_rgba(52,211,153,0.3)] bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent">
            PHP {payrollSummary.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
