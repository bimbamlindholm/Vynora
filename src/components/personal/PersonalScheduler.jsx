import { ChevronLeft, ChevronRight } from "lucide-react";

// Local date string generator matching backend timezone
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PersonalScheduler({
  calendarDate,
  setCalendarDate,
  calendarDays,
  currentTime,
  openEditRow,
  diaryNotes,
  onOpenDiary,
  role
}) {
  return (
    <div className="glass-panel rounded-3xl border-white/5 bg-slate-900/30 p-4 sm:p-6">
      {/* Header calendar nav */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-extrabold text-white">
          {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCalendarDate(new Date())}
            className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white"
          >
            Today
          </button>
          <button
            onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days Name Header */}
      <div className="mb-3 grid grid-cols-7 border-b border-white/5 pb-2 text-center text-[10px] font-bold text-slate-500 sm:text-xs">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((day, idx) => {
          const isToday = day.dateStr === getLocalDateString(currentTime);
          const hasDiary = day.dateStr && !!diaryNotes[day.dateStr];

          return (
            <div
              key={idx}
              onClick={() => day.dateStr && onOpenDiary(day.dateStr)}
              className={`flex min-h-[58px] cursor-pointer flex-col justify-between rounded-xl border p-1.5 transition-all duration-300 sm:min-h-[90px] sm:rounded-2xl sm:p-2 ${
                day.isCurrentMonth ? "bg-slate-900/20 border-white/5 hover:border-purple-500/40 hover:bg-slate-900/40" : "bg-transparent border-transparent opacity-20 pointer-events-none"
              } ${isToday ? "border-emerald-500 bg-emerald-500/[0.02]" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold ${isToday ? "text-emerald-400" : "text-slate-400"}`}>
                  {day.dayNum}
                </span>
                <div className="flex gap-1 items-center">
                  {hasDiary && (
                    <span 
                      className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" 
                      title="Has Diary/Reminder Note" 
                    />
                  )}
                </div>
              </div>

              {/* Daily Notes / Reminders tag inside grid cell */}
              {hasDiary && (
                <div 
                  className="hidden sm:block text-[8.5px] font-semibold truncate text-purple-300 italic max-w-full bg-purple-500/10 border border-purple-500/10 rounded-lg px-1.5 py-0.5 mt-2" 
                  title={diaryNotes[day.dateStr]}
                >
                  "{diaryNotes[day.dateStr]}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
