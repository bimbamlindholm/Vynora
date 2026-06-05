import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { supabase } from "../../lib/supabaseClient";
import { safeLocalStorage } from "../../utils/personalDashboardHelpers";
import { getLocalDateString } from "../../utils/personalDashboardHelpers";
import { printPersonalPayslip } from "../../utils/personalPayslipPrinter";

export function usePersonalPayroll({ dailyRows, settings, profileForm, activeTab }) {
  const { addToast } = useToast();
  const { profile, user, workspace } = useAuth();

  const [payrollStart, setPayrollStart] = useState("");
  const [payrollEnd, setPayrollEnd] = useState("");

  const [payrollDeductions, setPayrollDeductions] = useState([
    { id: "ded_1", name: "SSS Loan", amount: "" },
    { id: "ded_2", name: "Cash Advance", amount: "" },
  ]);

  const [payrollAdditions, setPayrollAdditions] = useState([
    { id: "add_1", name: "Incentives", amount: "" },
    { id: "add_2", name: "Bonus", amount: "" },
  ]);

  const [payslipStatus, setPayslipStatus] = useState("none"); // "none", "requested", "approved", "released"
  const [loadingPayslipStatus, setLoadingPayslipStatus] = useState(false);
  const [releasedPayslipAlert, setReleasedPayslipAlert] = useState(null);

  const [deductionsStart, setDeductionsStart] = useState("");
  const [deductionsEnd, setDeductionsEnd] = useState("");
  const [deductionsApplied, setDeductionsApplied] = useState(false);
  const [processedPayslips, setProcessedPayslips] = useState([]);

  // Auto-calculate current payroll period date bounds whenever settings or cutoffType changes
  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (settings.cutoffType === "weekly") {
      const currentDay = now.getDay();
      const distance = currentDay === 0 ? -6 : 1 - currentDay; // Back to Monday
      start = new Date(now);
      start.setDate(now.getDate() + distance);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (settings.cutoffType === "semi-monthly") {
      if (day <= 15) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth(), 15);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 16);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    }
    setPayrollStart(getLocalDateString(start));
    setPayrollEnd(getLocalDateString(end));
  }, [settings.cutoffType]);

  // Synchronize dates when payroll boundaries change
  useEffect(() => {
    if (payrollStart && !deductionsStart) setDeductionsStart(payrollStart);
    if (payrollEnd && !deductionsEnd) setDeductionsEnd(payrollEnd);
    setDeductionsApplied(false);
  }, [payrollStart, payrollEnd]);

  // Load processed payslips history from localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = safeLocalStorage.getItem(`vynora_processed_payslips_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProcessedPayslips(parsed);
          } else {
            setProcessedPayslips([]);
          }
        } catch (e) {
          console.error("Failed to parse processed payslips history", e);
          setProcessedPayslips([]);
        }
      }
    }
  }, [user?.id]);

  // Filtered rows for the selected payroll cutoff period
  const payrollRows = useMemo(() => {
    if (!payrollStart || !payrollEnd) return [];
    return dailyRows.filter((r) => r.date >= payrollStart && r.date <= payrollEnd);
  }, [dailyRows, payrollStart, payrollEnd]);

  // Aggregated pay metrics for the selected payroll period
  const payrollSummary = useMemo(() => {
    const totalDaysWorked = payrollRows.filter((r) => r.timeIn).length;
    const totalWorkedMinutes = payrollRows.reduce((sum, r) => sum + (r.workedMinutes || 0), 0);
    const totalOvertimeMinutes = payrollRows.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);
    const totalLateMinutes = payrollRows.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);

    const basicEarnings = payrollRows.reduce((sum, r) => sum + (r.regularPay || 0), 0);
    const overtimeEarnings = payrollRows.reduce((sum, r) => sum + (r.overtimePay || 0), 0);
    const nightDiffEarnings = payrollRows.reduce((sum, r) => sum + (r.nightDiffPay || 0), 0);
    const totalGrossEarnings = basicEarnings + overtimeEarnings + nightDiffEarnings;

    // Lateness deduction
    let latenessDeduction;
    if (settings.payType === "daily") {
      const effectiveHourlyRate = settings.dailyRate / settings.expectedWorkHours;
      latenessDeduction = (totalLateMinutes / 60) * effectiveHourlyRate;
    } else {
      latenessDeduction = (totalLateMinutes / 60) * settings.hourlyRate;
    }

    const inDeductionsRange = true;

    // Custom manual deductions - only count if applied and in range!
    const activeDeductionsCount = deductionsApplied && inDeductionsRange;
    const customDeductionsTotal = activeDeductionsCount
      ? payrollDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
      : 0;

    // Custom manual additions - only count if applied!
    const customAdditionsTotal = deductionsApplied
      ? payrollAdditions.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
      : 0;

    const totalDeductions = latenessDeduction + customDeductionsTotal;
    const netPay = Math.max(0, totalGrossEarnings + customAdditionsTotal - totalDeductions);

    return {
      totalDaysWorked,
      totalWorkedMinutes,
      totalOvertimeMinutes,
      totalLateMinutes,
      basicEarnings,
      overtimeEarnings,
      nightDiffEarnings,
      totalGrossEarnings,
      latenessDeduction,
      customDeductionsTotal,
      customAdditionsTotal,
      totalDeductions,
      netPay,
      inDeductionsRange,
      deductionsApplied,
    };
  }, [
    payrollRows,
    settings,
    payrollDeductions,
    payrollAdditions,
    deductionsStart,
    deductionsEnd,
    deductionsApplied,
    payrollStart,
    payrollEnd,
  ]);

  // Check individual employee payslip status when cutoff changes
  useEffect(() => {
    let active = true;
    const checkPayslipStatus = async () => {
      if (!profile?.id || !payrollStart || !payrollEnd || !supabase) return;
      try {
        setLoadingPayslipStatus(true);
        const workspaceId = profile.workspace_id || workspace?.id;
        const { data: batch } = await supabase
          .from("payroll_batches")
          .select("id, status")
          .eq("workspace_id", workspaceId)
          .eq("start_date", payrollStart)
          .eq("end_date", payrollEnd)
          .maybeSingle();

        if (!active) return;

        if (batch) {
          const { data: payslip } = await supabase
            .from("payslips")
            .select("status")
            .eq("batch_id", batch.id)
            .eq("user_id", profile.id)
            .maybeSingle();

          if (!active) return;
          if (payslip) {
            setPayslipStatus(payslip.status || batch.status);
          } else {
            setPayslipStatus(batch.status || "none");
          }
        } else {
          setPayslipStatus("none");
        }
      } catch (err) {
        console.error("Error checking employee payslip status:", err);
      } finally {
        if (active) setLoadingPayslipStatus(false);
      }
    };

    checkPayslipStatus();
    return () => {
      active = false;
    };
  }, [profile?.id, payrollStart, payrollEnd, workspace?.id]);

  // Fetch released payslips for alerts
  useEffect(() => {
    let active = true;
    const fetchReleasedPayslips = async () => {
      if (!profile?.id || !supabase) return;
      try {
        const { data: slips, error } = await supabase
          .from("payslips")
          .select("id, status, batch_id, net_pay, payroll_batches(start_date, end_date)")
          .eq("user_id", profile.id)
          .eq("status", "released")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!active) return;

        if (slips && slips.length > 0) {
          const latestSlip = slips[0];
          const period = latestSlip.payroll_batches
            ? `${latestSlip.payroll_batches.start_date} to ${latestSlip.payroll_batches.end_date}`
            : "";
          setReleasedPayslipAlert({
            id: latestSlip.id,
            period,
            netPay: latestSlip.net_pay,
            startDate: latestSlip.payroll_batches?.start_date,
            endDate: latestSlip.payroll_batches?.end_date,
          });
        } else {
          setReleasedPayslipAlert(null);
        }
      } catch (err) {
        console.error("Error fetching released payslip alerts:", err);
      }
    };

    fetchReleasedPayslips();
    return () => {
      active = false;
    };
  }, [profile?.id, activeTab]);

  const addPayrollDeduction = () => {
    setPayrollDeductions([
      ...payrollDeductions,
      { id: `ded_${Date.now()}`, name: "", amount: "" },
    ]);
  };

  const removePayrollDeduction = (id) => {
    setPayrollDeductions(payrollDeductions.filter((d) => d.id !== id));
  };

  const updatePayrollDeduction = (id, field, value) => {
    setPayrollDeductions(
      payrollDeductions.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const addPayrollAddition = () => {
    setPayrollAdditions([
      ...payrollAdditions,
      { id: `add_${Date.now()}`, name: "", amount: "" },
    ]);
  };

  const removePayrollAddition = (id) => {
    setPayrollAdditions(payrollAdditions.filter((a) => a.id !== id));
  };

  const updatePayrollAddition = (id, field, value) => {
    setPayrollAdditions(
      payrollAdditions.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const formatMinutesToHours = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  };

  const handleRequestPayslip = async () => {
    if (!profile?.id || !payrollStart || !payrollEnd || !supabase) return;

    try {
      setLoadingPayslipStatus(true);

      let batchIdToUse = null;
      const workspaceId = profile.workspace_id || workspace?.id;

      const { data: batch } = await supabase
        .from("payroll_batches")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("start_date", payrollStart)
        .eq("end_date", payrollEnd)
        .maybeSingle();

      if (batch) {
        batchIdToUse = batch.id;
      } else {
        addToast(
          "Your Workspace Administrator has not initiated the payroll batch for this cutoff period yet. Please ask your admin to open this pay period.",
          "warning"
        );
        setLoadingPayslipStatus(false);
        return;
      }

      const latenessDeduction = payrollSummary.latenessDeduction;
      const customDeductionsTotal = payrollSummary.customDeductionsTotal;
      const totalDeductions = latenessDeduction + customDeductionsTotal;

      const payslipPayload = {
        batch_id: batchIdToUse,
        user_id: profile.id,
        completed_days: payrollSummary.totalDaysWorked,
        rows_count: payrollRows.length,
        total_hours: formatMinutesToHours(payrollSummary.totalWorkedMinutes),
        overtime_hours: formatMinutesToHours(payrollSummary.totalOvertimeMinutes),
        late_minutes: payrollSummary.totalLateMinutes,
        undertime_hours: "0h 00m",
        regular_pay: payrollSummary.basicEarnings,
        overtime_pay: payrollSummary.overtimeEarnings,
        holiday_pay: 0,
        night_diff_pay: 0,
        gross_pay: payrollSummary.totalGrossEarnings,
        late_deduction: latenessDeduction,
        undertime_deduction: 0,
        sss_deduction: Math.min(1350, payrollSummary.totalGrossEarnings * 0.045),
        philhealth_deduction: Math.min(1000, payrollSummary.totalGrossEarnings * 0.025),
        pagibig_deduction: Math.min(200, payrollSummary.totalGrossEarnings * 0.02),
        custom_deductions: payrollDeductions || [],
        total_deductions: totalDeductions,
        net_pay: payrollSummary.netPay,
        status: "requested",
      };

      const { data: existingPayslip } = await supabase
        .from("payslips")
        .select("id")
        .eq("batch_id", batchIdToUse)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (existingPayslip) {
        const { error: upsertErr } = await supabase
          .from("payslips")
          .update(payslipPayload)
          .eq("id", existingPayslip.id);

        if (upsertErr) throw upsertErr;
      } else {
        const { error: upsertErr } = await supabase.from("payslips").insert(payslipPayload);

        if (upsertErr) throw upsertErr;
      }

      setPayslipStatus("requested");
      addToast("Payslip request sent successfully to Admin!", "success");

      try {
        const { createAuditLog } = await import("../../utils/supabaseAuditLogs");
        await createAuditLog({
          workspaceId: workspaceId,
          userId: profile.id,
          action: "payslip_requested",
          details: {
            start_date: payrollStart,
            end_date: payrollEnd,
            net_pay: payrollSummary.netPay,
          },
        });
      } catch (logErr) {
        console.error("Failed to write audit log:", logErr);
      }
    } catch (err) {
      console.error("Error requesting payslip:", err);
      addToast("Failed to request payslip: " + err.message, "error");
    } finally {
      setLoadingPayslipStatus(false);
    }
  };

  const handleApplyDeductionClick = () => {
    if (!payrollStart || !payrollEnd) return;

    setDeductionsApplied(true);

    const inDeductionsRange = true;
    const customDeductionsTotal = inDeductionsRange
      ? payrollDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
      : 0;
    const customAdditionsTotal = payrollAdditions.reduce(
      (sum, a) => sum + (Number(a.amount) || 0),
      0
    );
    const totalDeductions = payrollSummary.latenessDeduction + customDeductionsTotal;
    const netPay = Math.max(
      0,
      payrollSummary.totalGrossEarnings + customAdditionsTotal - totalDeductions
    );

    const newSlip = {
      id: `slip_${Date.now()}`,
      payrollStart,
      payrollEnd,
      deductionsStart,
      deductionsEnd,
      basicEarnings: payrollSummary.basicEarnings,
      overtimeEarnings: payrollSummary.overtimeEarnings,
      nightDiffEarnings: payrollSummary.nightDiffEarnings,
      totalGrossEarnings: payrollSummary.totalGrossEarnings,
      latenessDeduction: payrollSummary.latenessDeduction,
      customDeductions: payrollDeductions.map((d) => ({
        name: d.name,
        amount: Number(d.amount) || 0,
      })),
      customDeductionsTotal,
      customAdditions: payrollAdditions.map((a) => ({ name: a.name, amount: Number(a.amount) || 0 })),
      customAdditionsTotal,
      totalDeductions,
      netPay,
      processedAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedList = [newSlip, ...processedPayslips];
    setProcessedPayslips(updatedList);
    safeLocalStorage.setItem(`vynora_processed_payslips_${user.id}`, JSON.stringify(updatedList));

    addToast("Deductions & Additions applied successfully! Processed payslip recorded below.", "success");
  };

  const handleClearProcessedHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire processed payslip history?")) {
      setProcessedPayslips([]);
      safeLocalStorage.removeItem(`vynora_processed_payslips_${user.id}`);
      addToast("Processed history cleared successfully.", "info");
    }
  };

  const handlePrintHistoryPayslip = (slip) => {
    printPersonalPayslip({ slip, profileForm });
  };

  const handlePrintPayslip = () => {
    const slip = {
      payrollStart,
      payrollEnd,
      basicEarnings: payrollSummary.basicEarnings,
      overtimeEarnings: payrollSummary.overtimeEarnings,
      nightDiffEarnings: payrollSummary.nightDiffEarnings,
      totalGrossEarnings: payrollSummary.totalGrossEarnings,
      latenessDeduction: payrollSummary.latenessDeduction,
      customDeductions: payrollDeductions,
      customAdditions: payrollAdditions,
      totalDeductions: payrollSummary.totalDeductions,
      netPay: payrollSummary.netPay,
    };
    printPersonalPayslip({ slip, profileForm });
  };

  return {
    payrollStart,
    setPayrollStart,
    payrollEnd,
    setPayrollEnd,
    payrollDeductions,
    payrollAdditions,
    payslipStatus,
    loadingPayslipStatus,
    releasedPayslipAlert,
    setReleasedPayslipAlert,
    deductionsStart,
    setDeductionsStart,
    deductionsEnd,
    setDeductionsEnd,
    deductionsApplied,
    processedPayslips,
    payrollRows,
    payrollSummary,
    addPayrollDeduction,
    removePayrollDeduction,
    updatePayrollDeduction,
    addPayrollAddition,
    removePayrollAddition,
    updatePayrollAddition,
    handleRequestPayslip,
    handleApplyDeductionClick,
    handleClearProcessedHistory,
    handlePrintHistoryPayslip,
    handlePrintPayslip,
  };
}
