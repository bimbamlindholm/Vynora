import {
  minutesFromTotalHours,
  minutesToHours,
} from "./supabaseAttendance";
import { getHolidayDetails } from "./holidays";


/**
 * Calculates the number of minutes worked during the night differential window (10:00 PM to 6:00 AM).
 * Subtracts any overlapping break minutes.
 * Uses efficient time-range intersection — no per-minute loop.
 *
 * @param {string} timeInRaw ISO timestamp of Time In
 * @param {string} timeOutRaw ISO timestamp of Time Out
 * @param {string} breakInRaw ISO timestamp of Break In (optional)
 * @param {string} breakOutRaw ISO timestamp of Break Out (optional)
 * @returns {number} Night differential minutes
 */
export function calculateNightDifferentialMinutes(timeInRaw, timeOutRaw, breakInRaw, breakOutRaw) {
  if (!timeInRaw || !timeOutRaw) return 0;

  const shiftStart = new Date(timeInRaw);
  const shiftEnd = new Date(timeOutRaw);

  if (isNaN(shiftStart.getTime()) || isNaN(shiftEnd.getTime()) || shiftStart >= shiftEnd) {
    return 0;
  }

  /**
   * Calculate the overlap (in minutes) between two time ranges [aStart, aEnd) and [bStart, bEnd).
   */
  function overlapMinutes(aStart, aEnd, bStart, bEnd) {
    const overlapStart = Math.max(aStart.getTime(), bStart.getTime());
    const overlapEnd = Math.min(aEnd.getTime(), bEnd.getTime());
    return Math.max(0, Math.round((overlapEnd - overlapStart) / 60000));
  }

  /**
   * Build the two night windows that could overlap with a given shift:
   *   1. 10 PM of the start date to midnight
   *   2. Midnight to 6 AM of the end date
   * This correctly handles overnight shifts.
   */
  function buildNightWindows(start, end) {
    const windows = [];

    // Window A: 10 PM on start day → midnight (start day + 1)
    const nightStartA = new Date(start);
    nightStartA.setHours(22, 0, 0, 0);
    const nightEndA = new Date(nightStartA);
    nightEndA.setHours(24, 0, 0, 0); // i.e. midnight next day

    // Window B: midnight on end day → 6 AM on end day
    const nightStartB = new Date(end);
    nightStartB.setHours(0, 0, 0, 0);
    const nightEndB = new Date(end);
    nightEndB.setHours(6, 0, 0, 0);

    windows.push([nightStartA, nightEndA]);
    windows.push([nightStartB, nightEndB]);
    return windows;
  }

  const nightWindows = buildNightWindows(shiftStart, shiftEnd);

  // Sum minutes worked in all night windows
  let totalNightMinutes = nightWindows.reduce((sum, [winStart, winEnd]) => {
    return sum + overlapMinutes(shiftStart, shiftEnd, winStart, winEnd);
  }, 0);

  // Subtract break time that falls within night windows
  const breakStart = breakInRaw ? new Date(breakInRaw) : null;
  const breakEnd = breakOutRaw ? new Date(breakOutRaw) : null;
  const hasValidBreak =
    breakStart &&
    breakEnd &&
    !isNaN(breakStart.getTime()) &&
    !isNaN(breakEnd.getTime()) &&
    breakStart < breakEnd;

  if (hasValidBreak) {
    const breakNightMinutes = nightWindows.reduce((sum, [winStart, winEnd]) => {
      return sum + overlapMinutes(breakStart, breakEnd, winStart, winEnd);
    }, 0);
    totalNightMinutes = Math.max(0, totalNightMinutes - breakNightMinutes);
  }

  return totalNightMinutes;
}

/**
 * Calculates DTR payroll metrics for an employee.
 * 
 * Accounts for two primary pay models to prevent the "double-deduction" bug:
 * 1. Hourly Rate Model:
 *    - Base pay is strictly based on actual hours worked (excluding breaks).
 *    - Because worked hours are already reduced by late/undertime, no additional late/undertime deductions are docked.
 * 
 * 2. Daily Rate Model:
 *    - Contractual Base Pay is flat: (completedDays * dailyRate).
 *    - Late and undertime are calculated and docked from this flat base using an effective hourly rate (dailyRate / expectedDailyHours).
 * 
 * Exposes SSS, PhilHealth, Pag-IBIG government deductions and Holiday Pay premiums.
 * 
 * @param {Object} employee The employee profile data.
 * @param {Array} attendanceRows Aggregated daily attendance records for the cutoff.
 * @param {Object} rules The workspace configuration rules.
 * @returns {Object} Calculated earnings, deductions, and hours.
 */
