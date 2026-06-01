import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";

/**
 * Modal to manually create an attendance log with optional time out and multiple break sessions.
 * This supports incomplete same-day logs so users can resume the DTR flow from the dashboard.
 */
export default function AddRecordModal({
  isOpen,
  onClose,
  addForm,
  setAddForm,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  const breakSessions = Array.isArray(addForm.breaks)
    ? addForm.breaks
    : [{ breakIn: addForm.breakIn || "12:00", breakOut: addForm.breakOut || "13:00" }];

  const updateBreakSession = (index, field, value) => {
    const nextBreaks = [...breakSessions];
    nextBreaks[index] = { ...nextBreaks[index], [field]: value };
    setAddForm({ ...addForm, breaks: nextBreaks, hasBreak: nextBreaks.length > 0 });
  };

  const addBreakSession = () => {
    setAddForm({
      ...addForm,
      hasBreak: true,
      breaks: [...breakSessions, { breakIn: "", breakOut: "" }],
    });
  };

  const removeBreakSession = (index) => {
    const nextBreaks = breakSessions.filter((_, i) => i !== index);
    setAddForm({ ...addForm, breaks: nextBreaks, hasBreak: nextBreaks.length > 0 });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-full max-w-lg rounded-3xl border border-white/5 bg-slate-900 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar text-left"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">MANUAL ENTRY</span>
            <h3 className="text-base font-black text-white">Create / Resume Attendance Log</h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Time Out is optional for today. Leave it blank if you want to continue the session from the dashboard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <label className="grid gap-1 text-xs text-slate-400 font-bold">
            Select Date
            <input
              type="date"
              id="addDate"
              name="addDate"
              value={addForm.date}
              onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              required
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Time In Clock
              <input
                type="time"
                id="addTimeIn"
                name="addTimeIn"
                value={addForm.timeIn}
                onChange={(e) => setAddForm({ ...addForm, timeIn: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
                required
              />
            </label>
            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Time Out Clock <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="time"
                id="addTimeOut"
                name="addTimeOut"
                value={addForm.timeOut}
                onChange={(e) => setAddForm({ ...addForm, timeOut: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </label>
          </div>

          <div className="bg-slate-950/20 p-3 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addHasBreak"
                  name="addHasBreak"
                  checked={addForm.hasBreak}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAddForm({
                      ...addForm,
                      hasBreak: checked,
                      breaks: checked && breakSessions.length === 0
                        ? [{ breakIn: "12:00", breakOut: "13:00" }]
                        : breakSessions,
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 outline-none cursor-pointer"
                />
                <label htmlFor="addHasBreak" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Includes break session(s)
                </label>
              </div>

              {addForm.hasBreak && (
                <button
                  type="button"
                  onClick={addBreakSession}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black text-emerald-300 hover:bg-emerald-400/15"
                >
                  <Plus size={12} /> Add Break
                </button>
              )}
            </div>

            {addForm.hasBreak && (
              <div className="space-y-2 border-l border-white/5 pl-4">
                {breakSessions.map((session, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-xl border border-white/5 bg-slate-950/20 p-2">
                    <label className="grid gap-1 text-[10px] text-slate-500 font-bold">
                      Break Start #{index + 1}
                      <input
                        type="time"
                        id={`addBreakIn_${index}`}
                        name={`addBreakIn_${index}`}
                        value={session.breakIn}
                        onChange={(e) => updateBreakSession(index, "breakIn", e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-white/10 text-xs text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-[10px] text-slate-500 font-bold">
                      Break End #{index + 1} <span className="font-normal text-slate-600">optional</span>
                      <input
                        type="time"
                        id={`addBreakOut_${index}`}
                        name={`addBreakOut_${index}`}
                        value={session.breakOut}
                        onChange={(e) => updateBreakSession(index, "breakOut", e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-white/10 text-xs text-white outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeBreakSession(index)}
                      className="mb-0.5 rounded-lg bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"
                      title="Remove break session"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          <label className="grid gap-1 text-xs text-slate-400 font-bold">
            Record Notes / Comment
            <textarea
              id="addNotes"
              name="addNotes"
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="e.g. Field meeting, traffic late, forgot timeout correction..."
              className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 h-20 resize-none"
            />
          </label>

          <div className="flex gap-2 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-700 transition"
            >
              Discard Entries
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black text-white cursor-pointer transition shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50"
            >
              {submitting ? "Recording..." : "Calculate & Add Log"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
