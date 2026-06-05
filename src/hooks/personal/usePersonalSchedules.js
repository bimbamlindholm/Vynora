import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { fetchMySchedules, saveSchedule, deleteSchedule } from "../../utils/supabaseSchedule";
import { safeLocalStorage, VynoraDeveloperLogger, getLocalDateString } from "../../utils/personalDashboardHelpers";

export function usePersonalSchedules({
  dailyRows,
  analyticsSummary,
  goals,
  currentTime,
  settings,
  schedules: externalSchedules,
  setSchedules: externalSetSchedules,
}) {
  const { addToast } = useToast();
  const { workspace, user } = useAuth();

  const [localSchedules, setLocalSchedules] = useState([]);
  const schedules = externalSchedules !== undefined ? externalSchedules : localSchedules;
  const setSchedules = externalSetSchedules !== undefined ? externalSetSchedules : setLocalSchedules;
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [scheduleForm, setScheduleForm] = useState({
    shiftStart: "09:00",
    shiftEnd: "18:00",
    label: "Day Shift",
    color: "#10b981", // emerald
    notes: "",
    workType: "regular",
  });

  const [presetForm, setPresetForm] = useState({
    workDays: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false }, // Mon-Fri true
    shiftStart: "09:00",
    shiftEnd: "18:00",
    label: "Day Shift",
  });

  // Fetch schedules with Stale-While-Revalidate cache
  const fetchSchedules = async () => {
    if (!workspace?.id || !user?.id) return;

    const cacheKey = `vynora_schedules_cache_${user.id}`;
    const cached = safeLocalStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setSchedules(parsed);
        } else {
          setSchedules([]);
        }
      } catch (e) {
        console.error("Failed to parse cached schedules", e);
        setSchedules([]);
      }
    }

    if (!navigator.onLine) return;

    try {
      VynoraDeveloperLogger.log("Schedule Sync", "Fetching personal schedules from cloud...");
      const data = await fetchMySchedules(workspace.id, user.id);
      const list = data || [];
      setSchedules(list);
      safeLocalStorage.setItem(cacheKey, JSON.stringify(list));
      VynoraDeveloperLogger.log("Schedule Sync", `Successfully loaded and cached ${list.length} schedule presets.`);
    } catch (err) {
      VynoraDeveloperLogger.log("Schedule Sync", "Failed to fetch schedules from cloud", err, "error");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [workspace, user?.id]);

  const getScheduleForDate = (dateStr) => {
    if (!dateStr) return null;
    return schedules.find((schedule) => schedule.date === dateStr) || null;
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

  // Get date strings for the selected week
  const weekDaysList = useMemo(() => {
    const list = [];
    const base = new Date(currentTime);
    const currentDay = base.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    base.setDate(base.getDate() + distanceToMonday + currentWeekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, [currentTime, currentWeekOffset]);

  const handleSaveShift = async (e) => {
    if (e) e.preventDefault();
    if (!workspace?.id || !user?.id || !selectedScheduleDate) return;
    setSchedules(prev => {
      // Optimistic update
      const updated = prev.filter(s => s.date !== selectedScheduleDate);
      updated.push({
        id: scheduleForm.id || `temp_${Date.now()}`,
        workspace_id: workspace.id,
        user_id: user.id,
        date: selectedScheduleDate,
        shift_start: scheduleForm.shiftStart,
        shift_end: scheduleForm.shiftEnd,
        label: scheduleForm.label,
        color: scheduleForm.color,
        notes: scheduleForm.notes,
      });
      return updated;
    });

    try {
      let finalNotes = scheduleForm.notes || "";
      if (scheduleForm.breakIsPaid) {
        if (!finalNotes.includes("[PAID_BREAK]")) {
          finalNotes = `${finalNotes} [PAID_BREAK]`.trim();
        }
      } else {
        finalNotes = finalNotes.replace(/\[PAID_BREAK\]/g, "").trim();
      }

      finalNotes = finalNotes.replace(/\[REST_DAY\]|\[REG_HOLIDAY\]|\[SPL_HOLIDAY\]/g, "").trim();
      if (scheduleForm.workType === "rest_day") {
        finalNotes = `${finalNotes} [REST_DAY]`.trim();
      } else if (scheduleForm.workType === "regular_holiday") {
        finalNotes = `${finalNotes} [REG_HOLIDAY]`.trim();
      } else if (scheduleForm.workType === "special_holiday") {
        finalNotes = `${finalNotes} [SPL_HOLIDAY]`.trim();
      }

      await saveSchedule({
        id: scheduleForm.id,
        workspace_id: workspace.id,
        user_id: user.id,
        date: selectedScheduleDate,
        shift_start: scheduleForm.shiftStart,
        shift_end: scheduleForm.shiftEnd,
        label: scheduleForm.label,
        color: scheduleForm.color,
        notes: finalNotes,
      });
      addToast("Shift schedule saved successfully!", "success");
      setShowShiftModal(false);
      await fetchSchedules();
    } catch (err) {
      console.error("Error saving shift:", err);
      addToast("Failed to save shift: " + (err.message || err), "error");
    }
  };

  const handleDeleteShift = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to clear this shift? It will fall back to default preferences.")) return;
    try {
      await deleteSchedule(scheduleId);
      addToast("Shift cleared successfully!", "success");
      setShowShiftModal(false);
      await fetchSchedules();
    } catch (err) {
      console.error("Error clearing shift:", err);
      addToast("Failed to clear shift.", "error");
    }
  };

  const handleGeneratePreset = async (e) => {
    if (e) e.preventDefault();
    if (!workspace?.id || !user?.id) return;
    try {
      const promises = weekDaysList.map(async (dayDate) => {
        const dayOfWeek = dayDate.getDay();
        const isWorkDay = presetForm.workDays[dayOfWeek];
        const dateStr = getLocalDateString(dayDate);

        if (isWorkDay) {
          return saveSchedule({
            workspace_id: workspace.id,
            user_id: user.id,
            date: dateStr,
            shift_start: presetForm.shiftStart,
            shift_end: presetForm.shiftEnd,
            label: presetForm.label,
            color: "#10b981",
            notes: "Weekly Preset Shift",
          });
        } else {
          return saveSchedule({
            workspace_id: workspace.id,
            user_id: user.id,
            date: dateStr,
            shift_start: "00:00",
            shift_end: "00:00",
            label: "Rest Day",
            color: "#64748b",
            notes: "Weekly Preset Rest Day",
          });
        }
      });

      await Promise.all(promises);
      addToast("Weekly schedule generated successfully!", "success");
      setShowPresetModal(false);
      await fetchSchedules();
    } catch (err) {
      console.error("Error generating preset:", err);
      addToast("Failed to generate weekly preset.", "error");
    }
  };

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex === 0 ? 6 : firstDayIndex - 1; i > 0; i--) {
      grid.push({
        dateStr: "",
        dayNum: prevDaysInMonth - i + 1,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const log = dailyRows.find(r => r.date === dStr);
      grid.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        log,
      });
    }

    return grid;
  }, [calendarDate, dailyRows]);

  // Goals progress calculation
  const goalsProgress = useMemo(() => {
    const earnPercent =
      Math.min(100, Math.round((analyticsSummary.monthlyEarnings / goals.targetEarnings) * 100)) ||
      0;
    const hourPercent =
      Math.min(100, Math.round((analyticsSummary.monthlyHours / goals.targetHours) * 100)) || 0;
    return { earnPercent, hourPercent };
  }, [analyticsSummary, goals]);

  // Dynamic SVG Chart paths
  const chartPath = useMemo(() => {
    if (dailyRows.length === 0) return "";
    const padding = 30;
    const width = 600;
    const height = 150;

    const chron = [...dailyRows].reverse().slice(-14);
    if (chron.length < 2) return "";

    const maxVal = Math.max(...chron.map(c => c.workedMinutes / 60)) || 8;

    return chron
      .map((c, i) => {
        const x = padding + (i / (chron.length - 1)) * (width - 2 * padding);
        const val = c.workedMinutes / 60;
        const y = height - padding - (val / maxVal) * (height - 2 * padding);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [dailyRows]);

  const earningsPath = useMemo(() => {
    if (dailyRows.length === 0) return "";
    const padding = 30;
    const width = 600;
    const height = 150;

    const chron = [...dailyRows].reverse().slice(-14);
    if (chron.length < 2) return "";

    const maxVal = Math.max(...chron.map(c => c.estimatedEarnings)) || 1000;

    return chron
      .map((c, i) => {
        const x = padding + (i / (chron.length - 1)) * (width - 2 * padding);
        const val = c.estimatedEarnings;
        const y = height - padding - (val / maxVal) * (height - 2 * padding);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [dailyRows]);

  return {
    schedules,
    currentWeekOffset,
    setCurrentWeekOffset,
    showShiftModal,
    setShowShiftModal,
    showPresetModal,
    setShowPresetModal,
    selectedScheduleDate,
    setSelectedScheduleDate,
    calendarDate,
    setCalendarDate,
    scheduleForm,
    setScheduleForm,
    presetForm,
    setPresetForm,
    fetchSchedules,
    getScheduleForDate,
    requireScheduleForDate,
    weekDaysList,
    handleSaveShift,
    handleDeleteShift,
    handleGeneratePreset,
    calendarDays,
    goalsProgress,
    chartPath,
    earningsPath,
  };
}
