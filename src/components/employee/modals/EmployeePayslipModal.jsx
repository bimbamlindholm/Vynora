import { useEffect, useState } from "react";
import { Download, X, Printer } from "lucide-react";
import { formatPeso } from "../employeeConstants";
import { generatePayslipPdf as generatePremiumPayslip } from "../../../utils/payslipPdfGenerator";
import { supabase } from "../../../lib/supabaseClient";

function RecordFact({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm print-item">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 print-text-muted">{label}</p>
      <p className="mt-1 truncate font-black text-white print-text-dark">{value}</p>
    </div>
  );
}

export default function EmployeePayslipModal({ payslip, profile, onClose, workspace }) {
  const [absencesCount, setAbsencesCount] = useState(0);
  const [leavesCount, setLeavesCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const startDate = payslip?.payroll_batches?.start_date;
  const endDate = payslip?.payroll_batches?.end_date;
  const companyName = workspace?.workspace_name || workspace?.name || "Trackly Inc.";

  // Fetch approved leaves and compute absences for the period
  useEffect(() => {
    const fetchAttendanceAndLeaves = async () => {
      if (!profile?.id || !startDate || !endDate) return;
      try {
        setLoadingStats(true);
        // 1. Fetch approved leave requests overlapping with this cutoff
        const { data: leaves, error: leavesErr } = await supabase
          .from("leave_requests")
          .select("*")
          .eq("user_id", profile.id)
          .eq("status", "approved")
          .lte("start_date", endDate)
          .gte("end_date", startDate);

        if (leavesErr) throw leavesErr;
        setLeavesCount(leaves?.length || 0);

        // 2. Fetch attendance records in this period
        const { data: attRecords, error: attErr } = await supabase
          .from("attendance_records")
          .select("*")
          .eq("user_id", profile.id)
          .gte("date", startDate)
          .lte("date", endDate);

        if (attErr) throw attErr;

        // 3. Calculate absences (excluding weekends)
        const start = new Date(startDate);
        const end = new Date(endDate);
        let current = new Date(start);
        let totalAbsences = 0;

        while (current <= end) {
          const dateStr = current.toISOString().slice(0, 10);
          
          const hasRecord = attRecords?.some(r => r.date === dateStr);
          const isOnLeave = leaves?.some(l => dateStr >= l.start_date && dateStr <= l.end_date);
          const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          if (!hasRecord && !isOnLeave && !isWeekend) {
            totalAbsences++;
          }

          current.setDate(current.getDate() + 1);
        }

        setAbsencesCount(totalAbsences);
      } catch (err) {
        console.error("Error fetching detailed attendance stats in modal:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAttendanceAndLeaves();
  }, [profile?.id, startDate, endDate, workspace?.id]);

  if (!payslip || !payslip.payroll_batches || payslip.status !== "released") {
    return null;
  }

  const rows = [
    ["Total Hours Worked", payslip.total_hours],
    ["Overtime Hours", payslip.overtime_hours],
    ["Undertime Hours", payslip.undertime_hours],
  ];

  const attendanceMetrics = [
    ["Present Days", payslip.completed_days],
    ["Late Minutes", `${payslip.late_minutes || 0}m`],
    ["Absences", loadingStats ? "..." : absencesCount],
    ["Approved Leaves", loadingStats ? "..." : leavesCount],
  ];

  const earnings = [
    ["Regular Pay", formatPeso(payslip.regular_pay)],
    ["Overtime Pay", formatPeso(payslip.overtime_pay)],
  ];

  if (payslip.holiday_pay && Number(payslip.holiday_pay) > 0) {
    earnings.push(["Holiday Premium", formatPeso(payslip.holiday_pay)]);
  }

  if (payslip.night_diff_pay && Number(payslip.night_diff_pay) > 0) {
    earnings.push(["Night Differential (10%)", formatPeso(payslip.night_diff_pay)]);
  }

  earnings.push(["Gross Pay", formatPeso(payslip.gross_pay)]);

  const grossPayValue = Number(payslip.gross_pay || 0);
  const customDeductions = payslip.custom_deductions || [];

  const sssDeduction = payslip.sss_deduction !== undefined && payslip.sss_deduction !== null ? Number(payslip.sss_deduction) : Math.min(1350, grossPayValue * 0.045);
  const philhealthDeduction = payslip.philhealth_deduction !== undefined && payslip.philhealth_deduction !== null ? Number(payslip.philhealth_deduction) : Math.min(1000, grossPayValue * 0.025);
  const pagibigDeduction = payslip.pagibig_deduction !== undefined && payslip.pagibig_deduction !== null ? Number(payslip.pagibig_deduction) : Math.min(200, grossPayValue * 0.02);

  const deductions = [
    ["Late Deduction", formatPeso(payslip.late_deduction)],
    ["Undertime Deduction", formatPeso(payslip.undertime_deduction)],
  ];

  if (customDeductions.length > 0) {
    customDeductions.forEach((ded) => {
      const typeLabel = ded.type === "percentage" ? ` (${ded.value}%)` : "";
      deductions.push([`${ded.name}${typeLabel}`, formatPeso(ded.amount)]);
    });
  } else {
    deductions.push(["SSS Share (4.5%)", formatPeso(sssDeduction)]);
    deductions.push(["PhilHealth Share (2.5%)", formatPeso(philhealthDeduction)]);
    deductions.push(["Pag-IBIG Share (2.0%)", formatPeso(pagibigDeduction)]);
  }

  deductions.push(["Total Deduction", formatPeso(payslip.total_deductions)]);

  const generatePayslipPdf = () => {
    const payrollResult = {
      employee: {
        fullName: profile?.fullName || "Employee",
        email: profile?.email || "-",
        role: profile?.role || "employee",
        dailyRate: profile?.dailyRate || 0,
        hourlyRate: profile?.hourlyRate || 0,
        id: profile?.id || "N/A",
      },
      totalHours: payslip.total_hours,
      overtimeHours: payslip.overtime_hours,
      regularPay: Number(payslip.regular_pay || 0),
      overtimePay: Number(payslip.overtime_pay || 0),
      holidayPay: Number(payslip.holiday_pay || 0),
      nightDiffPay: Number(payslip.night_diff_pay || 0),
      grossPay: grossPayValue,
      lateDeduction: Number(payslip.late_deduction || 0),
      undertimeDeduction: Number(payslip.undertime_deduction || 0),
      sssDeduction,
      philhealthDeduction,
      pagibigDeduction,
      calculatedCustomDeductions: customDeductions,
      totalDeduction: Number(payslip.total_deductions || 0),
      netPay: Number(payslip.net_pay || 0),
    };
    generatePremiumPayslip(payrollResult, {}, `${startDate} to ${endDate}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-3 backdrop-blur-sm sm:p-4">
      {/* Print Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-payslip-root, #print-payslip-root * {
            visibility: visible !important;
          }
          #print-payslip-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            background: white !important;
            color: black !important;
            border: 1px solid #cbd5e0 !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            padding: 24px !important;
          }
          .print-text-dark {
            color: black !important;
          }
          .print-text-muted {
            color: #4a5568 !important;
          }
          .print-item {
            background: #f7fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: black !important;
          }
          .print-section {
            border: 1px solid #cbd5e0 !important;
            background: #f8fafc !important;
          }
          .print-net-pay {
            background: #f1f5f9 !important;
            border: 2px solid #cbd5e0 !important;
            color: black !important;
          }
        }
      `}} />

      <div 
        id="print-payslip-root"
        className="glass-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6 text-slate-200 print-card"
      >
        {/* Header Block */}
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4 print-text-dark print:border-slate-300">
          <div>
            <h1 className="text-xl font-black text-cyan-300 print-text-dark uppercase tracking-widest">{companyName}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 print-text-muted">Official Payslip Voucher</p>
            <h2 className="mt-2 text-2xl font-black text-white print-text-dark">Cutoff: {startDate} to {endDate}</h2>
            <p className="mt-1 text-sm text-slate-400 print-text-muted">Status: <span className="text-emerald-400 font-semibold">Released</span></p>
          </div>
          <button
            aria-label="Close payslip breakdown"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200 no-print"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Employee Info Block */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 border-b border-white/10 pb-4 print:border-slate-300 print-text-dark">
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 print-text-muted">Employee Name</span>
            <span className="font-bold text-white print-text-dark text-sm">{profile?.fullName || payslip.profile?.full_name || "Employee"}</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 print-text-muted">Employee ID</span>
            <span className="font-bold text-slate-300 print-text-dark text-sm truncate block">{profile?.id || payslip.user_id}</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 print-text-muted">Position / Role</span>
            <span className="font-bold text-slate-300 print-text-dark text-sm">{profile?.position || "Employee"}</span>
          </div>
        </div>

        {/* Attendance Summary Grid */}
        <div className="mb-5">
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300 print-text-dark">Attendance Summary</h3>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {attendanceMetrics.map(([label, value]) => (
              <RecordFact key={label} label={label} value={value} />
            ))}
          </div>
        </div>

        {/* Hours Worked Grid */}
        <div className="mb-5">
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300 print-text-dark">Hours Worked</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {rows.map(([label, value]) => (
              <RecordFact key={label} label={label} value={value} />
            ))}
          </div>
        </div>

        {/* Side-by-Side Earnings and Deductions */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4 print-section">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-emerald-200 print-text-dark">Earnings</h3>
            <div className="mt-4 grid gap-2">
              {earnings.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs print-item">
                  <span className="text-slate-400 print-text-muted">{label}</span>
                  <span className="text-right font-bold text-white print-text-dark">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.05] p-4 print-section">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-rose-200 print-text-dark">Deductions</h3>
            <div className="mt-4 grid gap-2">
              {deductions.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs print-item">
                  <span className="text-slate-400 print-text-muted">{label}</span>
                  <span className="text-right font-bold text-white print-text-dark">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Net Pay Card */}
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 print-net-pay">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 print-text-muted">Net Pay</p>
          <p className="mt-2 text-3xl font-black text-white print-text-dark">{formatPeso(payslip.net_pay)}</p>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400 print-text-muted">
            Net Pay = Gross Pay minus total deductions (SSS, PhilHealth, Pag-IBIG, Late, Undertime, Custom).
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3 no-print">
            <button
              className="glow-button inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black text-white cursor-pointer"
              onClick={generatePayslipPdf}
              type="button"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-cyan-300/30 hover:bg-cyan-300/[0.05] px-5 text-xs font-black text-white cursor-pointer transition-all"
              onClick={handlePrint}
              type="button"
            >
              <Printer size={14} /> Print Payslip
            </button>
          </div>
        </div>

        {/* Signature Area for Print */}
        <div className="mt-12 hidden print:grid grid-cols-2 gap-12 pt-8 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black"></div>
            <p className="mt-2 font-bold text-slate-700">Employee Signature</p>
            <p className="text-[10px] text-slate-500">Date Signed: ____________</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black"></div>
            <p className="mt-2 font-bold text-slate-700">Authorized Signatory</p>
            <p className="text-[10px] text-slate-500">Trackly Automated Payroll</p>
          </div>
        </div>
      </div>
    </div>
  );
}
