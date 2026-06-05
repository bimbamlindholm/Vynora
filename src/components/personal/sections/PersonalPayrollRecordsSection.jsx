import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import PayslipsCard from "../../employee/PayslipsCard";
import PersonalPayrollCalculator from "../PersonalPayrollCalculator";

function PersonalPayrollRecordsSection({
  subscriptionTier,
  role,
  handleTryPro,
  setActiveTab,
  workspace,
  profile,
  setSelectedPayslip,
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
  payrollAdditions,
  addPayrollAddition,
  removePayrollAddition,
  updatePayrollAddition,
  handlePrintPayslip,
  payslipStatus,
  loadingPayslipStatus,
  handleRequestPayslip,
  deductionsStart,
  setDeductionsStart,
  deductionsEnd,
  setDeductionsEnd,
  processedPayslips,
  handleApplyDeductionClick,
  handleClearProcessedHistory,
  handlePrintHistoryPayslip
}) {
  return (
    (subscriptionTier === "free" && role !== "employee") ? (
      <motion.div
        key="payroll-gate"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-3xl"
      >
        <div className="relative overflow-hidden glass-panel border-cyan-500/20 bg-slate-950/40 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(6,182,212,0.08)] border-2 backdrop-blur-xl text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.25)] animate-pulse">
              <DollarSign size={40} className="stroke-[1.5]" />
            </div>
            
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/35 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Solo Pro Feature
            </span>
            
            <h2 className="mt-5 text-2xl sm:text-3xl font-black text-white leading-tight">
              Unlock <span className="gradient-text">Estimated Pay</span> & PDF Payslips
            </h2>
            
            <p className="mt-4 max-w-lg text-slate-400 text-xs sm:text-sm leading-relaxed">
              Upgrade to <strong className="text-white">Solo Pro</strong> to track your real-time accumulated earnings, overtime pay, late docking calculations, custom contributions, and print corporate-ready PDF payslips.
            </p>

            <div className="mt-8 w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-left space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">What you get in Solo Pro:</h4>
              <ul className="grid gap-3 text-xs text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                  <span>Real-Time Basic & Overtime earnings projection</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                  <span>Cutoff late docking based on grace period settings</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                  <span>Unlimited custom deductions (SSS loan, advances, taxes)</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                  <span>Export and print premium corporate PDF payslips</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                type="button"
                onClick={handleTryPro}
                className="glow-button px-8 py-4 rounded-2xl text-xs font-black text-white shadow-lg active:scale-95 transition cursor-pointer"
              >
                Try Solo Pro (Demo Upgrade)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-black text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/5 transition cursor-pointer"
              >
                View Subscription Plans
              </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-500">
              Demo Mode: Click "Try Solo Pro" to instantly simulate the upgraded premium state!
            </p>
          </div>
        </div>
      </motion.div>
    ) : (
      <motion.div
        key="payroll"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {role === "employee" && workspace ? (
          <div className="space-y-6">
            {/* Company Name Header Card */}
            <div className="relative overflow-hidden glass-panel border-white/10 bg-gradient-to-r from-slate-950/70 via-slate-900/50 to-cyan-950/20 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/5 rounded-full blur-[80px]" />
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                  🏢 {workspace?.workspace_name || workspace?.name || "Workspace Connected"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Official Payslips</h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Tingnan at i-print ang iyong mga opisyal na payslip na inilabas ng iyong tagapamahala.
                </p>
              </div>
            </div>

            {/* Payslips List */}
            <PayslipsCard profile={profile} onViewPayslip={setSelectedPayslip} />
          </div>
        ) : (
          <PersonalPayrollCalculator
            payrollStart={payrollStart}
            setPayrollStart={setPayrollStart}
            payrollEnd={payrollEnd}
            setPayrollEnd={setPayrollEnd}
            payrollSummary={payrollSummary}
            settings={settings}
            payrollDeductions={payrollDeductions}
            addPayrollDeduction={addPayrollDeduction}
            removePayrollDeduction={removePayrollDeduction}
            updatePayrollDeduction={updatePayrollDeduction}
            payrollAdditions={payrollAdditions}
            addPayrollAddition={addPayrollAddition}
            removePayrollAddition={removePayrollAddition}
            updatePayrollAddition={updatePayrollAddition}
            handlePrintPayslip={handlePrintPayslip}
            role={role}
            payslipStatus={payslipStatus}
            loadingPayslipStatus={loadingPayslipStatus}
            handleRequestPayslip={handleRequestPayslip}
            deductionsStart={deductionsStart}
            setDeductionsStart={setDeductionsStart}
            deductionsEnd={deductionsEnd}
            setDeductionsEnd={setDeductionsEnd}
            processedPayslips={processedPayslips}
            handleApplyDeductionClick={handleApplyDeductionClick}
            handleClearProcessedHistory={handleClearProcessedHistory}
            handlePrintHistoryPayslip={handlePrintHistoryPayslip}
          />
        )}
      </motion.div>
    )
  );
}

export default PersonalPayrollRecordsSection;
