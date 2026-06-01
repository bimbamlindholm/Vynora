import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Clock, 
  Plus, 
  Download, 
  Printer, 
  Edit2, 
  Trash2 
} from "lucide-react";
import { FilterBtn } from "./personalComponents";

// Time formatter helper
function formatTime12(timeStr) {
  if (!timeStr) return "-";
  try {
    let h, m;
    // Check if it's a full ISO timestamp or date-time string
    if (timeStr.includes("T") || (timeStr.includes("-") && timeStr.includes(":"))) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        h = date.getHours();
        m = date.getMinutes();
      }
    }
    
    // Fallback to simple HH:MM splitting
    if (h === undefined || m === undefined) {
      const [hStr, mStr] = timeStr.split(":");
      h = parseInt(hStr);
      m = parseInt(mStr);
    }
    
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function PersonalRecordsTable({
  recentOnly = false,
  dailyRows = [],
  filteredHistoryRows = [],
  historyFilter = "month",
  setHistoryFilter,
  historyStart = "",
  setHistoryStart,
  historyEnd = "",
  setHistoryEnd,
  historySearch = "",
  setHistorySearch,
  historyStatusFilter = "all",
  setHistoryStatusFilter,
  setActiveTab,
  onAddLogClick,
  onExportCsv,
  onPrintDtr,
  onEditRow,
  onDeleteRow,
  role,
  onFileLeaveClick
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // --- RECENT ONLY VIEW (Dashboard Widget) ---
  if (recentOnly) {
    const colSpanClass = role === "employee" ? "md:col-span-12" : "md:col-span-8";
    return (
      <div className={`glass-panel rounded-3xl border-white/5 bg-slate-900/30 p-4 ${colSpanClass} sm:p-6`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" />
            Recent Attendance logs
          </h3>
          <button 
            onClick={() => setActiveTab("history")} 
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            View All logs
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {dailyRows.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No recent logs recorded. Tap "Time In" to begin!
            </div>
          ) : (
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Time In</th>
                  <th className="py-2.5">Break In</th>
                  <th className="py-2.5">Break Out</th>
                  <th className="py-2.5">Time Out</th>
                  <th className="py-2.5">Hours</th>
                  <th className="py-2.5">Type</th>
                  {role && role !== "employee" && <th className="py-2.5 text-right">Est. Pay</th>}
                </tr>
              </thead>
              <tbody>
                {dailyRows.slice(0, 5).map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="py-3 font-semibold text-slate-200">{row.date}</td>
                    <td className="py-3 text-slate-300">{formatTime12(row.timeInRaw || row.timeIn)}</td>
                    <td className="py-3 text-slate-300">
                      {row.breakIn && row.breakIn !== "-" ? (
                        <div className="flex flex-col gap-0.5">
                          {row.breakIn.split(", ").map((t, i) => <div key={i}>{t}</div>)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 text-slate-300">
                      {row.breakOut && row.breakOut !== "-" ? (
                        <div className="flex flex-col gap-0.5">
                          {row.breakOut.split(", ").map((t, i) => <div key={i}>{t}</div>)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 text-slate-300">{formatTime12(row.timeOutRaw || row.timeOut)}</td>
                    <td className="py-3 text-slate-300">{(row.workedMinutes / 60).toFixed(2)} hrs</td>
                    <td className="py-3 text-slate-300 capitalize">{row.workType.replace("_", " ")}</td>
                    {role && role !== "employee" && (
                      <td className="py-3 text-right font-bold text-emerald-400">
                        PHP {row.estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // --- FULL DETAILED VIEW (History Tab) ---
  return (
    <>
      {/* Filters Header Card */}
      <div className="glass-panel flex flex-col gap-4 rounded-3xl border-white/5 bg-slate-900/30 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-1">
          <FilterBtn label="Today" active={historyFilter === "today"} onClick={() => setHistoryFilter("today")} />
          <FilterBtn label="This Week" active={historyFilter === "week"} onClick={() => setHistoryFilter("week")} />
          <FilterBtn label="This Month" active={historyFilter === "month"} onClick={() => setHistoryFilter("month")} />
          <FilterBtn label="Custom Range" active={historyFilter === "custom"} onClick={() => setHistoryFilter("custom")} />
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:items-center lg:gap-3">
          <button
            onClick={onAddLogClick}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] active:scale-95"
          >
            <Plus size={14} /> {role === "employee" ? "Request Clock Log" : "Add Log"}
          </button>
          {role === "employee" && onFileLeaveClick && (
            <button
              onClick={onFileLeaveClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95"
            >
              <Plus size={14} /> File Leave
            </button>
          )}
          <button
            onClick={onExportCsv}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={onPrintDtr}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <Printer size={14} /> Print DTR
          </button>
        </div>
      </div>

      {/* Custom Range select panel */}
      {historyFilter === "custom" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="glass-panel grid max-w-md gap-4 rounded-2xl border-white/5 bg-slate-900/20 p-4 sm:grid-cols-2"
        >
          <label className="grid gap-1.5 text-xs text-slate-400">
            Start Date
            <input
              type="date"
              id="historyStart"
              name="historyStart"
              value={historyStart}
              onChange={(e) => setHistoryStart(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
            />
          </label>
          <label className="grid gap-1.5 text-xs text-slate-400">
            End Date
            <input
              type="date"
              id="historyEnd"
              name="historyEnd"
              value={historyEnd}
              onChange={(e) => setHistoryEnd(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
            />
          </label>
        </motion.div>
      )}

      {/* Search and Status Filters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <input
          type="text"
          id="historySearch"
          name="historySearch"
          placeholder="Search records by notes..."
          value={historySearch}
          onChange={(e) => setHistorySearch(e.target.value)}
          className="h-10 px-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs outline-none text-white focus:border-emerald-500"
        />

        <select
          id="historyStatusFilter"
          name="historyStatusFilter"
          value={historyStatusFilter}
          onChange={(e) => setHistoryStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs outline-none text-slate-200 focus:border-emerald-500"
        >
          <option value="all">All DTR Statuses</option>
          <option value="complete">Timed out only</option>
          <option value="incomplete">Incomplete only</option>
        </select>
      </div>

      {/* Logs Table / Cards Grid */}
      <div className="glass-panel overflow-hidden rounded-3xl border-white/5 bg-slate-900/30 p-4 sm:p-6">
        {filteredHistoryRows.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No logs match your current filter settings.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3">Date</th>
                    <th className="py-3">Time In</th>
                    <th className="py-3">Break In</th>
                    <th className="py-3">Break Out</th>
                    <th className="py-3">Time Out</th>
                    <th className="py-3">Duration</th>
                    <th className="py-3">Breaks</th>
                    <th className="py-3">Late / OT</th>
                    <th className="py-3">Day Type</th>
                    {role && role !== "employee" && <th className="py-3">Est. Pay</th>}
                    <th className="py-3">Notes</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistoryRows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.01] group">
                      <td className="py-3.5 font-bold text-white">{row.date}</td>
                      <td className="py-3.5 text-slate-300">{formatTime12(row.timeInRaw || row.timeIn)}</td>
                      <td className="py-3.5 text-slate-300">
                        {row.breakIn && row.breakIn !== "-" ? (
                          <div className="flex flex-col gap-0.5">
                            {row.breakIn.split(", ").map((t, i) => <div key={i}>{t}</div>)}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {row.breakOut && row.breakOut !== "-" ? (
                          <div className="flex flex-col gap-0.5">
                            {row.breakOut.split(", ").map((t, i) => <div key={i}>{t}</div>)}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 text-slate-300">{formatTime12(row.timeOutRaw || row.timeOut)}</td>
                      <td className="py-3.5 text-slate-300">{(row.workedMinutes / 60).toFixed(2)} hrs</td>
                      <td className="py-3.5 text-slate-300">{row.breakMinutes} mins</td>
                      <td className="py-3.5 text-slate-300">
                        {row.lateMinutes > 0 && <span className="text-rose-400 block">{row.lateMinutes}m late</span>}
                        {row.overtimeMinutes > 0 && <span className="text-emerald-400 block">{row.overtimeMinutes}m OT</span>}
                        {row.lateMinutes === 0 && row.overtimeMinutes === 0 && "-"}
                      </td>
                      <td className="py-3.5 text-slate-300 capitalize">{row.workType.replace("_", " ")}</td>
                      {role && role !== "employee" && (
                        <td className="py-3.5 font-bold text-emerald-400">PHP {row.estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      )}
                      <td className="py-3.5 text-slate-400 truncate max-w-[120px]">{row.notes || "-"}</td>
                      <td className="py-3.5 text-right space-x-2">
                        <button onClick={() => onEditRow(row)} className="p-1.5 rounded-lg border border-white/5 bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 transition inline-flex" title={role === "employee" ? "Request Correction" : "Edit Log"}>
                          <Edit2 size={12} />
                        </button>
                        {role && role !== "employee" && (
                          <button onClick={() => setConfirmDeleteId(row.date)} className="p-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/20 text-rose-300 transition inline-flex">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid Card View */}
            <div className="lg:hidden grid gap-4">
              {filteredHistoryRows.map((row) => (
                <div key={row.id} className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 relative">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2.5 mb-2.5">
                    <div>
                      <span className="text-xs font-black text-white">{row.date}</span>
                      <span className="block text-[10px] text-slate-500 capitalize">{row.workType.replace("_", " ")}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      row.status === "Timed out" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {row.status}
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs min-[420px]:grid-cols-2 mb-3">
                    <div><span className="text-slate-500">Clock In:</span> <span className="text-slate-200">{formatTime12(row.timeInRaw || row.timeIn)}</span></div>
                    <div>
                      <span className="text-slate-500 block">Break In:</span>
                      <span className="text-slate-200 block">
                        {row.breakIn && row.breakIn !== "-" ? (
                          row.breakIn.split(", ").map((t, i) => <span key={i} className="block">{t}</span>)
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Break Out:</span>
                      <span className="text-slate-200 block">
                        {row.breakOut && row.breakOut !== "-" ? (
                          row.breakOut.split(", ").map((t, i) => <span key={i} className="block">{t}</span>)
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                    <div><span className="text-slate-500">Clock Out:</span> <span className="text-slate-200">{formatTime12(row.timeOutRaw || row.timeOut)}</span></div>
                    <div><span className="text-slate-500">Worked:</span> <span className="text-slate-200">{(row.workedMinutes / 60).toFixed(2)}h</span></div>
                    <div><span className="text-slate-500">Breaks:</span> <span className="text-slate-200">{row.breakMinutes}m</span></div>
                    {role && role !== "employee" && (
                      <div>
                        <span className="text-slate-500 font-bold text-emerald-400">Est. Pay:</span> 
                        <span className="text-emerald-400 font-bold"> PHP {row.estimatedEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>

                  {row.notes && (
                    <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2 mb-3">
                      <strong>Notes:</strong> {row.notes}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
                    <button onClick={() => onEditRow(row)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-slate-800 text-[10px] font-bold text-slate-200">
                      <Edit2 size={10} /> {role === "employee" ? "Request Correction" : "Edit"}
                    </button>
                    {role && role !== "employee" && (
                      <button onClick={() => setConfirmDeleteId(row.date)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-[10px] font-bold text-rose-300">
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- SIMPLE PER-ROW TRASH CONFIRMATION DIALOG --- */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-sm rounded-3xl border-white/5 bg-slate-900 p-6 text-center space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <Trash2 className="text-rose-500 mx-auto" size={32} />
              <h4 className="text-base font-black text-white">Delete Attendance Record?</h4>
              <p className="text-xs text-slate-400">
                Are you absolutely sure you want to delete your personal attendance records for **{confirmDeleteId}**?
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition"
                >
                  No, Keep it
                </button>
                <button
                  onClick={() => {
                    onDeleteRow(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white transition animate-pulse"
                >
                  Yes, Delete Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
