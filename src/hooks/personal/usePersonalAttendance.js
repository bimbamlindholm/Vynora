import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { supabase } from "../../lib/supabaseClient";
import { calculateNightDifferentialMinutes } from "../../utils/payrollCalculator";
import { getHolidayDetails } from "../../utils/holidays";
import {
  safeLocalStorage,
  VynoraDeveloperLogger,
  getLocalDateString,
  getLocalTime24,
  formatTime12,
  isBeforeEndTime,
  toUTCISO,
} from "../../utils/personalDashboardHelpers";
import {
  minutesFromTotalHours,
  minutesToHours,
} from "../../utils/supabaseAttendance";

export function usePersonalAttendance({ settings, schedules }) {
  const { addToast } = useToast();
  const { user, workspace, role, profile } = useAuth();

  const getScheduleForDate = (dateStr) => {
    if (!dateStr) return null;
    return (schedules || []).find((schedule) => schedule.date === dateStr) || null;
  };

  const requireScheduleForDate = (dateStr, actionLabel = "create or edit an attendance log") => {
    const schedule = getScheduleForDate(dateStr);
    if (schedule) return true;

    addToast(
      `Please add a Work Schedule for ${dateStr || "this date"} before you ${actionLabel}.`,
      "warning"
    );
    return false;
  };


  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [ephemeralSelfie, setEphemeralSelfie] = useState(null);
  const [ephemeralSelfieCountdown, setEphemeralSelfieCountdown] = useState(10);
  const [ephemeralActionName, setEphemeralActionName] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateRow, setSelectedDateRow] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    timeIn: "",
    timeOut: "",
    breaks: [],
    notes: "",
    workType: "regular",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [addForm, setAddForm] = useState({
    date: getLocalDateString(),
    timeIn: "09:00",
    timeOut: "",
    hasBreak: true,
    breaks: [{ breakIn: "12:00", breakOut: "13:00" }],
    notes: "",
    workType: "regular",
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const [diaryNotes, setDiaryNotes] = useState({});
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [selectedDiaryDate, setSelectedDiaryDate] = useState("");
  const [diaryText, setDiaryText] = useState("");

  const [historyFilter, setHistoryFilter] = useState("month");
  const [historyStart, setHistoryStart] = useState("");
  const [historyEnd, setHistoryEnd] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [historySearch, setHistorySearch] = useState("");

  // Ticking clock for dashboard widget
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ephemeral Selfie Auto Purge Timer
  useEffect(() => {
    if (!ephemeralSelfie) return;

    setEphemeralSelfieCountdown(10);
    const interval = setInterval(() => {
      setEphemeralSelfieCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEphemeralSelfie(null);
          addToast("DTR photo safely purged from memory to save server storage.", "info");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ephemeralSelfie]);

  // Load diary entries
  useEffect(() => {
    if (user?.id) {
      const saved = safeLocalStorage.getItem(`vynora_personal_diary_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setDiaryNotes(parsed);
          } else {
            setDiaryNotes({});
          }
        } catch (e) {
          console.error("Failed to parse diary notes", e);
          setDiaryNotes({});
        }
      }
    }
  }, [user?.id]);

  const fetchRecords = async () => {
    if (!workspace?.id || !user?.id) {
      setLoading(false);
      return;
    }

    const cacheKey = `vynora_records_cache_${user.id}`;
    const cached = safeLocalStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setRawRecords(parsed);
        } else {
          setRawRecords([]);
        }
      } catch (e) {
        console.error("Failed to parse cached records", e);
        setRawRecords([]);
      }
    }

    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      VynoraDeveloperLogger.log("DTR Sync", `Fetching personal DTR logs from cloud for workspace: ${workspace.id}...`);
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .order("timestamp", { ascending: true });

      if (error) throw error;
      const records = data || [];
      setRawRecords(records);
      safeLocalStorage.setItem(cacheKey, JSON.stringify(records));
      VynoraDeveloperLogger.log("DTR Sync", `Successfully loaded and cached ${records.length} DTR records.`);
    } catch (err) {
      VynoraDeveloperLogger.log("DTR Sync", "Failed to load DTR logs from cloud", err, "error");
      if (navigator.onLine) {
        addToast("Failed to fetch DTR logs from cloud.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineQueue = async () => {
    if (!navigator.onLine || !workspace?.id || !user?.id || !supabase) return;

    const queueKey = `vynora_offline_queue_${user.id}`;
    const rawQueue = safeLocalStorage.getItem(queueKey);
    if (!rawQueue) return;

    let queue;
    try {
      queue = JSON.parse(rawQueue);
    } catch (e) {
      console.error("Failed to parse offline queue", e);
      return;
    }

    if (queue.length === 0) return;

    addToast(`Syncing ${queue.length} offline operation(s) with cloud...`, "info");

    for (const op of queue) {
      try {
        if (op.type === "insert_clock") {
          const { error } = await supabase.from("attendance_records").insert(op.payload);
          if (error) throw error;
        } else if (op.type === "add_manual" || op.type === "save_edit") {
          const { error: delError } = await supabase
            .from("attendance_records")
            .delete()
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id)
            .eq("date", op.date);
          if (delError) throw delError;

          if (op.payload && op.payload.length > 0) {
            const { error: insError } = await supabase.from("attendance_records").insert(op.payload);
            if (insError) throw insError;
          }
        } else if (op.type === "delete_row") {
          const { error } = await supabase
            .from("attendance_records")
            .delete()
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id)
            .eq("date", op.date);
          if (error) throw error;
        } else if (op.type === "delete_all") {
          const { error } = await supabase
            .from("attendance_records")
            .delete()
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id);
          if (error) throw error;
        }
      } catch (err) {
        console.error("Failed to sync offline operation:", op, err);
        addToast("Offline sync paused. Will retry later.", "warning");
        return;
      }
    }

    safeLocalStorage.removeItem(queueKey);
    addToast("All offline logs successfully synchronized with the cloud!", "success");
    await fetchRecords();
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [workspace?.id, user?.id]);

  useEffect(() => {
    fetchRecords();
  }, [workspace, user?.id]);

  const dailyRows = useMemo(() => {
    const daysMap = {};
    if (!rawRecords || !Array.isArray(rawRecords)) return [];

    rawRecords.forEach((rec) => {
      if (!rec || !rec.date) return;
      const dKey = rec.date;
      if (!daysMap[dKey]) {
        daysMap[dKey] = [];
      }
      daysMap[dKey].push(rec);
    });

    return Object.entries(daysMap)
      .map(([dateStr, events]) => {
        const sortedEvents = events
          .filter((e) => e && e.timestamp)
          .sort((a, b) => {
            const tA = new Date(a.timestamp).getTime();
            const tB = new Date(b.timestamp).getTime();
            if (isNaN(tA) || isNaN(tB)) return 0;
            return tA - tB;
          });

        const timeIn = sortedEvents.find((e) => e.action === "time_in");
        const timeOut = [...sortedEvents].reverse().find((e) => e.action === "time_out");
        const firstBreakIn = sortedEvents.find((e) => e.action === "break_in");
        const lastBreakOut = [...sortedEvents].reverse().find((e) => e.action === "break_out");

        const breaks = [];
        let currentBreak = null;

        sortedEvents.forEach((e) => {
          if (e.action === "break_in") {
            currentBreak = { breakIn: e.timestamp, breakOut: null };
          } else if (e.action === "break_out" && currentBreak) {
            currentBreak.breakOut = e.timestamp;
            breaks.push(currentBreak);
            currentBreak = null;
          }
        });
        if (currentBreak) {
          breaks.push(currentBreak);
        }

        let breakInStr = "-";
        let breakOutStr = "-";
        if (breaks.length > 0) {
          const formatTimeOption = (ts) => {
            if (!ts) return "-";
            return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          };
          breakInStr = breaks.map((b) => formatTimeOption(b.breakIn)).join(", ");
          breakOutStr = breaks.map((b) => formatTimeOption(b.breakOut)).join(", ");
        }

        const dayShift = Array.isArray(schedules) ? schedules.find((s) => s && s.date === dateStr) : null;
        const dayBreakIsPaid =
          dayShift && typeof dayShift.notes === "string" && dayShift.notes.includes("[PAID_BREAK]")
            ? true
            : dayShift && typeof dayShift.notes === "string" && dayShift.notes.includes("[UNPAID_BREAK]")
            ? false
            : !!settings.breakIsPaid;

        const anyComment = sortedEvents.map((e) => e.comment).find(Boolean) || "";
        const cleanNotes = anyComment.replace(/\[REST_DAY\]|\[REG_HOLIDAY\]|\[SPL_HOLIDAY\]/g, "").trim();

        let isRestDay = false;
        let isRegularHoliday = false;
        let isSpecialHoliday = false;

        if (dayShift) {
          if (dayShift.notes && typeof dayShift.notes === "string") {
            const notesUpper = dayShift.notes.toUpperCase();
            if (dayShift.notes.includes("[REST_DAY]")) {
              isRestDay = true;
            } else if (
              dayShift.notes.includes("[REG_HOLIDAY]") ||
              notesUpper.includes("REGULAR HOLIDAY PAY") ||
              notesUpper.includes("REGULAR HOLIDAY")
            ) {
              isRegularHoliday = true;
            } else if (
              dayShift.notes.includes("[SPL_HOLIDAY]") ||
              notesUpper.includes("SPECIAL HOLIDAY PAY") ||
              notesUpper.includes("SPECIAL HOLIDAY")
            ) {
              isSpecialHoliday = true;
            }
          }

          if (!isRestDay && !isRegularHoliday && !isSpecialHoliday) {
            const labelUpper = (dayShift.label || "").toString().toUpperCase();
            if (labelUpper.includes("REST") || labelUpper.includes("REST DAY")) {
              isRestDay = true;
            } else if (
              labelUpper.includes("REGULAR HOLIDAY PAY") ||
              labelUpper.includes("REGULAR HOLIDAY") ||
              labelUpper.includes("REG HOLIDAY")
            ) {
              isRegularHoliday = true;
            } else if (
              labelUpper.includes("SPECIAL HOLIDAY PAY") ||
              labelUpper.includes("SPECIAL HOLIDAY") ||
              labelUpper.includes("SPL HOLIDAY")
            ) {
              isSpecialHoliday = true;
            }
          }
        } else {
          if (anyComment.includes("[REST_DAY]")) isRestDay = true;
          else if (anyComment.includes("[REG_HOLIDAY]")) isRegularHoliday = true;
          else if (anyComment.includes("[SPL_HOLIDAY]")) isSpecialHoliday = true;
        }

        let workType = "regular";
        if (isRestDay) workType = "rest_day";
        else if (isRegularHoliday) workType = "regular_holiday";
        else if (isSpecialHoliday) workType = "special_holiday";

        let workedMinutes = 0;
        let totalBreakMinutes = 0;

        const activeShiftStart = dayShift?.shift_start || "09:15";
        const activeShiftEnd = dayShift?.shift_end || "19:15";

        let status = "Not timed in";
        const lastAction = sortedEvents[sortedEvents.length - 1]?.action;
        if (timeIn && !timeOut) {
          if (lastAction === "break_in") {
            status = "On break";
          } else {
            status = "Working";
          }
        } else if (timeIn && timeOut) {
          status = "Timed out";
        }

        if (timeIn) {
          let payableStart = new Date(timeIn.timestamp);

          if (activeShiftStart && typeof activeShiftStart === "string" && activeShiftStart.includes(":")) {
            const inDate = new Date(timeIn.timestamp);
            const [shiftH, shiftM] = activeShiftStart.split(":").map(Number);
            const shiftStart = new Date(inDate);
            shiftStart.setHours(shiftH || 0, shiftM || 0, 0, 0);

            if (inDate < shiftStart) {
              payableStart = shiftStart;
            }
          }

          const activeOngoingBreak = breaks.find((b) => b.breakIn && !b.breakOut);

          const endTime = timeOut
            ? new Date(timeOut.timestamp)
            : activeOngoingBreak
            ? new Date(activeOngoingBreak.breakIn)
            : currentTime;

          if (endTime >= payableStart) {
            let totalBreakDeductionMs = 0;
            breaks.forEach((b) => {
              if (b.breakIn && b.breakOut) {
                const bStart = new Date(b.breakIn);
                const bEnd = new Date(b.breakOut);
                const actualDurationMs = bEnd - bStart;
                const standardDurationMs = Number(settings?.breakDurationMinutes || 60) * 60 * 1000;
                const requiredBreakEnd = new Date(bStart.getTime() + standardDurationMs);

                const deductionMs =
                  endTime < requiredBreakEnd ? endTime - bStart : Math.max(actualDurationMs, standardDurationMs);
                totalBreakDeductionMs += deductionMs;
              }
            });

            const grossMs = Math.max(0, endTime - payableStart);
            const breakDeductionMs = dayBreakIsPaid ? 0 : totalBreakDeductionMs;
            workedMinutes = Math.max(0, Math.round((grossMs - breakDeductionMs) / 60000));
            totalBreakMinutes = Math.round(breakDeductionMs / 60000);
          } else {
            workedMinutes = 0;
            totalBreakMinutes = 0;
          }
        }

        let lateMinutes = 0;
        if (timeIn && activeShiftStart && typeof activeShiftStart === "string" && activeShiftStart.includes(":")) {
          const inDate = new Date(timeIn.timestamp);
          const [shiftH, shiftM] = activeShiftStart.split(":").map(Number);
          const shiftStart = new Date(inDate);
          shiftStart.setHours(shiftH || 0, shiftM || 0, 0, 0);

          const diffMinutes = Math.round((inDate - shiftStart) / 60000);
          if (diffMinutes > (settings?.graceMinutes || 0)) {
            lateMinutes = diffMinutes;
          }
        }

        let dayExpectedWorkHours = settings?.expectedWorkHours || 8;
        if (
          activeShiftStart &&
          typeof activeShiftStart === "string" &&
          activeShiftStart.includes(":") &&
          activeShiftEnd &&
          typeof activeShiftEnd === "string" &&
          activeShiftEnd.includes(":")
        ) {
          const [sh, sm] = activeShiftStart.split(":").map(Number);
          const [eh, em] = activeShiftEnd.split(":").map(Number);
          if (!(sh === 0 && sm === 0 && eh === 0 && em === 0) && activeShiftStart !== activeShiftEnd) {
            let diffMinutes = eh * 60 + em - (sh * 60 + sm);
            if (diffMinutes < 0) diffMinutes += 24 * 60;
            const unpaidBreakDeduct = dayBreakIsPaid ? 0 : 60;
            dayExpectedWorkHours = Math.max(1, (diffMinutes - unpaidBreakDeduct) / 60);
          }
        }

        const expectedMinutes = dayExpectedWorkHours * 60;
        let overtimeMinutes = 0;

        if (workedMinutes > expectedMinutes) {
          const rawOvertimeMinutes = workedMinutes - expectedMinutes;
          const block = Number(settings?.overtimeIncrementBlock || 1);
          overtimeMinutes = Math.floor(rawOvertimeMinutes / block) * block;
        }

        const multiplier =
          workType === "regular_holiday"
            ? settings?.holidayOvertimeRate || 2.0
            : workType === "special_holiday"
            ? settings?.holidaySpecialRate || 1.3
            : workType === "rest_day"
            ? settings?.restDayRate || 1.3
            : 1.0;

        const effectiveHourlyRate =
          settings?.payType === "hourly"
            ? settings?.hourlyRate || 100
            : (settings?.dailyRate || 800) / dayExpectedWorkHours;

        let regularPay;
        let overtimePay;

        if (settings?.payType === "hourly") {
          const regularHours = Math.max(0, Math.min(workedMinutes - overtimeMinutes, expectedMinutes) / 60);
          regularPay = regularHours * (settings?.hourlyRate || 100) * multiplier;
        } else {
          const regularWorkedMinutes = Math.max(0, Math.min(workedMinutes, expectedMinutes));
          const progressRatio = Math.min(regularWorkedMinutes / expectedMinutes, 1);
          regularPay = (settings?.dailyRate || 800) * progressRatio * multiplier;
        }

        const dayNightDiffMinutes = calculateNightDifferentialMinutes(
          timeIn ? timeIn.timestamp : "",
          timeOut ? timeOut.timestamp : "",
          firstBreakIn ? firstBreakIn.timestamp : "",
          lastBreakOut ? lastBreakOut.timestamp : ""
        );

        const nightDiffRateMultiplier = Number(settings?.nightDiffRate ?? 0.10);
        const dayNightDiffPay = (dayNightDiffMinutes / 60) * (effectiveHourlyRate * multiplier) * nightDiffRateMultiplier;

        const isHoliday = workType === "regular_holiday" || workType === "special_holiday";
        const otMultiplier = isHoliday ? settings?.holidayOvertimeRate || 2.0 : settings?.overtimeRate || 1.25;
        overtimePay = (overtimeMinutes / 60) * effectiveHourlyRate * otMultiplier * multiplier;
        const estimatedEarnings = regularPay + overtimePay + dayNightDiffPay;

        return {
          id: dateStr,
          date: dateStr,
          timeIn: timeIn ? timeIn.timestamp : "",
          timeInRaw: timeIn ? timeIn.timestamp : "",
          timeOut: timeOut ? timeOut.timestamp : "",
          timeOutRaw: timeOut ? timeOut.timestamp : "",
          breakIn: breakInStr,
          breakInRaw: firstBreakIn ? firstBreakIn.timestamp : "",
          breakOut: breakOutStr,
          breakOutRaw: lastBreakOut ? lastBreakOut.timestamp : "",
          breaks,
          notes: cleanNotes,
          workType,
          workedMinutes,
          breakMinutes: totalBreakMinutes,
          lateMinutes,
          overtimeMinutes,
          status,
          regularPay,
          overtimePay,
          nightDiffMinutes: dayNightDiffMinutes,
          nightDiffPay: dayNightDiffPay,
          estimatedEarnings,
          isAbsent: !timeIn,
          events: sortedEvents,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rawRecords, settings, currentTime, schedules]);

  const todayRow = useMemo(() => {
    const tKey = getLocalDateString(currentTime);
    return dailyRows.find((r) => r.date === tKey) || null;
  }, [dailyRows, currentTime]);

  const analyticsSummary = useMemo(() => {
    const now = new Date(currentTime);
    const day = now.getDate();
    let cutoffStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let cutoffEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (settings.cutoffType === "weekly") {
      const currentDay = now.getDay();
      const distance = currentDay === 0 ? -6 : 1 - currentDay;
      cutoffStart = new Date(now);
      cutoffStart.setDate(now.getDate() + distance);
      cutoffStart.setHours(0, 0, 0, 0);
      cutoffEnd = new Date(cutoffStart);
      cutoffEnd.setDate(cutoffStart.getDate() + 6);
      cutoffEnd.setHours(23, 59, 59, 999);
    } else if (settings.cutoffType === "semi-monthly") {
      if (day <= 15) {
        cutoffStart = new Date(now.getFullYear(), now.getMonth(), 1);
        cutoffEnd = new Date(now.getFullYear(), now.getMonth(), 15);
      } else {
        cutoffStart = new Date(now.getFullYear(), now.getMonth(), 16);
        cutoffEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    }

    const startStr = getLocalDateString(cutoffStart);
    const endStr = getLocalDateString(cutoffEnd);

    const monthRows = dailyRows.filter((r) => r.date.slice(0, 7) === getLocalDateString(now).slice(0, 7));
    const cutoffRows = dailyRows.filter((r) => r.date >= startStr && r.date <= endStr);

    const mon = new Date(now);
    mon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    const weekStart = getLocalDateString(mon);
    const weekRows = dailyRows.filter((r) => r.date >= weekStart);

    const todayEarnings = todayRow ? todayRow.estimatedEarnings : 0;
    const todayWorkedHours = todayRow ? todayRow.workedMinutes / 60 : 0;
    const todayBreakTime = todayRow ? todayRow.breakMinutes : 0;

    const cutoffEarnings = cutoffRows.reduce((sum, r) => sum + r.estimatedEarnings, 0);
    const cutoffHours = cutoffRows.reduce((sum, r) => sum + r.workedMinutes / 60, 0);

    const weeklyEarnings = weekRows.reduce((sum, r) => sum + r.estimatedEarnings, 0);

    const monthlyEarnings = monthRows.reduce((sum, r) => sum + r.estimatedEarnings, 0);
    const monthlyHours = monthRows.reduce((sum, r) => sum + r.workedMinutes / 60, 0);

    const totalOvertimeHours = monthRows.reduce((sum, r) => sum + r.overtimeMinutes / 60, 0);
    const totalLateMinutes = monthRows.reduce((sum, r) => sum + r.lateMinutes, 0);
    const totalLateCount = monthRows.filter((r) => r.lateMinutes > 0).length;

    const completedDays = monthRows.filter((r) => r.status === "Timed out").length;
    const avgDailyHours = completedDays > 0 ? monthlyHours / completedDays : 0;

    const incompleteRecords = dailyRows.filter(
      (r) => r.timeIn && !r.timeOut && r.date !== getLocalDateString(currentTime)
    );

    return {
      todayEarnings,
      todayWorkedHours,
      todayBreakTime,
      cutoffEarnings,
      cutoffHours,
      weeklyEarnings,
      monthlyEarnings,
      monthlyHours,
      totalOvertimeHours,
      totalLateMinutes,
      totalLateCount,
      avgDailyHours,
      incompleteRecords,
    };
  }, [dailyRows, todayRow, settings, currentTime]);

  const dtrButtonsConfig = useMemo(() => {
    const isClockedIn = todayRow && todayRow.timeIn && !todayRow.timeOut;
    const isOnBreak = todayRow?.status === "On break";

    const todayKey = getLocalDateString(currentTime);
    const todayShift = schedules.find((s) => s.date === todayKey);
    const shiftNotFinished = todayShift && isBeforeEndTime(todayShift.shift_end);

    return {
      canTimeIn: !isClockedIn && (!todayRow || !todayRow.timeOut),
      canBreakIn: isClockedIn && !isOnBreak,
      canBreakOut: isClockedIn && isOnBreak,
      canTimeOut: isClockedIn,
      shiftNotFinished: !!shiftNotFinished,
      todayShiftEnd: todayShift?.shift_end || null,
    };
  }, [todayRow, schedules, currentTime]);

  const filteredHistoryRows = useMemo(() => {
    return dailyRows.filter((r) => {
      if (historyFilter === "today") {
        if (r.date !== getLocalDateString(currentTime)) return false;
      } else if (historyFilter === "week") {
        const mon = new Date(currentTime);
        mon.setDate(currentTime.getDate() - (currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1));
        if (r.date < getLocalDateString(mon)) return false;
      } else if (historyFilter === "month") {
        const first = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
        if (r.date < getLocalDateString(first)) return false;
      } else if (historyFilter === "custom") {
        if (historyStart && r.date < historyStart) return false;
        if (historyEnd && r.date > historyEnd) return false;
      }

      if (historyStatusFilter === "complete") {
        if (r.status !== "Timed out") return false;
      } else if (historyStatusFilter === "incomplete") {
        if (r.status === "Timed out" || r.isAbsent) return false;
      }

      if (historySearch.trim()) {
        const term = historySearch.toLowerCase();
        if (!r.notes.toLowerCase().includes(term)) return false;
      }

      return true;
    });
  }, [dailyRows, historyFilter, historyStart, historyEnd, historyStatusFilter, historySearch, currentTime]);

  const handleClockAction = async (actionType, verificationPhoto) => {
    VynoraDeveloperLogger.log("Attendance", `Initiating clock action: "${actionType}"`, {
      hasVerificationPhoto: !!verificationPhoto,
    });

    if (!workspace?.id || !user?.id) {
      VynoraDeveloperLogger.log(
        "Attendance",
        "Clock action aborted: Supabase connection or session credentials missing.",
        null,
        "error"
      );
      addToast("Connection to Supabase lost. Please reload.", "error");
      return;
    }

    const localDate = getLocalDateString(new Date());
    if (!requireScheduleForDate(localDate, "record time actions")) {
      VynoraDeveloperLogger.log("Attendance", `Clock action aborted: Missing schedule for date ${localDate}`, null, "warn");
      return;
    }

    if (actionType === "time_out") {
      const todayKey = getLocalDateString(new Date());
      const todayShift = schedules.find((s) => s.date === todayKey);
      if (todayShift && isBeforeEndTime(todayShift.shift_end)) {
        VynoraDeveloperLogger.log(
          "Attendance",
          `Clock Out blocked: Early departure requested at ${new Date().toLocaleTimeString()} (Shift ends at ${formatTime12(
            todayShift.shift_end
          )})`,
          { todayShift },
          "warn"
        );
        addToast(
          `You cannot Time Out yet because your scheduled shift has not ended (Ends at ${formatTime12(
            todayShift.shift_end
          )}).`,
          "warning"
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const nowString = new Date().toISOString();
      const payload = {
        workspace_id: workspace.id,
        user_id: user.id,
        action: actionType,
        status: actionType === "time_out" ? "Completed" : actionType === "break_in" ? "On Break" : "Working",
        timestamp: nowString,
        date: localDate,
        created_at: nowString,
        verification_photo: verificationPhoto || undefined,
      };

      if (actionType === "time_out" && todayRow) {
        const expected = settings.expectedWorkHours * 60;
        if (todayRow.workedMinutes > expected) {
          payload.overtime_approved = true;
          VynoraDeveloperLogger.log(
            "Attendance",
            `Auto-approving overtime: worked ${todayRow.workedMinutes}m, expected ${expected}m`,
            { todayRow }
          );
        }
      }

      if (!navigator.onLine) {
        VynoraDeveloperLogger.log(
          "Attendance",
          "Offline status detected. Initiating safe local DTR cache write.",
          { payload },
          "warn"
        );
        const mockRecord = {
          id: `offline_${Date.now()}`,
          ...payload,
        };
        const updatedRecords = [...rawRecords, mockRecord];
        setRawRecords(updatedRecords);
        safeLocalStorage.setItem(`vynora_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        if (verificationPhoto) {
          setEphemeralSelfie(verificationPhoto);
          setEphemeralActionName(actionType === "time_in" ? "Time In" : "Time Out");
        }

        const queueKey = `vynora_offline_queue_${user.id}`;
        const rawQueue = safeLocalStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "insert_clock",
          payload: [payload],
        });
        safeLocalStorage.setItem(queueKey, JSON.stringify(queue));

        VynoraDeveloperLogger.log("Attendance", "Successfully committed offline queue item and updated UI records cache.", {
          queueSize: queue.length,
        });
        addToast(`Offline Mode: Action ${actionType.replace("_", " ")} saved locally!`, "warning");
        setSubmitting(false);
        return;
      }

      VynoraDeveloperLogger.log("Attendance", "Pushing clock entry to remote database...", { payload });
      if (!supabase) throw new Error("Supabase client is not available.");

      const { data, error } = await supabase.from("attendance_records").insert(payload).select().single();

      if (error) throw error;

      VynoraDeveloperLogger.log("Attendance", "Clock action successfully synched to database.", { data });

      if (verificationPhoto) {
        setEphemeralSelfie(verificationPhoto);
        setEphemeralActionName(actionType === "time_in" ? "Time In" : "Time Out");
      }

      addToast(`Action ${actionType.replace("_", " ")} successfully logged!`, "success");
      await fetchRecords();
    } catch (err) {
      VynoraDeveloperLogger.log("Attendance", "Exception occurred during clock action process.", err, "error");
      console.error(err);
      addToast(err.message || "Failed to record clock action.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    VynoraDeveloperLogger.log("DTR Correction", "Initiating manual DTR record creation", { addForm });

    if (!workspace?.id || !user?.id) {
      VynoraDeveloperLogger.log(
        "DTR Correction",
        "Manual entry aborted: Supabase connection or session credentials missing.",
        null,
        "error"
      );
      return;
    }

    const baseDate = addForm.date;
    if (!requireScheduleForDate(baseDate, "create an attendance log")) {
      VynoraDeveloperLogger.log("DTR Correction", `Manual entry aborted: Missing work schedule for date ${baseDate}`, null, "warn");
      setShowAddModal(false);
      return;
    }

    setSubmitting(true);

    try {
      const eventsToInsert = [];
      const tag =
        addForm.workType === "rest_day"
          ? "[REST_DAY]"
          : addForm.workType === "regular_holiday"
          ? "[REG_HOLIDAY]"
          : addForm.workType === "special_holiday"
          ? "[SPL_HOLIDAY]"
          : "";
      const fullComment = `${tag} ${addForm.notes}`.trim();

      if (addForm.timeIn && addForm.timeIn !== "00:00") {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_in",
          status: "Working",
          timestamp: toUTCISO(baseDate, addForm.timeIn),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, addForm.timeIn),
        });
      }

      if (addForm.hasBreak) {
        const breakSessions = Array.isArray(addForm.breaks) ? addForm.breaks : [];
        breakSessions.forEach((session) => {
          if (session.breakIn && session.breakIn !== "00:00") {
            eventsToInsert.push({
              workspace_id: workspace.id,
              user_id: user.id,
              action: "break_in",
              status: "On Break",
              timestamp: toUTCISO(baseDate, session.breakIn),
              date: baseDate,
              comment: fullComment,
              created_at: toUTCISO(baseDate, session.breakIn),
            });
          }

          if (session.breakOut && session.breakOut !== "00:00") {
            eventsToInsert.push({
              workspace_id: workspace.id,
              user_id: user.id,
              action: "break_out",
              status: "Working",
              timestamp: toUTCISO(baseDate, session.breakOut),
              date: baseDate,
              comment: fullComment,
              created_at: toUTCISO(baseDate, session.breakOut),
            });
          }
        });
      }

      if (addForm.timeOut && addForm.timeOut !== "00:00") {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_out",
          status: "Completed",
          timestamp: toUTCISO(baseDate, addForm.timeOut),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, addForm.timeOut),
          overtime_approved: true,
        });
      }

      eventsToInsert.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      VynoraDeveloperLogger.log("DTR Correction", "Generated events payload list from form input", { eventsToInsert });

      if (!navigator.onLine) {
        VynoraDeveloperLogger.log(
          "DTR Correction",
          "Offline status detected during manual entry. Writing locally...",
          null,
          "warn"
        );
        const updatedRecords = rawRecords.filter((r) => r.date !== baseDate).concat(eventsToInsert);
        setRawRecords(updatedRecords);
        safeLocalStorage.setItem(`vynora_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        const queueKey = `vynora_offline_queue_${user.id}`;
        const rawQueue = safeLocalStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "add_manual",
          date: baseDate,
          payload: eventsToInsert,
        });
        safeLocalStorage.setItem(queueKey, JSON.stringify(queue));

        VynoraDeveloperLogger.log("DTR Correction", "Offline manual entry queued successfully.", {
          queueSize: queue.length,
        });
        addToast("Offline Mode: Manual record saved locally!", "warning");
        setShowAddModal(false);
        setSubmitting(false);
        return;
      }

      VynoraDeveloperLogger.log("DTR Correction", "Clearing prior records on date to avoid overlapping logs", { baseDate });
      const { error: delError } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .eq("date", baseDate);

      if (delError) throw delError;

      VynoraDeveloperLogger.log("DTR Correction", "Inserting manual DTR logs into Supabase", {
        eventsCount: eventsToInsert.length,
      });
      const { error: insError } = await supabase.from("attendance_records").insert(eventsToInsert);

      if (insError) throw insError;

      VynoraDeveloperLogger.log("DTR Correction", "Manual DTR entry successfully synced!");
      addToast("Manual record added successfully!", "success");
      setShowAddModal(false);

      safeLocalStorage.removeItem(`vynora_records_cache_${user.id}`);
      await fetchRecords();
    } catch (err) {
      console.error(err);
      addToast("Failed to add manual record.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditRow = (row) => {
    setSelectedDateRow(row);
    const activeBreaks = row.breaks.map((b) => ({
      breakIn: getLocalTime24(b.breakIn),
      breakOut: getLocalTime24(b.breakOut),
    }));

    setEditForm({
      date: row.date,
      timeIn: getLocalTime24(row.timeIn),
      timeOut: getLocalTime24(row.timeOut),
      breaks: activeBreaks,
      notes: row.notes || "",
      workType: row.workType || "regular",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    VynoraDeveloperLogger.log("DTR Correction", "Initiating save for DTR edit correction", { editForm });

    if (!workspace?.id || !user?.id || !selectedDateRow) {
      VynoraDeveloperLogger.log("DTR Correction", "DTR Edit aborted: missing session parameters.", null, "error");
      return;
    }

    const baseDate = editForm.date;
    if (!requireScheduleForDate(baseDate, "edit an attendance log")) {
      VynoraDeveloperLogger.log("DTR Correction", `DTR Edit aborted: date ${baseDate} lacks schedule.`, null, "warn");
      setShowEditModal(false);
      return;
    }

    setSubmitting(true);

    try {
      const eventsToInsert = [];
      const tag =
        editForm.workType === "rest_day"
          ? "[REST_DAY]"
          : editForm.workType === "regular_holiday"
          ? "[REG_HOLIDAY]"
          : editForm.workType === "special_holiday"
          ? "[SPL_HOLIDAY]"
          : "";
      const fullComment = `${tag} ${editForm.notes}`.trim();

      if (editForm.timeIn && editForm.timeIn !== "00:00") {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_in",
          status: "Working",
          timestamp: toUTCISO(baseDate, editForm.timeIn),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, editForm.timeIn),
        });
      }

      editForm.breaks.forEach((b) => {
        if (b.breakIn && b.breakIn !== "00:00") {
          eventsToInsert.push({
            workspace_id: workspace.id,
            user_id: user.id,
            action: "break_in",
            status: "On Break",
            timestamp: toUTCISO(baseDate, b.breakIn),
            date: baseDate,
            comment: fullComment,
            created_at: toUTCISO(baseDate, b.breakIn),
          });
        }
        if (b.breakOut && b.breakOut !== "00:00") {
          eventsToInsert.push({
            workspace_id: workspace.id,
            user_id: user.id,
            action: "break_out",
            status: "Working",
            timestamp: toUTCISO(baseDate, b.breakOut),
            date: baseDate,
            comment: fullComment,
            created_at: toUTCISO(baseDate, b.breakOut),
          });
        }
      });

      if (editForm.timeOut && editForm.timeOut !== "00:00") {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_out",
          status: "Completed",
          timestamp: toUTCISO(baseDate, editForm.timeOut),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, editForm.timeOut),
          overtime_approved: true,
        });
      }

      eventsToInsert.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      VynoraDeveloperLogger.log("DTR Correction", "Generated updated events list for insertion", { eventsToInsert });

      if (!navigator.onLine) {
        VynoraDeveloperLogger.log(
          "DTR Correction",
          "Offline status detected during DTR Edit save. Writing local fallback...",
          null,
          "warn"
        );
        const updatedRecords = rawRecords.filter((r) => r.date !== baseDate).concat(eventsToInsert);
        setRawRecords(updatedRecords);
        safeLocalStorage.setItem(`vynora_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        const queueKey = `vynora_offline_queue_${user.id}`;
        const rawQueue = safeLocalStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "save_edit",
          date: baseDate,
          payload: eventsToInsert,
        });
        safeLocalStorage.setItem(queueKey, JSON.stringify(queue));

        VynoraDeveloperLogger.log("DTR Correction", "Offline edit saved and queued.", { queueSize: queue.length });
        addToast("Offline Mode: Log corrections saved locally!", "warning");
        setShowEditModal(false);
        setSubmitting(false);
        return;
      }

      VynoraDeveloperLogger.log("DTR Correction", "Clearing prior database logs on date for clean update", { baseDate });
      const { error: delError } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .eq("date", baseDate);

      if (delError) throw delError;

      if (eventsToInsert.length > 0) {
        VynoraDeveloperLogger.log("DTR Correction", "Inserting replacement DTR events", {
          eventsCount: eventsToInsert.length,
        });
        const { error: insError } = await supabase.from("attendance_records").insert(eventsToInsert);

        if (insError) throw insError;
      }

      VynoraDeveloperLogger.log("DTR Correction", "DTR Edit saved and synced successfully!");
      addToast("Record updated and pay statistics recalculated!", "success");
      setShowEditModal(false);

      safeLocalStorage.removeItem(`vynora_records_cache_${user.id}`);
      safeLocalStorage.removeItem(`vynora_offline_queue_${user.id}`);
      await fetchRecords();
    } catch (err) {
      VynoraDeveloperLogger.log("DTR Correction", "Exception occurred during handleSaveEdit process.", err, "error");
      console.error(err);
      addToast("Failed to edit records.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRow = async (dateKey) => {
    VynoraDeveloperLogger.log("DTR Correction", `Initiating deletion of DTR record on date: "${dateKey}"`);
    if (!workspace?.id || !user?.id) {
      VynoraDeveloperLogger.log("DTR Correction", "DTR deletion aborted: session missing.", null, "error");
      return;
    }
    setSubmitting(true);
    try {
      if (!navigator.onLine) {
        VynoraDeveloperLogger.log(
          "DTR Correction",
          "Offline status detected during DTR Delete. Wiping locally...",
          null,
          "warn"
        );
        const updatedRecords = rawRecords.filter((r) => r.date !== dateKey);
        setRawRecords(updatedRecords);
        safeLocalStorage.setItem(`vynora_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        const queueKey = `vynora_offline_queue_${user.id}`;
        const rawQueue = safeLocalStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "delete_row",
          date: dateKey,
        });
        safeLocalStorage.setItem(queueKey, JSON.stringify(queue));

        VynoraDeveloperLogger.log("DTR Correction", "Offline DTR delete successfully queued.", {
          queueSize: queue.length,
        });
        addToast("Offline Mode: Log removed locally!", "warning");
        setConfirmDeleteId(null);
        setSubmitting(false);
        return;
      }

      VynoraDeveloperLogger.log("DTR Correction", "Removing attendance records from database for date", { dateKey });
      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .eq("date", dateKey);

      if (error) throw error;

      VynoraDeveloperLogger.log("DTR Correction", "DTR deletion synced successfully.");
      addToast("DTR log successfully removed.", "success");
      setConfirmDeleteId(null);
      await fetchRecords();
    } catch (err) {
      VynoraDeveloperLogger.log("DTR Correction", "Exception occurred during handleDeleteRow process.", err, "error");
      console.error(err);
      addToast("Failed to delete log.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAllRecords = async () => {
    VynoraDeveloperLogger.log("DTR Correction", "WIPING ALL DTR RECORDS FOR USER PERMANENTLY");
    if (deleteConfirmText !== "DELETE") {
      VynoraDeveloperLogger.log(
        "DTR Correction",
        "Clear all aborted: confirmation text mismatch.",
        { input: deleteConfirmText },
        "warn"
      );
      addToast("Confirmation phrase must be 'DELETE'", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (!navigator.onLine) {
        VynoraDeveloperLogger.log(
          "DTR Correction",
          "Offline status detected during absolute DTR wipe. Wiping locally...",
          null,
          "warn"
        );
        setRawRecords([]);
        safeLocalStorage.setItem(`vynora_records_cache_${user.id}`, JSON.stringify([]));

        const queueKey = `vynora_offline_queue_${user.id}`;
        const queue = [
          {
            id: `q_${Date.now()}`,
            type: "delete_all",
          },
        ];
        safeLocalStorage.setItem(queueKey, JSON.stringify(queue));

        VynoraDeveloperLogger.log("DTR Correction", "Offline wipe completed locally and queued.");
        addToast("Offline Mode: Wiped all local records. Wipe request queued!", "warning");
        setIsDeletingAll(false);
        setDeleteConfirmText("");
        setSubmitting(false);
        return;
      }

      VynoraDeveloperLogger.log("DTR Correction", "Deleting all attendance records from database for current user");
      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id);

      if (error) throw error;

      VynoraDeveloperLogger.log("DTR Correction", "DTR absolute wipe synced successfully.");
      addToast("All personal records cleared successfully.", "info");
      setIsDeletingAll(false);
      setDeleteConfirmText("");

      safeLocalStorage.setItem(`vynora_records_cache_${user.id}`, JSON.stringify([]));
      safeLocalStorage.removeItem(`vynora_offline_queue_${user.id}`);

      await fetchRecords();
    } catch (err) {
      VynoraDeveloperLogger.log("DTR Correction", "Exception occurred during handleClearAllRecords process.", err, "error");
      console.error(err);
      addToast("Failed to clear personal records.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDiaryNote = (dateStr, text) => {
    if (!user?.id) return;
    const updated = { ...diaryNotes };
    if (!text || text.trim() === "") {
      delete updated[dateStr];
    } else {
      updated[dateStr] = text;
    }
    setDiaryNotes(updated);
    safeLocalStorage.setItem(`vynora_personal_diary_${user.id}`, JSON.stringify(updated));
    addToast("Diary entry saved successfully!", "success");
    setShowDiaryModal(false);
  };

  const handleExportCsv = () => {
    if (dailyRows.length === 0) {
      addToast("No records to export.", "warning");
      return;
    }

    const isEmp = role === "employee";

    const headers = [
      "Date",
      "Time In",
      "Time Out",
      "Worked Hours",
      "Break Minutes",
      "Overtime Minutes",
      "Lateness (Mins)",
      "Work Type",
      "Status",
      !isEmp && "Est. Earnings (PHP)",
      "Notes",
    ].filter(Boolean);

    const rows = dailyRows.map((r) =>
      [
        r.date,
        r.timeIn ? new Date(r.timeIn).toLocaleTimeString() : "-",
        r.timeOut ? new Date(r.timeOut).toLocaleTimeString() : "-",
        (r.workedMinutes / 60).toFixed(2),
        r.breakMinutes,
        r.overtimeMinutes,
        r.lateMinutes,
        r.workType,
        r.status,
        !isEmp && r.estimatedEarnings.toFixed(2),
        `"${r.notes?.replace(/"/g, '""') || ""}"`,
      ].filter((val) => val !== false)
    );

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vynora_${isEmp ? "Employee" : "Personal"}_DTR_Export_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("CSV Export downloaded!", "success");
  };

  const handlePrintDtr = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const isEmp = role === "employee";

    const rowContent = dailyRows
      .map(
        (r) => `
      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
        <td style="padding: 10px;">${r.date}</td>
        <td style="padding: 10px;">${
          r.timeInRaw ? new Date(r.timeInRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"
        }</td>
        <td style="padding: 10px;">${r.breakIn || "-"}</td>
        <td style="padding: 10px;">${r.breakOut || "-"}</td>
        <td style="padding: 10px;">${
          r.timeOutRaw ? new Date(r.timeOutRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"
        }</td>
        <td style="padding: 10px;">${(r.workedMinutes / 60).toFixed(2)} hrs</td>
        <td style="padding: 10px;">${r.breakMinutes}m</td>
        <td style="padding: 10px;">${r.overtimeMinutes}m</td>
        <td style="padding: 10px;">${r.lateMinutes}m</td>
        <td style="padding: 10px; text-transform: capitalize;">${(r.workType || "regular").replace("_", " ")}</td>
        ${
          !isEmp
            ? `<td style="padding: 10px;">PHP ${r.estimatedEarnings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>`
            : ""
        }
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${isEmp ? "Employee" : "Personal"} DTR Summary Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1E293B; margin: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background-color: #F8FAFC; padding: 12px 10px; border-bottom: 2px solid #CBD5E1; font-size: 13px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2 style="margin-bottom: 5px; color: #059669;">Vynora - ${isEmp ? "Employee" : "Personal"} DTR Summary</h2>
          <p style="font-size: 14px; margin-top: 0; color: #64748B;">User: ${profile?.email || user?.email}</p>
          <hr style="border: 1px solid #E2E8F0; margin-bottom: 25px;" />
          
          <div style="display: flex; gap: 30px; margin-bottom: 30px; font-size: 14px;">
            <div><strong>Total Hours:</strong> ${(dailyRows.reduce((a, b) => a + b.workedMinutes, 0) / 60).toFixed(
              2
            )} hrs</div>
            <div><strong>Total Overtime:</strong> ${(
              dailyRows.reduce((a, b) => a + b.overtimeMinutes, 0) / 60
            ).toFixed(2)} hrs</div>
            <div><strong>Total Lateness:</strong> ${dailyRows.reduce((a, b) => a + b.lateMinutes, 0)} mins</div>
            ${
              !isEmp
                ? `<div><strong>Estimated Total Pay:</strong> PHP ${dailyRows
                    .reduce((a, b) => a + b.estimatedEarnings, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`
                : ""
            }
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Break In</th>
                <th>Break Out</th>
                <th>Clock Out</th>
                <th>Worked Time</th>
                <th>Break</th>
                <th>Overtime</th>
                <th>Late</th>
                <th>Day Type</th>
                ${!isEmp ? "<th>Earnings</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${rowContent}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return {
    rawRecords,
    setRawRecords,
    loading,
    submitting,
    isOnline,
    currentTime,
    ephemeralSelfie,
    setEphemeralSelfie,
    ephemeralSelfieCountdown,
    ephemeralActionName,
    showEditModal,
    setShowEditModal,
    selectedDateRow,
    setSelectedDateRow,
    editForm,
    setEditForm,
    showAddModal,
    setShowAddModal,
    showCorrectionModal,
    setShowCorrectionModal,
    showLeaveModal,
    setShowLeaveModal,
    addForm,
    setAddForm,
    confirmDeleteId,
    setConfirmDeleteId,
    deleteConfirmText,
    setDeleteConfirmText,
    isDeletingAll,
    setIsDeletingAll,
    diaryNotes,
    showDiaryModal,
    setShowDiaryModal,
    selectedDiaryDate,
    setSelectedDiaryDate,
    diaryText,
    setDiaryText,
    historyFilter,
    setHistoryFilter,
    historyStart,
    setHistoryStart,
    historyEnd,
    setHistoryEnd,
    historyStatusFilter,
    setHistoryStatusFilter,
    historySearch,
    setHistorySearch,
    dailyRows,
    todayRow,
    analyticsSummary,
    dtrButtonsConfig,
    filteredHistoryRows,
    fetchRecords,
    syncOfflineQueue,
    handleClockAction,
    handleAddRecord,
    openEditRow,
    handleSaveEdit,
    handleDeleteRow,
    handleClearAllRecords,
    handleSaveDiaryNote,
    handleExportCsv,
    handlePrintDtr,
  };
}
