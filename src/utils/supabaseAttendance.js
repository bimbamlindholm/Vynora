import { supabase } from "../lib/supabaseClient";

let cachedSchedules = [];

export function setCachedSchedules(schedules) {
  cachedSchedules = schedules;
}

export function getCachedSchedules() {
  return cachedSchedules;
}

const actionLabels = {
  time_in: "Time In",
  break_in: "Break In",
  break_out: "Break Out",
  time_out: "Time Out",
};

const actionStatus = {
  time_in: "Working",
  break_in: "On Break",
  break_out: "Working",
  time_out: "Completed",
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultAttendanceRules = {
  shiftStartTime: "",
  expectedWorkHours: 8,
  lateGraceMinutes: 0,
  overtimeRate: 1.25,
  payrollPeriod: "semi-monthly",
  hourlyRate: 0,
  dailyRate: 0,
};

export function getEmployeeOverridenRules(employeeId, workspaceId, baseRules) {
  if (typeof window === "undefined" || !workspaceId || !employeeId) return baseRules;
  try {
    let presets = baseRules?.customRulesPresets || baseRules?.workspace?.custom_rules_presets;
    
    if (!presets || presets.length === 0) {
      const rawPresets = localStorage.getItem(`vynora_custom_rules_presets_${workspaceId}`);
      if (rawPresets) {
        presets = JSON.parse(rawPresets);
      }
    }

    if (!presets || presets.length === 0) return baseRules;
    // Find active preset that targets this employee ID
    const activePreset = presets.find(p => p.targetEmployeeIds && p.targetEmployeeIds.includes(employeeId));
    if (activePreset) {
      const isDaily = activePreset.salaryModel === "daily";
      return {
        ...baseRules,
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
  } catch (err) {
    console.error("Error loading custom rules presets for employee:", err);
  }
  return baseRules;
}

export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
}

export function todayKey(date = new Date()) {
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function normalizeAction(action) {
  return String(action || "")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

export function getActionLabel(action) {
  return actionLabels[normalizeAction(action)] || action || "Attendance";
}

export function getActionStatus(action, fallback = "") {
  return actionStatus[normalizeAction(action)] || fallback || "Working";
}

export function formatRecordTime(value) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAttendanceDate(value) {
  if (!value) return "-";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(value) {
  const amount = Number(value || 0);

  return `PHP ${amount.toLocaleString("en-PH", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function normalizeAttendanceRules(rules = {}) {
  const rawShiftStart =
    rules.shiftStartTime ??
    rules.shift_start_time ??
    defaultAttendanceRules.shiftStartTime;

  return {
    ...defaultAttendanceRules,
    ...rules,
    shiftStartTime: String(rawShiftStart || "").trim(),
    expectedWorkHours: Number(
      rules.expectedWorkHours ??
        rules.expected_work_hours ??
        defaultAttendanceRules.expectedWorkHours,
    ),
    lateGraceMinutes: Number(
      rules.lateGraceMinutes ??
        rules.late_grace_minutes ??
        defaultAttendanceRules.lateGraceMinutes,
    ),
    overtimeRate: Number(
      rules.overtimeRate ??
        rules.overtime_rate ??
        defaultAttendanceRules.overtimeRate,
    ),
    hourlyRate: Number(
      rules.hourlyRate ??
        rules.hourly_rate ??
        defaultAttendanceRules.hourlyRate,
    ),
    dailyRate: Number(
      rules.dailyRate ??
        rules.daily_rate ??
        defaultAttendanceRules.dailyRate,
    ),
    payrollPeriod:
      rules.payrollPeriod ??
      rules.payroll_period ??
      defaultAttendanceRules.payrollPeriod,
  };
}

export function hasExplicitShiftStart(rules = {}) {
  return Boolean(
    String(rules.shiftStartTime ?? rules.shift_start_time ?? "").trim(),
  );
}

function getShiftStartForDate(dateValue, rules = {}) {
  if (!dateValue || !hasExplicitShiftStart(rules)) return null;

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  const attendanceRules = normalizeAttendanceRules(rules);
  const [hour = "0", minute = "0"] = attendanceRules.shiftStartTime.split(":");

  const shiftStart = new Date(parsed);
  shiftStart.setHours(Number(hour), Number(minute), 0, 0);

  return shiftStart;
}

export function minutesLateFromTimestamp(value, rules = {}) {
  if (!value || !hasExplicitShiftStart(rules)) return 0;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 0;

  const attendanceRules = normalizeAttendanceRules(rules);
  const shiftStart = getShiftStartForDate(parsed, attendanceRules);

  if (!shiftStart) return 0;

  const rawLateMinutes = Math.round((parsed - shiftStart) / 60000);

  return Math.max(0, rawLateMinutes - attendanceRules.lateGraceMinutes);
}

export function minutesUndertimeFromTimestamps(timeOutValue, rules = {}) {
  if (!timeOutValue || !hasExplicitShiftStart(rules)) return 0;

  const parsedTimeOut = new Date(timeOutValue);
  if (Number.isNaN(parsedTimeOut.getTime())) return 0;

  const attendanceRules = normalizeAttendanceRules(rules);
  const expectedWorkHours = Number(attendanceRules.expectedWorkHours || 8);
  const expectedTimeOut = getShiftStartForDate(parsedTimeOut, attendanceRules);

  if (!expectedTimeOut) return 0;

  expectedTimeOut.setMinutes(
    expectedTimeOut.getMinutes() + Math.round(expectedWorkHours * 60),
  );

  const undertimeMinutes = Math.round((expectedTimeOut - parsedTimeOut) / 60000);

  return Math.max(0, undertimeMinutes);
}

export function minutesToHours(minutes) {
  const safeMinutes = Math.max(0, Math.round(minutes || 0));
  return `${Math.floor(safeMinutes / 60)}h ${String(safeMinutes % 60).padStart(2, "0")}m`;
}

export function minutesFromTotalHours(totalHours) {
  const match = String(totalHours || "").match(/(\d+)h\s+(\d+)m/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function compareDateKeys(firstDate, secondDate) {
  return String(firstDate || "").localeCompare(String(secondDate || ""));
}

function diffMinutes(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((endDate - startDate) / 60000));
}

export function calculateBreakMinutesFromEvents(events = [], rules = {}) {
  let total = 0;
  let openBreakStart = "";
  let currentBreakComment = "";

  events.forEach((event) => {
    if (event.action === "break_in" && !openBreakStart) {
      openBreakStart = event.timestamp;
      currentBreakComment = event.comment || "";
    }

    if (event.action === "break_out" && openBreakStart) {
      const breakDuration = diffMinutes(openBreakStart, event.timestamp);
      
      // Determine if this break segment is paid or unpaid:
      let isSegmentPaid = rules.breakIsPaid ?? rules.break_is_paid ?? false;
      if (currentBreakComment === "paid_break") {
        isSegmentPaid = true;
      } else if (currentBreakComment === "unpaid_break") {
        isSegmentPaid = false;
      }

      if (!isSegmentPaid) {
        total += breakDuration;
      }
      openBreakStart = "";
      currentBreakComment = "";
    }
  });

  return total;
}

export function calculateWorkedMinutesFromEvents(events = [], rules = {}) {
  const timeIn = events.find((event) => event.action === "time_in");
  if (!timeIn) return 0;

  const timeOut = [...events].reverse().find((event) => event.action === "time_out");

  // Find active ongoing break (a break_in that has no subsequent break_out)
  let activeOngoingBreak = null;
  const breakIns = events.filter((e) => e.action === "break_in");
  const breakOuts = events.filter((e) => e.action === "break_out");
  if (breakIns.length > breakOuts.length) {
    activeOngoingBreak = breakIns[breakIns.length - 1];
  }

  // Determine gross end time:
  let endTime;
  if (timeOut) {
    endTime = new Date(timeOut.timestamp);
  } else if (activeOngoingBreak) {
    endTime = new Date(activeOngoingBreak.timestamp);
  } else {
    // Ongoing working day, use current time
    endTime = new Date();
  }

  let payableStart = new Date(timeIn.timestamp);
  const shiftStart = getShiftStartForDate(timeIn.timestamp, rules);

  if (shiftStart && shiftStart > payableStart) {
    payableStart = shiftStart;
  }

  if (endTime < payableStart) return 0;

  const grossMinutes = Math.round((endTime - payableStart) / 60000);
  const breakMinutes = calculateBreakMinutesFromEvents(events, rules);

  return Math.max(0, grossMinutes - breakMinutes);
}

export function getAttendanceState(row) {
  if (!row || row.isAbsent || !row.timeInRaw) return "Offline";
  if (row.timeOutRaw) return "Completed";
  if (row.isOnBreak) return "On Break";
  if ((row.lateMinutes || 0) > 0) return "Late";
  return "Working";
}

export function getAttendanceSubtitle(row) {
  if (!row || row.isAbsent) return "No time in recorded";
  if (row.status === "Completed") return `Timed out at ${row.timeOut || "-"}`;
  if (row.status === "On Break") return `Break started at ${row.breakIn || "-"}`;
  if (row.status === "Late") return `${row.lateMinutes}m late, currently present`;
  if (row.latestAction) return `Latest action: ${getActionLabel(row.latestAction)}`;
  return "Working now";
}

export function totalHoursFromActions(row) {
  return minutesToHours(row.workedMinutes || 0);
}

export async function fetchWorkspaceEmployees(workspaceId) {
  if (!supabase || !workspaceId) return [];

  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, role, status, joined_at, user_id, supervisor_id, profile:profiles!user_id(*), supervisor:profiles!supervisor_id(full_name)")
    .eq("workspace_id", workspaceId)
    .in("role", ["employee", "manager", "supervisor"])
    .eq("status", "active")
    .order("joined_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((member) => ({
    id: member.user_id,
    fullName: member.profile?.full_name || "Employee",
    email: member.profile?.email || "",
    department: member.profile?.department || "No department yet",
    position: member.profile?.position || "No position yet",
    phone: member.profile?.phone || "",
    address: member.profile?.address || "",
    hourlyRate: Number(member.profile?.hourly_rate || 0),
    dailyRate: Number(member.profile?.daily_rate || 0),
    role: member.role ? member.role.replace(/^\w/, (char) => char.toUpperCase()) : "Employee",
    status: member.status || "active",
    joinedAt: member.joined_at || member.profile?.created_at || "",
    supervisorId: member.supervisor_id || null,
    supervisorName: member.supervisor?.full_name || null,
  }));
}

export async function updateMemberRoleAndSupervisor(workspaceId, memberId, role, supervisorId) {
  if (!supabase || !workspaceId || !memberId) return false;

  const { error } = await supabase
    .from("workspace_members")
    .update({
      role: role.toLowerCase(),
      supervisor_id: supervisorId || null,
    })
    .eq("workspace_id", workspaceId)
    .eq("user_id", memberId);

  if (error) throw error;
  return true;
}


export async function fetchWorkspaceAttendance(workspaceId, { limit = 1000 } = {}) {
  if (!supabase || !workspaceId) return [];

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Prefetch schedules
  try {
    const { data: schedulesData } = await supabase
      .from("schedules")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (schedulesData) cachedSchedules = schedulesData;
  } catch (err) {
    console.error("Failed to prefetch workspace schedules:", err);
  }

  const records = data || [];
  const userIds = [
    ...new Set(records.map((record) => record.user_id || record.employee_id).filter(Boolean)),
  ];

  const profilesById = {};

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    (profiles || []).forEach((profile) => {
      profilesById[profile.id] = profile;
    });
  }

  return records.map((record) => normalizeAttendanceRecord(record, profilesById));
}

/**
 * Fetches attendance records for a single employee only (privacy-safe, used by employee dashboard).
 */
export async function fetchMyAttendance(workspaceId, userId, { limit = 500 } = {}) {
  if (!supabase || !workspaceId || !userId) return [];

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Prefetch schedules for this user
  try {
    const { data: schedulesData } = await supabase
      .from("schedules")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);
    if (schedulesData) cachedSchedules = schedulesData;
  } catch (err) {
    console.error("Failed to prefetch my schedules:", err);
  }

  const profilesById = {};
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profile) profilesById[profile.id] = profile;

  return (data || []).map((record) => normalizeAttendanceRecord(record, profilesById));
}

export function normalizeAttendanceRecord(record, profilesById = {}) {
  const userId = record.user_id || record.employee_id;
  const profile = profilesById[userId] || {};
  const timestamp = record.timestamp || record.created_at || new Date().toISOString();
  const action = normalizeAction(record.action || record.status);

  return {
    ...record,
    id: record.id,
    userId,
    employeeId: userId,
    employeeName: record.employee_name || profile.full_name || "Employee",
    employeeEmail: profile.email || "",
    action,
    actionLabel: getActionLabel(action),
    status: getActionStatus(action, record.status),
    timestamp,
    time: formatRecordTime(timestamp),
    date: record.date || todayKey(new Date(timestamp)),
    lateMinutes: 0,
    undertimeMinutes: 0,
    verificationPhoto: record.verification_photo || "",
  };
}

function createEmptyDailyRow(employee, date) {
  return {
    id: `${employee.id}-${date}`,
    employeeId: employee.id,
    userId: employee.id,
    employeeName: employee.fullName || employee.employeeName || "Employee",
    email: employee.email || employee.employeeEmail || "",
    date,
    timeIn: "",
    timeInRaw: "",
    breakIn: "",
    breakInRaw: "",
    breakOut: "",
    breakOutRaw: "",
    timeOut: "",
    timeOutRaw: "",
    totalHours: "0h 00m",
    workedMinutes: 0,
    breakMinutes: 0,
    undertimeMinutes: 0,
    status: "Offline",
    statusSubtitle: "No time in recorded",
    latestAction: "",
    latestTimestamp: "",
    lateMinutes: 0,
    isAbsent: true,
    isOnBreak: false,
    isLeave: false,
    isRestDay: false,
    workType: "regular",
    comment: "",
    overtimeReason: "",
    overtimeApproved: null,
    verificationPhoto: "",
    timeOutVerificationPhoto: "",
  };
}

function calculateShiftExpectedHours(startStr, endStr) {
  if (!startStr || !endStr || startStr === "OFF" || endStr === "OFF") return 8;

  const [startHour, startMin] = startStr.split(":").map(Number);
  const [endHour, endMin] = endStr.split(":").map(Number);

  if (Number.isNaN(startHour) || Number.isNaN(endHour)) return 8;

  let diffMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  if (diffMin < 0) {
    diffMin += 24 * 60; // overnight shift
  }

  const diffHours = diffMin / 60;
  // standard deduction of 1 hour lunch if shift is >= 5 hours
  const expected = diffHours >= 5 ? diffHours - 1 : diffHours;
  return Math.max(0, expected);
}

export function buildDailyAttendanceRows(records, employees = [], date = todayKey(), rules = {}) {
  const rowsByEmployee = {};
  const schedulesList = rules?.schedules || cachedSchedules || [];

  employees.forEach((employee) => {
    const row = createEmptyDailyRow(employee, date);
    const empRules = getEmployeeOverridenRules(employee.id, rules?.id, rules);
    row.expectedWorkHours = empRules.expectedWorkHours ?? 8;

    // Find active schedule for this employee on this date
    const activeSched = schedulesList.find(
      (s) => s.user_id === employee.id && s.date === date
    );

    let isRestDay = false;
    let isRegularHoliday = false;
    let isSpecialHoliday = false;

    if (activeSched) {
      row.scheduleLabel = activeSched.label;
      row.scheduleStart = activeSched.shift_start;
      row.scheduleEnd = activeSched.shift_end;
      row.scheduleColor = activeSched.color;
      row.scheduleNotes = activeSched.notes;

      const isRest =
        String(activeSched.label || "").toLowerCase().includes("rest") ||
        String(activeSched.label || "").toLowerCase().includes("off") ||
        activeSched.shift_start === "OFF" ||
        activeSched.shift_end === "OFF";

      if (isRest) {
        row.isRestDay = true;
        row.isAbsent = false;
        row.status = "Rest Day";
        row.statusSubtitle = "Scheduled Rest Day / Day Off";
        isRestDay = true;
      }

      const rawNotes = activeSched.notes || "";
      if (rawNotes.includes("[REST_DAY]")) isRestDay = true;
      else if (rawNotes.includes("[REG_HOLIDAY]")) isRegularHoliday = true;
      else if (rawNotes.includes("[SPL_HOLIDAY]")) isSpecialHoliday = true;
      else {
        const labelUpper = (activeSched.label || "").toUpperCase();
        if (labelUpper.includes("REST") || labelUpper.includes("REST DAY")) {
          isRestDay = true;
        } else if (labelUpper.includes("REGULAR HOLIDAY") || labelUpper.includes("REG HOLIDAY")) {
          isRegularHoliday = true;
        } else if (labelUpper.includes("SPECIAL HOLIDAY") || labelUpper.includes("SPL HOLIDAY")) {
          isSpecialHoliday = true;
        }
      }
    }

    let workType = "regular";
    if (isRestDay) workType = "rest_day";
    else if (isRegularHoliday) workType = "regular_holiday";
    else if (isSpecialHoliday) workType = "special_holiday";
    row.workType = workType;

    rowsByEmployee[employee.id] = row;
  });

  const recordsByEmployee = {};

  records
    .filter((record) => record.date === date)
    .slice()
    .sort((first, second) => new Date(first.timestamp) - new Date(second.timestamp))
    .forEach((record) => {
      const employeeId = record.userId || record.employeeId;
      if (!employeeId) return;

      if (!recordsByEmployee[employeeId]) recordsByEmployee[employeeId] = [];
      recordsByEmployee[employeeId].push(record);

      if (!rowsByEmployee[employeeId]) {
        const row = createEmptyDailyRow(
          {
            id: employeeId,
            fullName: record.employeeName,
            email: record.employeeEmail,
          },
          date,
        );

        // Find active schedule for this dynamically discovered employee on this date
        const activeSched = schedulesList.find(
          (s) => s.user_id === employeeId && s.date === date
        );

        let isRestDay = false;
        let isRegularHoliday = false;
        let isSpecialHoliday = false;

        if (activeSched) {
          row.scheduleLabel = activeSched.label;
          row.scheduleStart = activeSched.shift_start;
          row.scheduleEnd = activeSched.shift_end;
          row.scheduleColor = activeSched.color;
          row.scheduleNotes = activeSched.notes;

          const isRest =
            String(activeSched.label || "").toLowerCase().includes("rest") ||
            String(activeSched.label || "").toLowerCase().includes("off") ||
            activeSched.shift_start === "OFF" ||
            activeSched.shift_end === "OFF";

          if (isRest) {
            row.isRestDay = true;
            row.isAbsent = false;
            row.status = "Rest Day";
            row.statusSubtitle = "Scheduled Rest Day / Day Off";
            isRestDay = true;
          }

          const rawNotes = activeSched.notes || "";
          if (rawNotes.includes("[REST_DAY]")) isRestDay = true;
          else if (rawNotes.includes("[REG_HOLIDAY]")) isRegularHoliday = true;
          else if (rawNotes.includes("[SPL_HOLIDAY]")) isSpecialHoliday = true;
          else {
            const labelUpper = (activeSched.label || "").toUpperCase();
            if (labelUpper.includes("REST") || labelUpper.includes("REST DAY")) {
              isRestDay = true;
            } else if (labelUpper.includes("REGULAR HOLIDAY") || labelUpper.includes("REG HOLIDAY")) {
              isRegularHoliday = true;
            } else if (labelUpper.includes("SPECIAL HOLIDAY") || labelUpper.includes("SPL HOLIDAY")) {
              isSpecialHoliday = true;
            }
          }
        }

        let workType = "regular";
        if (isRestDay) workType = "rest_day";
        else if (isRegularHoliday) workType = "regular_holiday";
        else if (isSpecialHoliday) workType = "special_holiday";
        row.workType = workType;

        rowsByEmployee[employeeId] = row;
      }
    });

  Object.entries(recordsByEmployee).forEach(([employeeId, employeeRecords]) => {
    const row = rowsByEmployee[employeeId];
    const timeIn = employeeRecords.find((record) => record.action === "time_in");
    const timeOut = [...employeeRecords].reverse().find((record) => record.action === "time_out");
    const latest = employeeRecords[employeeRecords.length - 1];

    const firstBreakIn = employeeRecords.find((record) => record.action === "break_in");
    const lastBreakOut = [...employeeRecords].reverse().find((record) => record.action === "break_out");
    const allBreakIns = employeeRecords.filter((record) => record.action === "break_in");

    // Find active schedule for rules override
    const activeSched = schedulesList.find(
      (s) => s.user_id === employeeId && s.date === date
    );

    let employeeRules = getEmployeeOverridenRules(employeeId, rules?.id, rules);
    if (activeSched && activeSched.shift_start !== "OFF" && activeSched.shift_end !== "OFF") {
      employeeRules.shiftStartTime = activeSched.shift_start;
      employeeRules.expectedWorkHours = calculateShiftExpectedHours(activeSched.shift_start, activeSched.shift_end);
    } else if (activeSched && (activeSched.shift_start === "OFF" || activeSched.shift_end === "OFF")) {
      employeeRules.shiftStartTime = "";
      employeeRules.expectedWorkHours = 0;
    }

    row.expectedWorkHours = employeeRules.expectedWorkHours ?? rules.expectedWorkHours ?? 8;

    row.isAbsent = !timeIn;
    row.latestAction = latest?.action || "";
    row.latestTimestamp = latest?.timestamp || "";

    if (timeIn) {
      row.timeIn = timeIn.time;
      row.timeInRaw = timeIn.timestamp;
      row.lateMinutes = minutesLateFromTimestamp(timeIn.timestamp, employeeRules);
      row.verificationPhoto = timeIn.verificationPhoto || "";
    }

    // Extract multiple breaks paired chronologically
    const adminBreaks = [];
    let currentAdminBreak = null;

    employeeRecords.forEach((e) => {
      if (e.action === "break_in") {
        currentAdminBreak = { breakIn: e.timestamp || e.created_at, breakOut: null };
      } else if (e.action === "break_out" && currentAdminBreak) {
        currentAdminBreak.breakOut = e.timestamp || e.created_at;
        adminBreaks.push(currentAdminBreak);
        currentAdminBreak = null;
      }
    });
    if (currentAdminBreak) {
      adminBreaks.push(currentAdminBreak);
    }

    if (adminBreaks.length > 0) {
      const formatTimeOption = (ts) => {
        if (!ts) return "-";
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };
      row.breakIn = adminBreaks.map(b => formatTimeOption(b.breakIn)).join(", ");
      row.breakOut = adminBreaks.map(b => formatTimeOption(b.breakOut)).join(", ");
    } else {
      row.breakIn = "-";
      row.breakOut = "-";
    }

    if (firstBreakIn) {
      row.breakInRaw = firstBreakIn.timestamp;
    }

    if (lastBreakOut) {
      row.breakOutRaw = lastBreakOut.timestamp;
    }

    row.breakCount = allBreakIns.length;

    if (timeOut) {
      row.timeOut = timeOut.time;
      row.timeOutRaw = timeOut.timestamp;
      row.undertimeMinutes = minutesUndertimeFromTimestamps(timeOut.timestamp, employeeRules);
      row.timeOutVerificationPhoto = timeOut.verificationPhoto || "";
    }

    row.isOnBreak = latest?.action === "break_in";
    row.breakMinutes = calculateBreakMinutesFromEvents(employeeRecords, employeeRules);
    row.workedMinutes = calculateWorkedMinutesFromEvents(employeeRecords, employeeRules);
    row.totalHours = minutesToHours(row.workedMinutes);

    row.overtimeReason = timeOut?.overtime_reason || latest?.overtime_reason || "";
    row.overtimeApproved = timeOut?.overtime_approved ?? latest?.overtime_approved ?? null;

    if (latest?.comment) row.comment = latest.comment;

    // Refine workType based on comments in records (in case manually tagged)
    let isRestDay = row.isRestDay || false;
    let isRegularHoliday = row.workType === "regular_holiday";
    let isSpecialHoliday = row.workType === "special_holiday";

    const anyComment = employeeRecords.map((r) => r.comment || "").join(" ");
    if (anyComment.includes("[REST_DAY]")) isRestDay = true;
    else if (anyComment.includes("[REG_HOLIDAY]")) isRegularHoliday = true;
    else if (anyComment.includes("[SPL_HOLIDAY]")) isSpecialHoliday = true;

    let workType = "regular";
    if (isRestDay) workType = "rest_day";
    else if (isRegularHoliday) workType = "regular_holiday";
    else if (isSpecialHoliday) workType = "special_holiday";
    row.workType = workType;

    row.status = getAttendanceState(row);
    row.statusSubtitle = getAttendanceSubtitle(row);
  });

  return Object.values(rowsByEmployee);
}

export function buildAttendanceRowsForRange(
  records,
  employees = [],
  startDate = todayKey(),
  endDate = startDate,
  rules = {},
) {
  const employeeIds = new Set(employees.map((employee) => employee.id));
  const dates = [
    ...new Set(
      records
        .map((record) => record.date)
        .filter(
          (date) =>
            date &&
            compareDateKeys(date, startDate) >= 0 &&
            compareDateKeys(date, endDate) <= 0,
        ),
    ),
  ].sort((first, second) => compareDateKeys(second, first));

  if (dates.length === 0 && compareDateKeys(startDate, endDate) === 0) {
    dates.push(startDate);
  }

  return dates.flatMap((date) =>
    buildDailyAttendanceRows(
      records.filter((record) => record.date === date),
      employees,
      date,
      rules,
    ).filter((row) => employeeIds.has(row.employeeId) || !row.isAbsent),
  );
}

export function buildActivityFeedFromAttendance(records) {
  if (!records.length) return [];

  return records
    .slice()
    .sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp))
    .slice(0, 8)
    .map((record) => ({
      id: record.id,
      name: record.employeeName,
      action: record.actionLabel,
      subtitle: `${record.actionLabel} recorded`,
      time: record.time,
      status: record.status,
      timestamp: record.timestamp,
    }));
}

export function buildWeeklyChartFromAttendance(records, rules = {}) {
  return dayLabels.map((day, index) => {
    const jsDay = index === 6 ? 0 : index + 1;
    const dayRecords = records.filter((record) => new Date(record.date).getDay() === jsDay);
    const datesForDay = [...new Set(dayRecords.map((record) => record.date).filter(Boolean))];

    const dayRows = datesForDay.flatMap((date) =>
      buildDailyAttendanceRows(
        dayRecords.filter((record) => record.date === date),
        [],
        date,
        rules,
      ),
    );

    const totalMinutes = dayRows.reduce((sum, row) => sum + (row.workedMinutes || 0), 0);
    const attendance = dayRows.filter((row) => row.timeInRaw).length;

    return {
      day,
      attendance,
      hours: Number((totalMinutes / 60).toFixed(2)),
    };
  });
}

export function buildOverviewFromAttendance(employees, dailyRows) {
  const activeEmployeeCount = employees.length;
  const present = dailyRows.filter((row) => row.timeInRaw && !row.isAbsent).length;
  const late = dailyRows.filter((row) => row.lateMinutes > 0).length;
  const onBreak = dailyRows.filter((row) => row.status === "On Break").length;
  const completed = dailyRows.filter((row) => row.status === "Completed").length;
  const absent = Math.max(0, activeEmployeeCount - present);
  const totalMinutes = dailyRows.reduce((sum, row) => sum + (row.workedMinutes || 0), 0);

  return {
    activeEmployeeCount,
    present,
    late,
    onBreak,
    completed,
    absent,
    totalHours: minutesToHours(totalMinutes),
  };
}

export function summarizeAttendanceRows(rows, rules = {}) {
  const attendanceRules = normalizeAttendanceRules(rules);
  const expectedMinutes = Math.max(1, Math.round(attendanceRules.expectedWorkHours * 60));

  const workedMinutes = rows.reduce((sum, row) => sum + (row.workedMinutes || 0), 0);
  const undertimeMinutes = rows.reduce((sum, row) => sum + (row.undertimeMinutes || 0), 0);
  const overtimeMinutes = rows.reduce(
    (sum, row) => sum + Math.max(0, (row.workedMinutes || 0) - expectedMinutes),
    0,
  );

  return {
    rows: rows.length,
    workedMinutes,
    workedHours: workedMinutes / 60,
    totalHours: minutesToHours(workedMinutes),
    undertimeMinutes,
    undertimeHours: minutesToHours(undertimeMinutes),
    overtimeMinutes,
    overtimeHours: minutesToHours(overtimeMinutes),
    lateCount: rows.filter((row) => row.lateMinutes > 0).length,
    absentCount: rows.filter((row) => row.isAbsent).length,
    completedCount: rows.filter((row) => row.status === "Completed").length,
  };
}

export function estimatePayrollForRows(rows, employee = {}, rules = {}) {
  const attendanceRules = normalizeAttendanceRules(rules);

  const hourlyRate = Number(
    employee.hourlyRate ||
      employee.hourly_rate ||
      attendanceRules.hourlyRate ||
      0,
  );

  const dailyRate = Number(
    employee.dailyRate ||
      employee.daily_rate ||
      attendanceRules.dailyRate ||
      0,
  );

  const expectedMinutes = Math.max(1, Math.round(attendanceRules.expectedWorkHours * 60));
  const completedRows = rows.filter((row) => row.timeInRaw && row.timeOutRaw);

  const workedMinutes = completedRows.reduce(
    (sum, row) => sum + (row.workedMinutes || 0),
    0,
  );

  const undertimeMinutes = completedRows.reduce(
    (sum, row) => sum + (row.undertimeMinutes || 0),
    0,
  );

  const overtimeMinutes = completedRows.reduce(
    (sum, row) => sum + Math.max(0, (row.workedMinutes || 0) - expectedMinutes),
    0,
  );

  const regularMinutes = Math.max(0, workedMinutes - overtimeMinutes);

  let regularPay = 0;
  let overtimePay = 0;

  if (hourlyRate > 0) {
    regularPay = (regularMinutes / 60) * hourlyRate;
    overtimePay = (overtimeMinutes / 60) * hourlyRate * attendanceRules.overtimeRate;
  } else if (dailyRate > 0) {
    regularPay = (regularMinutes / expectedMinutes) * dailyRate;
    overtimePay = (overtimeMinutes / expectedMinutes) * dailyRate * attendanceRules.overtimeRate;
  }

  const estimate = regularPay + overtimePay;

  return {
    workedMinutes,
    undertimeMinutes,
    overtimeMinutes,
    regularMinutes,
    totalHours: minutesToHours(workedMinutes),
    undertimeHours: minutesToHours(undertimeMinutes),
    overtimeHours: minutesToHours(overtimeMinutes),
    regularPay,
    overtimePay,
    estimate,
    estimateLabel: formatCurrency(estimate),
  };
}

export async function createAttendanceAction({ action, profile, workspaceId, comment, overtimeReason, latitude, longitude, timestamp, verificationPhoto }) {
  if (!supabase || !workspaceId || !profile?.id) {
    throw new Error("Missing workspace or employee profile.");
  }

  const normalizedAction = normalizeAction(action);
  const recordTimestamp = timestamp || new Date().toISOString();

  const payload = {
    workspace_id: workspaceId,
    user_id: profile.id,
    action: normalizedAction,
    status: getActionStatus(normalizedAction),
    timestamp: recordTimestamp,
    date: todayKey(new Date(recordTimestamp)),
    created_at: recordTimestamp,
  };

  if (latitude != null) payload.latitude = Number(latitude);
  if (longitude != null) payload.longitude = Number(longitude);

  // Save comment if provided (requires a `comment` TEXT column in attendance_records)
  if (comment && comment.trim()) {
    payload.comment = comment.trim();
  }

  if (overtimeReason && overtimeReason.trim()) {
    payload.overtime_reason = overtimeReason.trim();
  }

  if (verificationPhoto) {
    payload.verification_photo = verificationPhoto;
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return normalizeAttendanceRecord(data, { [profile.id]: profile });
}

export function buildAttendanceCsvRows(records) {
  const normalizedRows = records.map((record) => {
    if ("timeIn" in record || "timeOut" in record || "totalHours" in record) {
      return record;
    }

    return {
      employeeName: record.employeeName,
      date: record.date,
      timeIn: record.action === "time_in" ? record.time : "",
      breakIn: record.action === "break_in" ? record.time : "",
      breakOut: record.action === "break_out" ? record.time : "",
      timeOut: record.action === "time_out" ? record.time : "",
      totalHours: "",
      status: record.status,
      lateMinutes: record.lateMinutes,
      undertimeMinutes: record.undertimeMinutes,
    };
  });

  return [
    ["Employee Name", "Date", "Time In", "Break In", "Break Out", "Time Out", "Total Hours", "Status", "Late", "Undertime"],
    ...normalizedRows.map((record) => [
      record.employeeName,
      record.date,
      record.timeIn || "-",
      record.breakIn || "-",
      record.breakOut || "-",
      record.timeOut || "-",
      record.totalHours || "0h 00m",
      record.status || "-",
      `${record.lateMinutes || 0}m`,
      `${record.undertimeMinutes || 0}m`,
    ]),
  ];
}

export async function updateOvertimeApproval({ workspaceId, employeeId, date, approved, approvedHours }) {
  if (!supabase || !workspaceId || !employeeId || !date) {
    throw new Error("Missing required parameters for overtime approval.");
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .update({
      overtime_approved: approved,
      overtime_approved_hours: approvedHours
    })
    .eq("workspace_id", workspaceId)
    .eq("user_id", employeeId)
    .eq("date", date)
    .select();

  if (error) throw error;
  return data;
}