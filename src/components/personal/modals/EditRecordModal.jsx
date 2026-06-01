import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";

/**
 * Modal to edit an existing DTR attendance record's clock timings, break times, and status.
 */
export default function EditRecordModal({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  onSubmit,
  submitting,
}) {
  if (!isOpen || !editForm) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-full max-w-lg rounded-3xl border border-white/5 bg-slate-900 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar text-left"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">LOG EDITOR</span>
            <h3 className="text-base font-black text-white">Adjust logs for {editForm.date}</h3>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Time In Clock
              <input
                type="time"
                id="editTimeIn"
                name="editTimeIn"
                value={editForm.timeIn}
                onChange={(e) => setEditForm({ ...editForm, timeIn: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
                required
              />
            </label>
            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Time Out Clock <span className="font-normal text-slate-500">(optional for today's incomplete log)</span>
              <input
                type="time"
                id="editTimeOut"
                name="editTimeOut"
                value={editForm.timeOut}
                onChange={(e) => setEditForm({ ...editForm, timeOut: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </label>
          </div>

          {/* Breaks adjustments inside editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-bold">Break sessions</span>
              <button
                type="button"
                onClick={() => setEditForm({
                  ...editForm,
                  breaks: [...editForm.breaks, { breakIn: "", breakOut: "" }]
                })}
                className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
              >
                <Plus size={10} /> Add Break
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {editForm.breaks.map((b, idx) => (
                <div key={idx} className="flex gap-2 items-end bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                  <label className="grid gap-1 text-[10px] text-slate-500 font-bold">
                    Break In
                    <input
                      type="time"
                      id={`editBreakIn_${idx}`}
                      name={`editBreakIn_${idx}`}
                      value={b.breakIn}
                      onChange={(e) => {
                        const next = [...editForm.breaks];
                        next[idx].breakIn = e.target.value;
                        setEditForm({ ...editForm, breaks: next });
                      }}
                      className="px-2 py-1 rounded bg-slate-950 border border-white/10 text-xs text-white"
                    />
                  </label>
                  <label className="grid gap-1 text-[10px] text-slate-500 font-bold">
                    Break Out
                    <input
                      type="time"
                      id={`editBreakOut_${idx}`}
                      name={`editBreakOut_${idx}`}
                      value={b.breakOut}
                      onChange={(e) => {
                        const next = [...editForm.breaks];
                        next[idx].breakOut = e.target.value;
                        setEditForm({ ...editForm, breaks: next });
                      }}
                      className="px-2 py-1 rounded bg-slate-950 border border-white/10 text-xs text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = editForm.breaks.filter((_, i) => i !== idx);
                      setEditForm({ ...editForm, breaks: next });
                    }}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-300 hover:text-rose-200 transition cursor-pointer shrink-0"
                    title="Remove break session"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {editForm.breaks.length === 0 && (
                <p className="text-[10px] text-slate-500 italic">Walang break sessions na nakarekord.</p>
              )}
            </div>
          </div>


          <label className="grid gap-1 text-xs text-slate-400 font-bold">
            Record Notes / Comment
            <textarea
              id="editNotes"
              name="editNotes"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="e.g. Field meeting, traffic late, timeout correction..."
              className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 h-20 resize-none"
            />
          </label>

          <div className="flex gap-2 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-700 transition"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black text-white cursor-pointer transition shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Recalculate & Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