export function calculateEmployeePayroll({
  employee,
  attendanceRows = [],
  rules = {},
}) {
  let employeeRules = { ...rules };
  if (typeof window !== "undefined" && rules?.id && employee?.id) {
    try {
      const rawPresets = localStorage.getItem(`trackly_custom_rules_presets_${rules.id}`);
      if (rawPresets) {
        const presets = JSON.parse(rawPresets);
        const activePreset = presets.find(p => p.targetEmployeeIds && p.targetEmployeeIds.includes(employee.id));
        if (activePreset) {
          const isDaily = activePreset.salaryModel === "daily";
          employeeRules = {
            ...rules,
            expectedWorkHours: Number(activePreset.expectedWorkHours ?? 8),
            lateGraceMinutes: Number(activePreset.lateGraceMinutes ?? 0),
            hourlyRate: isDaily ? 0 : Number(activePreset.baseAmount ?? 0),
            dailyRate: isDaily ? Number(activePreset.baseAmount ?? 0) : 0,
            salaryModel: activePreset.salaryModel || "hourly",
            baseAmount: Number(activePreset.baseAmount ?? 0),
            overtimeRate: Number(activePreset.overtimeRate ?? 1.25),
            payrollPeriod: activePreset.payrollPeriod || "semi-monthly",
            breakHours: Number(activePreset.breakHours ?? 1.0),
            breakIsPaid: Boolean(activePreset.breakIsPaid ?? false),
            overtimeThresholdMinutes: Number(activePreset.overtimeThresholdMinutes ?? 30),
            holidayRegularRate: Number(activePreset.holidayRegularRate ?? 2.0),
            holidaySpecialRate: Number(activePreset.holidaySpecialRate ?? 1.3),
            nightDiffRate: Number(activePreset.nightDiffRate ?? 0.10),
            geofenceEnabled: Boolean(activePreset.geofenceEnabled ?? false),
            geofenceRadiusMeters: Number(activePreset.geofenceRadiusMeters ?? 100),
          };
        }
      }
    } catch (err) {
      console.error("Error applying payroll custom preset rules:", err);
    }
  }

  const completedRows = attendanceRows.filter((row) => row.status === "Completed");

  // 1. Resolve Rates
  const hourlyRate = Number(employee.hourlyRate || employeeRules.hourlyRate || 0);
  const dailyRate = Number(employee.dailyRate || employeeRules.dailyRate || 0);
  const expectedDailyHours = Number(employeeRules.expectedWorkHours || 8);
  const overtimeMultiplier = Number(employeeRules.overtimeRate || 1.25);
  const overtimeThreshold = Number(employeeRules.overtimeThresholdMinutes ?? employeeRules.overtime_threshold_minutes ?? 30);

  // Derive effective hourly rate (for deductions/OT on daily-rated employees)
  const effectiveHourlyRate = hourlyRate > 0 
    ? hourlyRate 
    : dailyRate > 0 
      ? dailyRate / expectedDailyHours 
      : 0;

  // 2. Compute Earnings with Day-by-Day Holiday Pay, Night Differential, and Overtime Approval
  let totalWorkedMinutes = 0;
  let totalLateMinutes = attendanceRows.reduce(
    (sum, row) => sum + (row.lateMinutes || 0),
    0,
  );

  let totalUndertimeMinutes = completedRows.reduce(
    (sum, row) => sum + (row.undertimeMinutes || 0),
    0,
  );

  let regularPay = 0;
  let overtimePay = 0;
  let holidayPay = 0; // Holiday premium component
  let nightDiffPay = 0;
  let totalNightDiffMinutes = 0;
  let totalOvertimeMinutes = 0;

  completedRows.forEach((row) => {
    const workedMinutesForDay = minutesFromTotalHours(row.totalHours);
    const dailyExpectedHours = Number(row.expectedWorkHours ?? expectedDailyHours);
    const expectedMinutesPerDay = dailyExpectedHours * 60;

    totalWorkedMinutes += workedMinutesForDay;

    // Check if the day is a holiday
    const holiday = getHolidayDetails(row.date, {
      holidayRegularRate: rules.holidayRegularRate ?? rules.holiday_regular_rate,
      holidaySpecialRate: rules.holidaySpecialRate ?? rules.holiday_special_rate,
      customHolidays: rules.customHolidays ?? rules.custom_holidays ?? [],
    });
    const multiplier = holiday.multiplier; // 1.0, 1.3, or 2.0
    const hasHolidayPremium = multiplier > 1.0;

    const regularMinutesForDay = Math.min(workedMinutesForDay, expectedMinutesPerDay);
    
    // Smart Overtime Calculation with Threshold and Admin Approval Check
    let overtimeMinutesForDay = 0;
    const rawOvertimeMinutes = Math.max(0, workedMinutesForDay - expectedMinutesPerDay);
    if (rawOvertimeMinutes >= overtimeThreshold) {
      if (row.overtimeApproved === true) {
        overtimeMinutesForDay = rawOvertimeMinutes;
      }
    }
    totalOvertimeMinutes += overtimeMinutesForDay;

    if (hourlyRate > 0) {
      // HOURLY MODEL
      const dayBasePay = (regularMinutesForDay / 60) * hourlyRate;
      const dayRegularPay = dayBasePay * multiplier;
      const dayOvertimePay = (overtimeMinutesForDay / 60) * hourlyRate * overtimeMultiplier * multiplier;

      regularPay += dayRegularPay;
      overtimePay += dayOvertimePay;

      if (hasHolidayPremium) {
        holidayPay += (dayRegularPay - dayBasePay) + (dayOvertimePay - ((overtimeMinutesForDay / 60) * hourlyRate * overtimeMultiplier));
      }
    } else if (dailyRate > 0) {
      // DAILY MODEL
      // Contractual base pay is dailyRate per completed day
      regularPay += dailyRate;

      // Overtime calculated based on derived effective hourly rate and holiday multiplier
      const dayOvertimePay = (overtimeMinutesForDay / 60) * effectiveHourlyRate * overtimeMultiplier * multiplier;
      overtimePay += dayOvertimePay;

      if (hasHolidayPremium) {
        const dayHolidayPremium = (multiplier - 1.0) * dailyRate;
        regularPay += dayHolidayPremium;
        holidayPay += dayHolidayPremium + (dayOvertimePay - ((overtimeMinutesForDay / 60) * effectiveHourlyRate * overtimeMultiplier));
      }
    }

    // Calculate Night Differential minutes for this day
    const dayNightDiffMinutes = calculateNightDifferentialMinutes(
      row.timeInRaw,
      row.timeOutRaw,
      row.breakInRaw,
      row.breakOutRaw
    );
    totalNightDiffMinutes += dayNightDiffMinutes;

    // Night Diff Pay is dynamic premium of the hourly rate for this day
    const nightDiffRateMultiplier = Number(rules.nightDiffRate ?? rules.night_diff_rate ?? 0.10);
    const dayNightDiffPay = (dayNightDiffMinutes / 60) * (effectiveHourlyRate * multiplier) * nightDiffRateMultiplier;
    nightDiffPay += dayNightDiffPay;
  });

  const grossPay = regularPay + overtimePay + nightDiffPay;

  // 3. Compute Deductions
  const isDailyRated = dailyRate > 0;
  const lateDeduction = isDailyRated ? (totalLateMinutes / 60) * effectiveHourlyRate : 0;
  const undertimeDeduction = isDailyRated ? (totalUndertimeMinutes / 60) * effectiveHourlyRate : 0;
  // Dynamic Deductions supporting Global / Adjustable Workspace Rules
  const customDeductionsList = (rules.customDeductions ?? rules.custom_deductions ?? [
    { id: "sss", name: "SSS Contribution", type: "percentage", value: 4.5, cap: 1350 },
    { id: "philhealth", name: "PhilHealth", type: "percentage", value: 2.5, cap: 1000 },
    { id: "pagibig", name: "Pag-IBIG", type: "percentage", value: 2.0, cap: 200 }
  ]).filter(ded => {
    // If targeted employee list is specified, ensure employee is in it
    if (ded.targetIds && Array.isArray(ded.targetIds) && ded.targetIds.length > 0) {
      const empId = employee?.id || employee?.employeeId || "";
      return ded.targetIds.includes(empId);
    }
    return true;
  });

  let dynamicDeductionsPay = 0;
  const calculatedCustomDeductions = customDeductionsList.map(ded => {
    let amount;
    if (ded.type === "percentage") {
      amount = grossPay * (Number(ded.value || 0) / 100);
    } else {
      amount = Number(ded.value || 0);
    }

    if (ded.cap && amount > Number(ded.cap)) {
      amount = Number(ded.cap);
    }

    amount = Math.round(amount * 100) / 100;
    dynamicDeductionsPay += amount;

    return {
      ...ded,
      amount
    };
  });

  const totalDeduction = lateDeduction + undertimeDeduction + dynamicDeductionsPay;
  const netPay = Math.max(0, grossPay - totalDeduction);

  return {
    employee,
    rowsCount: attendanceRows.length,
    completedDays: completedRows.length,
    totalLateMinutes,
    totalUndertimeMinutes,
    totalHours: minutesToHours(totalWorkedMinutes),
    overtimeHours: minutesToHours(totalOvertimeMinutes),
    undertimeHours: minutesToHours(totalUndertimeMinutes),
    nightDiffHours: minutesToHours(totalNightDiffMinutes),
    regularPay,
    overtimePay,
    holidayPay,
    nightDiffPay,
    grossPay,
    lateDeduction,
    undertimeDeduction,
    // Legacy mapping properties for backward compatibility
    sssDeduction: calculatedCustomDeductions.find(d => d.name.toLowerCase().includes("sss"))?.amount ?? 0,
    philhealthDeduction: calculatedCustomDeductions.find(d => d.name.toLowerCase().includes("philhealth"))?.amount ?? 0,
    pagibigDeduction: calculatedCustomDeductions.find(d => d.name.toLowerCase().includes("pag-ibig") || d.name.toLowerCase().includes("pagibig"))?.amount ?? 0,
    calculatedCustomDeductions,
    totalDeduction,
    netPay,
  };
}

