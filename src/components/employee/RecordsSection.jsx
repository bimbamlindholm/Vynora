import { useState } from "react";
import { Calendar, Activity, Download, ChevronLeft, ChevronRight, UserRound, ShieldCheck, X } from "lucide-react";
import { exportCsv } from "../../utils/vynoraStorage";
import { buildAttendanceCsvRows, todayKey } from "../../utils/supabaseAttendance";
import { RecordFact } from "./employeeComponents";

export default function RecordsSection({ onCorrection, permissions, records, onSelectDetail }) {
  const [viewMode, setViewMode] = useState("calendar");
  const download = () => exportCsv("my-vynora-attendance.csv", buildAttendanceCsvRows(records));

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-slate-900/60 border border-white/10 shadow-xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">My Attendance Records</h2>
          <p className="mt-1 text-sm text-slate-400">Employees can view records, but cannot edit them directly.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle pill selector */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-950/40 p-1 border border-white/5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                viewMode === "calendar"
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-cyan-500/30 text-white shadow-sm"
                  : "border border-transparent text-slate-400 hover:text-slate-200"
              }`}
              type="button"
            >
              <Calendar size={13} />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-cyan-500/30 text-white shadow-sm"
                  : "border border-transparent text-slate-400 hover:text-slate-200"
              }`}
              type="button"
            >
              <Activity size={13} />
              Table View
            </button>
          </div>

          {permissions.correctionRequests && (
            <button
              className="rounded-xl border border-violet-300/30 bg-violet-400/10 px-4 py-2.5 text-xs font-black text-violet-100 transition hover:bg-violet-400/20"
              onClick={onCorrection}
              type="button"
            >
              Request Correction
            </button>
          )}

          {permissions.employeePdfExport && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20"
              onClick={download}
              type="button"
            >
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {viewMode === "calendar" ? (
        <DtrCalendarView records={records} onSelectDetail={onSelectDetail} />
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:hidden">
            {records.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center text-sm leading-6 text-slate-400">
                No attendance records yet.
              </div>
            ) : (
              records.map((record) => (
                <article key={`${record.id}-mobile`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{record.date}</p>
                      <p className="mt-1 text-xs text-slate-500">{record.status || "-"}</p>
                    </div>
                    <span className="rounded-lg bg-cyan-300/10 px-2 py-1 text-[0.68rem] font-black text-cyan-100">
                      {record.totalHours || "0h 00m"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <RecordFact label="Time In" value={record.timeIn || "-"} />
                    <RecordFact label="Time Out" value={record.timeOut || "-"} />
                    <RecordFact label="Break In" value={record.breakIn || "-"} />
                    <RecordFact label="Break Out" value={record.breakOut || "-"} />
                    <RecordFact label="Late" value={`${record.lateMinutes || 0}m`} />
                    <RecordFact label="Absent" value={record.isAbsent ? "Yes" : "No"} />
                  </div>
                  {record.comment && <p className="mt-3 text-xs leading-5 text-cyan-100">Comment: {record.comment}</p>}
                </article>
              ))
            )}
          </div>

          <div className="mt-4 hidden max-w-full overflow-x-auto rounded-2xl border border-white/10 md:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-white/[0.035] text-xs text-slate-400">
                <tr>
                  {["Date", "Time In", "Break In", "Break Out", "Time Out", "Total Hours", "Status", "Late", "Absent", "Rest Day", "Leave", "Comment"].map((head) => (
                    <th className="px-4 py-3" key={head}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={12}>
                      No attendance records yet.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="text-slate-300">
                      <td className="px-4 py-3">{record.date}</td>
                      <td className="px-4 py-3">{record.timeIn || "-"}</td>
                      <td className="px-4 py-3">{record.breakIn || "-"}</td>
                      <td className="px-4 py-3">{record.breakOut || "-"}</td>
                      <td className="px-4 py-3">{record.timeOut || "-"}</td>
                      <td className="px-4 py-3">{record.totalHours || "-"}</td>
                      <td className="px-4 py-3">{record.status || "-"}</td>
                      <td className="px-4 py-3">{record.lateMinutes || 0}m</td>
                      <td className="px-4 py-3">{record.isAbsent ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{record.isRestDay ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{record.isLeave ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{record.comment || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function DtrCalendarView({ records, onSelectDetail }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Header controls
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar generation logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({ day, dateStr, isCurrentMonth: false });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({ day, dateStr, isCurrentMonth: true });
  }

  // 3. Next month trailing days to complete a 42-cell grid
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({ day, dateStr, isCurrentMonth: false });
  }

  // Map calendar cells to records
  const getRecordForDate = (dateStr) => {
    return records.find((r) => r.date === dateStr);
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mt-5 text-slate-200">
      {/* Month Switcher Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Calendar className="text-cyan-300" size={18} />
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-cyan-300/30 transition text-slate-300"
            type="button"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-cyan-300/30 transition text-slate-300"
            type="button"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
        {weekdays.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarCells.map((cell, idx) => {
          const record = getRecordForDate(cell.dateStr);
          const isToday = cell.dateStr === todayKey();
          
          let statusColor = "border-white/5 bg-slate-900/20 text-slate-600";
          let dotColor = null;

          if (record) {
            const hasTimeIn = Boolean(record.timeIn);
            const hasTimeOut = Boolean(record.timeOut);
            const isLate = (record.lateMinutes || 0) > 0;

            if (record.isLeave) {
              statusColor = "border-violet-500/20 bg-violet-950/20 hover:bg-violet-900/30 text-violet-200 cursor-pointer";
              dotColor = "bg-violet-500 shadow-[0_0_8px_#8b5cf6]";
            } else if (record.isAbsent) {
              statusColor = "border-rose-500/20 bg-rose-950/20 hover:bg-rose-900/30 text-rose-200 cursor-pointer";
              dotColor = "bg-rose-500 shadow-[0_0_8px_#f43f5e]";
            } else if (record.isRestDay) {
              statusColor = "border-slate-500/20 bg-slate-900/40 hover:bg-slate-800/40 text-slate-400 cursor-pointer";
              dotColor = "bg-slate-400 shadow-[0_0_8px_#94a3b8]";
            } else if (hasTimeIn && hasTimeOut) {
              if (isLate) {
                statusColor = "border-amber-500/25 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] text-amber-200 cursor-pointer";
                dotColor = "bg-amber-400 shadow-[0_0_8px_#fbbf24]";
              } else {
                statusColor = "border-emerald-500/25 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] text-emerald-200 cursor-pointer";
                dotColor = "bg-emerald-400 shadow-[0_0_8px_#34d399]";
              }
            } else if (hasTimeIn) {
              statusColor = "border-cyan-500/25 bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] text-cyan-200 cursor-pointer animate-pulse";
              dotColor = "bg-cyan-400 shadow-[0_0_8px_#22d3ee]";
            }
          } else if (cell.isCurrentMonth) {
            statusColor = "border-white/10 bg-white/[0.015] hover:bg-white/[0.05] text-slate-400 cursor-pointer";
          }

          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              onClick={() => {
                if (record) {
                  onSelectDetail(record);
                } else {
                  onSelectDetail({
                    date: cell.dateStr,
                    id: `empty-${cell.dateStr}`,
                    isEmpty: true,
                  });
                }
              }}
              className={`flex flex-col items-center justify-between p-2 rounded-xl border aspect-square text-left transition-all duration-200 hover:-translate-y-0.5 select-none relative ${statusColor} ${
                !cell.isCurrentMonth ? "opacity-35" : ""
              } ${isToday ? "ring-2 ring-cyan-400/50 border-cyan-400/40" : ""}`}
              type="button"
            >
              <div className="flex w-full items-center justify-between">
                <span className={`text-xs font-black ${isToday ? "text-cyan-300 font-bold" : ""}`}>
                  {cell.day}
                </span>
                {isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping absolute top-2 right-2" />
                )}
              </div>
              
              {dotColor ? (
                <div className="flex flex-col items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className="text-[8px] font-black tracking-tighter uppercase opacity-80">
                    {record.totalHours || (record.isLeave ? "Leave" : record.isAbsent ? "Absent" : record.isRestDay ? "Rest" : "Active")}
                  </span>
                </div>
              ) : cell.isCurrentMonth ? (
                <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">No Log</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>Worked (On Time)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          <span>Late / Undertime</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span>Absent / Leave Missing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
          <span>Approved Leave</span>
        </div>
      </div>
    </div>
  );
}

export function DtrDetailDrawer({ record, employee, onClose }) {
  const isDummy = record.isEmpty;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/65 backdrop-blur-sm">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content body */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#07111F]/95 p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out sm:p-7 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Shift Audit Details
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              {record.date}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition"
            type="button"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {isDummy ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Calendar size={48} className="text-slate-600 animate-pulse mb-4" />
            <p className="text-slate-300 font-bold text-sm">No Attendance Logged</p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              No check-in actions were registered for this calendar day.
            </p>
          </div>
        ) : (
          <div className="flex-1 mt-6 space-y-6">
            {/* Timeline Shift Status */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Shift Log History</h3>
              <div className="relative border-l-2 border-cyan-500/20 pl-4 ml-1 space-y-4">
                <TimelineStep label="Shift In (Time In)" value={record.timeIn} isCompleted={Boolean(record.timeIn)} />
                <TimelineStep label="Break Start (Break In)" value={record.breakIn} isCompleted={Boolean(record.breakIn)} />
                <TimelineStep label="Break End (Break Out)" value={record.breakOut} isCompleted={Boolean(record.breakOut)} />
                <TimelineStep label="Shift Out (Time Out)" value={record.timeOut} isCompleted={Boolean(record.timeOut)} />
              </div>
            </div>

            {/* Attendance metrics details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Shift</span>
                <p className="text-white font-black mt-1 text-base">{record.totalHours || "0h 00m"}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Punctuality</span>
                <p className={`font-black mt-1 text-base ${Number(record.lateMinutes || 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {Number(record.lateMinutes || 0) > 0 ? `${record.lateMinutes}m Late` : "On Time"}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm col-span-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Comments / Audit Note</span>
                <p className="text-slate-300 font-semibold mt-1 text-xs leading-5">
                  {record.comment || "No comment logs registered for this shift."}
                </p>
              </div>
            </div>

            {/* Captured Selfie Verification */}
            {(record.verificationPhoto || record.timeOutVerificationPhoto) ? (
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.03] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-300/10 text-cyan-300">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">AI Face Verification Audit</h4>
                    <p className="text-[9px] text-slate-400">Match confirmed at clock-in/out.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {/* Reference registered photo */}
                  <div className="flex flex-col items-center gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Reference Profile</span>
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/10 bg-slate-900 grid place-items-center">
                      {employee?.facePhoto || record.facePhoto ? (
                        <img 
                          src={employee?.facePhoto || record.facePhoto} 
                          alt="Face Reference" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={28} className="text-slate-600" />
                      )}
                    </div>
                  </div>

                  {/* Captured Clock-In selfie */}
                  <div className="flex flex-col items-center gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Captured Selfie</span>
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-900 grid place-items-center">
                      <img 
                        src={record.verificationPhoto || record.timeOutVerificationPhoto} 
                        alt="Clock Selfie" 
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-cyan-500/85 text-[8px] font-black text-slate-950 text-center py-0.5 uppercase tracking-wider">
                        Verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Simulated Premium Face Recognition card fallback */
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.03] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-300/10 text-cyan-300">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">AI Face Verification Log</h4>
                    <p className="text-[10px] text-slate-400">AI face-matching security check confirmed.</p>
                  </div>
                </div>

                <div className="flex items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-white/5">
                  {/* Face Scanning Mock */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-16 w-16 rounded-xl border border-dashed border-cyan-400/40 grid place-items-center overflow-hidden">
                      <UserRound size={32} className="text-cyan-300/70" />
                      <div className="absolute inset-x-0 h-[2px] bg-cyan-400 biometric-laser shadow-[0_0_8px_rgba(6,182,212,1)]" />
                    </div>
                    <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">Face Match: 99%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineStep({ label, value, isCompleted }) {
  return (
    <div className="relative">
      <span className={`absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full ${
        isCompleted ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-slate-700"
      }`} />
      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="block text-sm font-black text-white mt-0.5">
        {isCompleted ? value : "-"}
      </span>
    </div>
  );
}
