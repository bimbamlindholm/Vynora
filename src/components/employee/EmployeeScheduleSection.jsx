/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  Sparkles,
  WifiOff,
  Bell
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { 
  fetchMySchedules,
  getCurrentCutoffRange,
  getPreviousCutoffRange,
  toLocalISOString
} from "../../utils/supabaseSchedule";

export default function EmployeeScheduleSection({ profile, workspace }) {
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState(null);
  
  // View Toggle Mode (Defaulting to "cutoff" as requested)
  const [viewMode, setViewMode] = useState("cutoff");
  
  // Date navigator (Month/Year)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Cutoff range calculations
  const payrollPeriod = workspace?.payrollPeriod || workspace?.payroll_period || "semi-monthly";
  const currentCutoff = useMemo(() => getCurrentCutoffRange(payrollPeriod), [payrollPeriod]);

  // Chronological list of dates in the current payroll cutoff
  const cutoffDays = useMemo(() => {
    if (!currentCutoff.start || !currentCutoff.end) return [];
    const start = new Date(currentCutoff.start);
    const end = new Date(currentCutoff.end);
    const days = [];
    
    let current = new Date(start);
    while (current <= end) {
      const dateStr = toLocalISOString(current);
      days.push({
        dateStr,
        dayNum: current.getDate(),
        dayName: current.toLocaleDateString("en-US", { weekday: "short" }),
        monthName: current.toLocaleDateString("en-US", { month: "short" }),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [currentCutoff]);

  const workspaceId = workspace?.id;
  const userId = profile?.id;

  const loadSchedules = useCallback(async () => {
    if (!workspaceId || !userId) return;
    setLoading(true);
    try {
      if (navigator.onLine) {
        const data = await fetchMySchedules(workspaceId, userId);
        setSchedules(data);
        // Cache locally for offline viewing
        localStorage.setItem(`vynora_cache_schedules_${userId}`, JSON.stringify(data));
      } else {
        // Load from cache
        const cached = localStorage.getItem(`vynora_cache_schedules_${userId}`);
        if (cached) {
          setSchedules(JSON.parse(cached));
          addToast("Loaded schedule from local offline cache.", "info");
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback to cache on error
      const cached = localStorage.getItem(`vynora_cache_schedules_${userId}`);
      if (cached) {
        setSchedules(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId, addToast]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Sync cache if online status changes
  useEffect(() => {
    const handleOnline = () => loadSchedules();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [loadSchedules]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedShift(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedShift(null);
  };

  const getDateString = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Maps schedules to dates for easy O(1) lookup (maps each date to an array of schedules to support multiple daily shifts)
  const schedulesMap = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [schedules]);

  // Cells grid builder
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dayNum: null, dateStr: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        dayNum: day,
        dateStr: getDateString(day),
      });
    }
    return cells;
  }, [firstDayIndex, daysInMonth, month, year]);

  // Checks if today has a shift scheduled
  const todayKeyStr = new Date().toISOString().split("T")[0];
  const todayShift = schedulesMap[todayKeyStr]?.[0];

  // Helper to determine if we are currently "inside" a shift time right now
  const activeShiftStatus = useMemo(() => {
    if (!todayShift) return null;
    if (todayShift.shift_start === "OFF" || todayShift.shift_end === "OFF") return "Rest Day";

    const now = new Date();
    const [startHour, startMin] = todayShift.shift_start.split(":").map(Number);
    const [endHour, endMin] = todayShift.shift_end.split(":").map(Number);

    const shiftStart = new Date();
    shiftStart.setHours(startHour, startMin, 0, 0);

    const shiftEnd = new Date();
    shiftEnd.setHours(endHour, endMin, 0, 0);

    // Adjust for overnight shift
    if (shiftEnd < shiftStart) {
      if (now < shiftEnd) {
        shiftStart.setDate(shiftStart.getDate() - 1);
      } else {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }
    }

    if (now >= shiftStart && now <= shiftEnd) {
      return "Active Now";
    } else if (now < shiftStart) {
      return "Upcoming";
    }
    return "Completed";
  }, [todayShift]);

  // Analytics for the active view period (month calendar or payroll cutoff period)
  const activeStats = useMemo(() => {
    let shiftsCount = 0;
    let restDaysCount = 0;
    let totalScheduledHours = 0;

    const daysToCheck = viewMode === "cutoff" 
      ? cutoffDays.map(d => d.dateStr)
      : Array.from({ length: daysInMonth }, (_, i) => getDateString(i + 1));

    daysToCheck.forEach((dateStr) => {
      const daySchedules = schedulesMap[dateStr];
      if (daySchedules && Array.isArray(daySchedules)) {
        daySchedules.forEach((s) => {
          const isRestDay = s.shift_start === "OFF" || s.shift_end === "OFF" || s.label?.toLowerCase().includes("rest");
          if (isRestDay) {
            restDaysCount++;
          } else {
            shiftsCount++;
            const [startHour] = s.shift_start.split(":").map(Number);
            const [endHour] = s.shift_end.split(":").map(Number);
            if (!isNaN(startHour) && !isNaN(endHour)) {
              let diff = endHour - startHour;
              if (diff < 0) diff += 24;
              totalScheduledHours += Math.max(0, diff - 1);
            } else {
              totalScheduledHours += 8;
            }
          }
        });
      }
    });

    return {
      shiftsCount,
      restDaysCount,
      totalHours: totalScheduledHours,
    };
  }, [schedulesMap, viewMode, cutoffDays, daysInMonth, month, year]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert for Today's Active Shift */}
      {todayShift && (
        <div 
          className="glass-panel border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse"
          style={{ 
            borderColor: `${todayShift.color}40`, 
            backgroundColor: `${todayShift.color}05`
          }}
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-2xl" style={{ textShadow: `0 0 10px ${todayShift.color}` }}>
              ⏰
            </span>
            <div>
              <h4 className="text-sm font-black text-white">
                Today's Shift: <span style={{ color: todayShift.color }}>{todayShift.label}</span>
              </h4>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Time: <span className="font-mono">{todayShift.shift_start} - {todayShift.shift_end}</span> 
                {activeShiftStatus && (
                  <span 
                    className="ml-2 rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider"
                    style={{ 
                      backgroundColor: `${todayShift.color}15`,
                      color: todayShift.color
                    }}
                  >
                    {activeShiftStatus}
                  </span>
                )}
              </p>
            </div>
          </div>
          {todayShift.notes && (
            <div className="text-[11px] italic text-slate-400 bg-black/20 px-3 py-1.5 rounded-xl max-w-xs border border-white/5 truncate">
              "{todayShift.notes}"
            </div>
          )}
        </div>
      )}

      {/* Top Overview Bar */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        
        {/* Payroll Cutoff Period card */}
        <div className="glass-panel border border-white/5 bg-white/[0.015] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Payroll Cutoff period</p>
            <div className="mt-2.5 flex items-start gap-2.5">
              <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-2 py-1 text-[10px] font-black text-violet-300 uppercase shrink-0">
                {payrollPeriod === "semi-monthly" ? "Semi-Monthly" : "Monthly"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white leading-tight">
                  {new Date(currentCutoff.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(currentCutoff.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">
                  Active payroll period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics stats */}
        <div className="glass-panel border border-white/5 bg-white/[0.015] p-5 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {viewMode === "cutoff" ? "Cutoff" : "Month"} Scheduled Shifts
          </p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-3xl font-black text-white">{activeStats.shiftsCount}</h3>
            <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-black text-cyan-300">
              Shifts
            </span>
          </div>
        </div>

        <div className="glass-panel border border-white/5 bg-white/[0.015] p-5 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {viewMode === "cutoff" ? "Cutoff" : "Month"} Pay Hours
          </p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-3xl font-black text-white">{activeStats.totalHours}h</h3>
            <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300">
              Est. Pay Hrs
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar left, Sidebar Detail right */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Visual Monthly Calendar panel or Cutoff Feed */}
        <div className="lg:col-span-8 glass-panel min-w-0 rounded-2xl p-5 border border-white/10 bg-slate-950/20 shadow-xl flex flex-col">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-cyan-300" size={20} />
              <h2 className="text-md font-black text-white tracking-wide">
                My Shift Schedule &bull; <span className="text-cyan-300 font-extrabold">{viewMode === "cutoff" ? "Cutoff Feed" : `${monthNames[month]} ${year}`}</span>
              </h2>
            </div>
            
            {/* View Mode Toggle Pill */}
            <div className="flex items-center rounded-xl bg-slate-900/60 p-1 border border-white/5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  viewMode === "calendar"
                    ? "bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cutoff")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  viewMode === "cutoff"
                    ? "bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Cutoff Feed
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!navigator.onLine && (
                <span className="flex items-center gap-1 text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 mr-2 uppercase animate-pulse">
                  <WifiOff size={9} />
                  Offline Cached
                </span>
              )}
              
              {viewMode === "calendar" && (
                <>
                  <button 
                    onClick={handlePrevMonth}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {viewMode === "calendar" ? (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                  <span key={dayName} className="text-[10px] font-black uppercase tracking-wider text-slate-500 py-1">
                    {dayName}
                  </span>
                ))}
              </div>

              {/* Month grid days */}
              <div className="grid grid-cols-7 gap-1.5 min-h-[350px]">
                {calendarCells.map((cell, idx) => {
                  const isEmpty = cell.dayNum === null;
                  const cellSchedules = cell.dateStr ? (schedulesMap[cell.dateStr] || []) : [];
                  const isToday = cell.dateStr === todayKeyStr;
                  const isSelected = selectedShift && cellSchedules.some((s) => s.id === selectedShift.id);

                  if (isEmpty) {
                    return <div key={`empty-${idx}`} className="bg-transparent rounded-xl pointer-events-none opacity-0" />;
                  }

                  return (
                    <button
                      key={cell.dateStr}
                      disabled={cellSchedules.length === 0}
                      onClick={() => setSelectedShift(cellSchedules[0])}
                      className={`relative rounded-xl border p-2 text-left min-h-[82px] flex flex-col justify-between transition group focus:outline-none ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/[0.06] shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                          : isToday
                          ? "border-cyan-400/40 bg-white/[0.02] hover:border-cyan-400/60"
                          : cellSchedules.length > 0
                          ? "border-white/5 bg-white/[0.008] hover:border-white/10 hover:bg-white/[0.015]"
                          : "border-transparent bg-transparent cursor-default"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[10.5px] font-black ${
                          isToday ? "text-cyan-300 font-extrabold bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-md" : "text-slate-400"
                        }`}>
                          {cell.dayNum}
                        </span>
                        {cellSchedules.length > 0 && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {cellSchedules.slice(0, 3).map((sched) => (
                              <span key={sched.id} className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: sched.color }} />
                            ))}
                          </div>
                        )}
                      </div>

                      {cellSchedules.length > 0 ? (
                        <div className="space-y-1 w-full mt-1.5">
                          {cellSchedules.map((sched) => {
                            const isRestDay = sched.shift_start === "OFF" || sched.label?.toLowerCase().includes("rest");
                            return (
                              <div 
                                key={sched.id}
                                className="px-1 py-0.5 rounded-md border text-[8px] font-black truncate leading-tight select-none w-full flex items-center justify-between"
                                style={{ 
                                  borderColor: `${sched.color}25`, 
                                  backgroundColor: `${sched.color}06`,
                                  color: sched.color
                                }}
                              >
                                <span className="truncate max-w-[70%] font-black uppercase text-[7.5px] tracking-wide">{sched.label}</span>
                                <span className="font-mono text-[7.5px] opacity-90">
                                  {isRestDay ? "OFF" : sched.shift_start}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[7.5px] text-slate-700 select-none font-bold uppercase tracking-wide">
                          No Shift
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Chronological Cutoff Feed */
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {cutoffDays.map((day) => {
                const cellSchedules = schedulesMap[day.dateStr] || [];
                const isToday = day.dateStr === todayKeyStr;
                const isSelected = selectedShift && cellSchedules.some(s => s.id === selectedShift.id);
                
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => {
                      if (cellSchedules.length > 0) {
                        setSelectedShift(cellSchedules[0]);
                      } else {
                        setSelectedShift({
                          date: day.dateStr,
                          shift_start: "OFF",
                          shift_end: "OFF",
                          label: "Rest Day",
                          color: "#f43f5e",
                          notes: "Scheduled Rest Day. Enjoy your day off!"
                        });
                      }
                    }}
                    type="button"
                    className={`w-full text-left rounded-xl border p-3 flex items-center justify-between transition group focus:outline-none ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/[0.06] shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                        : isToday
                        ? "border-cyan-400/40 bg-white/[0.02] hover:border-cyan-400/60"
                        : "border-white/5 bg-white/[0.006] hover:border-white/10 hover:bg-white/[0.015]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Date Badge */}
                      <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-xl border shrink-0 text-center transition-all ${
                        isToday 
                          ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-300"
                          : isSelected
                          ? "bg-cyan-500/5 border-cyan-400/20 text-white"
                          : "bg-white/[0.01] border-white/5 text-slate-300 group-hover:border-white/10"
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60 leading-none">{day.dayName}</span>
                        <span className="text-lg font-black mt-0.5 leading-none">{day.dayNum}</span>
                      </div>

                      {/* Shift Info */}
                      <div className="min-w-0 flex-1">
                        {cellSchedules.length > 0 ? (
                          <div className="space-y-2">
                            {cellSchedules.map((sched) => {
                              const schedIsRest = sched.shift_start === "OFF" || sched.label?.toLowerCase().includes("rest");
                              return (
                                <div key={sched.id} className="space-y-0.5 border-l-2 pl-2" style={{ borderColor: sched.color }}>
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className="px-1.5 py-0.5 rounded text-[8.5px] font-black tracking-wider uppercase opacity-90"
                                      style={{ 
                                        backgroundColor: `${sched.color}15`, 
                                        color: sched.color,
                                        border: `1px solid ${sched.color}30`
                                      }}
                                    >
                                      {sched.label}
                                    </span>
                                    {isToday && (
                                      <span className="text-[8px] font-bold text-cyan-400 bg-cyan-400/10 px-1 py-0.2 rounded uppercase tracking-wider">
                                        Today
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-white font-extrabold flex items-center gap-1 mt-0.5 font-mono">
                                    <Clock size={10} className="text-slate-400" />
                                    {schedIsRest ? (
                                      <span className="text-rose-400 font-sans">Scheduled Rest Day</span>
                                    ) : (
                                      <span>{sched.shift_start} - {sched.shift_end}</span>
                                    )}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Rest Day
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">
                              Rest Day / Off
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side color dot or arrow */}
                    <div className="shrink-0 pl-2">
                      {cellSchedules.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {cellSchedules.slice(0, 3).map((sched) => (
                            <span 
                              key={sched.id}
                              className="h-2 w-2 rounded-full block shrink-0 animate-pulse" 
                              style={{ backgroundColor: sched.color }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span 
                          className="h-2 w-2 rounded-full block shrink-0" 
                          style={{ backgroundColor: "#f43f5e" }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Shift Details drawer */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {selectedShift ? (
            <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-slate-950/20 shadow-xl space-y-4">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Scheduled Details</p>
                  <h3 className="text-xs font-black text-white mt-0.5">{selectedShift.date}</h3>
                </div>
                <span 
                  className="rounded-full border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider leading-none"
                  style={{ 
                    borderColor: `${selectedShift.color}35`, 
                    backgroundColor: `${selectedShift.color}10`,
                    color: selectedShift.color
                  }}
                >
                  {selectedShift.label}
                </span>
              </div>

              {/* Shift Timing Details */}
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/10">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Shift Schedule Hours</p>
                    <p className="text-sm font-black text-white mt-1 font-mono">
                      {selectedShift.shift_start === "OFF" ? "DAY OFF / REST DAY" : `${selectedShift.shift_start} - ${selectedShift.shift_end}`}
                    </p>
                  </div>
                </div>

                {selectedShift.notes && (
                  <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400/10 text-violet-400 border border-violet-400/10 shrink-0">
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Manager Shift Notes</p>
                      <p className="text-xs font-semibold text-slate-300 mt-1.5 leading-relaxed italic">
                        "{selectedShift.notes}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alert indicator */}
              <div className="glass-panel border border-white/5 bg-white/[0.005] p-3.5 rounded-xl text-[10px] leading-relaxed text-slate-400 flex gap-2">
                <span className="text-cyan-300">📢</span>
                <p>
                  Attendance logs submitted on this date will automatically be cross-referenced with this custom shift time instead of the company's global timings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="w-full h-9 rounded-xl border border-white/10 hover:border-white/20 text-xs font-black text-slate-300 hover:text-white transition active:scale-95"
              >
                Close Details
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-slate-950/20 shadow-xl text-center py-12 flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
                <Sparkles size={20} className="text-cyan-300" />
              </div>
              <h4 className="text-xs font-black text-white leading-none">View shift assignments</h4>
              <p className="text-[10px] leading-relaxed text-slate-400 mt-2 max-w-[200px] font-semibold">
                Click on any custom shift indicator on your calendar grid to review work hours and instructions set by your admin.
              </p>
            </div>
          )}

          {/* Quick Notifications panel */}
          <div className="glass-panel border border-white/10 bg-slate-950/20 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
              <Bell size={14} className="text-cyan-300" />
              Scheduling Rules
            </div>
            <ul className="text-[10px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed font-semibold">
              <li>Check-in hours are tracked using the assigned start time.</li>
              <li>Grace periods set globally still apply to scheduled shifts.</li>
              <li>Rest days do not trigger "Absent" logs if no clock actions occur.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
