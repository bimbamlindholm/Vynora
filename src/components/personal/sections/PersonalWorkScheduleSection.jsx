import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { getLocalDateString, formatTime12 } from "../../../utils/personalDashboardHelpers";

function PersonalWorkScheduleSection({
  role,
  setShowPresetModal,
  setCurrentWeekOffset,
  weekDaysList,
  schedules,
  currentTime,
  settings,
  handleDeleteShift,
  setSelectedScheduleDate,
  setScheduleForm,
  setShowShiftModal
}) {
  return (
    <motion.div
      key="schedule"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top Header Card */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4 backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
        <div>
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Shifting Calendar</span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Work Schedule Planner</h2>
          <p className="text-xs text-slate-400 mt-1">Visually plan your shifting calendar. Customized shift start and end times dynamically calculate daily lateness and pay!</p>
        </div>
        {role !== "employee" && (
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => setShowPresetModal(true)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-[0_0_15px_rgba(52,211,153,0.25)] transition hover:bg-emerald-400 active:scale-95 sm:w-auto"
            >
              <Sparkles size={13} />
              Weekly Presets
            </button>
          </div>
        )}
      </div>

      {/* Week Picker Navigation */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="p-2 border border-white/5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(0)}
            className="px-3 py-1 border border-white/5 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
          >
            Current Week
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="p-2 border border-white/5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-xs font-extrabold leading-5 text-slate-400 sm:text-right">
          Week Range:{" "}
          <span className="text-white">
            {weekDaysList[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
            {weekDaysList[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* 7-Days Weekly Shift Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weekDaysList.map((dayDate) => {
          const dateStr = getLocalDateString(dayDate);
          const dayShift = schedules.find(s => s.date === dateStr);
          const isToday = dateStr === getLocalDateString(currentTime);

          const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
          const dateLabel = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

          const hasShift = !!dayShift;
          const isRestDay = hasShift && (dayShift.label || "").toUpperCase().includes("REST");

          return (
            <div
              key={dateStr}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative group flex flex-col justify-between min-h-[160px] ${
                isToday
                  ? "border-emerald-500/35 bg-emerald-500/[0.02] shadow-[0_0_20px_rgba(52,211,153,0.06)]"
                  : "border-white/5 hover:border-emerald-500/20 bg-slate-900/30"
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black tracking-wider ${isToday ? "text-emerald-400" : "text-slate-300"}`}>
                    {dayName} {isToday && "• Today"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{dateLabel}</span>
                </div>

                {/* Shift Block */}
                <div className="mt-4">
                  {hasShift ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: dayShift.color || "#10b981" }}
                        />
                        <span className="text-xs font-black text-white">{dayShift.label || "Work Shift"}</span>
                      </div>
                      
                      {isRestDay ? (
                        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded inline-block">
                          Rest Day
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-emerald-300">
                          {formatTime12(dayShift.shift_start)} - {formatTime12(dayShift.shift_end)}
                        </div>
                      )}

                      {dayShift.notes && dayShift.notes.replace(/\[PAID_BREAK\]/g, "").trim() && (
                        <p className="text-[10px] text-slate-500 italic mt-1 truncate max-w-[190px]" title={dayShift.notes.replace(/\[PAID_BREAK\]/g, "").trim()}>
                          "{dayShift.notes.replace(/\[PAID_BREAK\]/g, "").trim()}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Default Shift</span>
                      <span className="block text-xs font-extrabold text-slate-400">
                        {formatTime12(settings.shiftStartTime)} ({settings.expectedWorkHours} Hours)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover action overlay & Quick Clears */}
              {role !== "employee" && (
                <div className="mt-5 flex gap-2 justify-end">
                  {hasShift && (
                    <button
                      type="button"
                      onClick={() => handleDeleteShift(dayShift.id)}
                      className="px-2 py-1 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-lg text-[10px] font-bold text-rose-300 transition"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScheduleDate(dateStr);
                      const rawNotes = dayShift?.notes || "";
                      const hasPaidBreak = rawNotes.includes("[PAID_BREAK]");
                      
                      // Parse work type from notes, with fallback to label
                      let parsedWorkType = "regular";
                      if (rawNotes.includes("[REST_DAY]")) parsedWorkType = "rest_day";
                      else if (rawNotes.includes("[REG_HOLIDAY]")) parsedWorkType = "regular_holiday";
                      else if (rawNotes.includes("[SPL_HOLIDAY]")) parsedWorkType = "special_holiday";
                      else if (dayShift) {
                        const labelUpper = (dayShift.label || "").toUpperCase();
                        if (labelUpper.includes("REST") || labelUpper.includes("REST DAY")) parsedWorkType = "rest_day";
                        else if (labelUpper.includes("REGULAR HOLIDAY") || labelUpper.includes("REG HOLIDAY")) parsedWorkType = "regular_holiday";
                        else if (labelUpper.includes("SPECIAL HOLIDAY") || labelUpper.includes("SPL HOLIDAY")) parsedWorkType = "special_holiday";
                      }

                      const cleanNotesVal = rawNotes
                        .replace(/\[PAID_BREAK\]/g, "")
                        .replace(/\[REST_DAY\]|\[REG_HOLIDAY\]|\[SPL_HOLIDAY\]/g, "")
                        .trim();

                      setScheduleForm({
                        id: dayShift?.id || null,
                        shiftStart: dayShift && dayShift.shift_start !== undefined ? dayShift.shift_start : (settings.shiftStartTime || "09:00"),
                        shiftEnd: dayShift && dayShift.shift_end !== undefined ? dayShift.shift_end : "18:00",
                        label: dayShift?.label || "Day Shift",
                        color: dayShift?.color || "#10b981",
                        notes: cleanNotesVal,
                        breakIsPaid: hasPaidBreak,
                        workType: parsedWorkType,
                      });
                      setShowShiftModal(true);
                    }}
                    className="px-3 py-1 border border-white/5 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg text-[10px] font-bold text-slate-300 transition"
                  >
                    {hasShift ? "Edit Shift" : "Assign Shift"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default PersonalWorkScheduleSection;
