import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Modal to edit or assign a single custom shift for an employee scheduler grid day.
 */
export default function EditShiftModal({
  isOpen,
  onClose,
  selectedScheduleDate,
  scheduleForm,
  setScheduleForm,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-full max-w-md rounded-3xl border border-white/5 bg-slate-900 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar text-left"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">SHIFT EDITOR</span>
            <h3 className="text-base font-black text-white">
              Shift for {new Date(selectedScheduleDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </h3>
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
              Shift Start Time <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="time"
                id="shiftStart"
                name="shiftStart"
                value={scheduleForm.shiftStart}
                onChange={(e) => setScheduleForm({ ...scheduleForm, shiftStart: e.target.value || "" })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </label>

            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Shift End Time <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="time"
                id="shiftEnd"
                name="shiftEnd"
                value={scheduleForm.shiftEnd}
                onChange={(e) => setScheduleForm({ ...scheduleForm, shiftEnd: e.target.value || "" })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Shift Label
              <select
                id="shiftLabelSelect"
                name="shiftLabelSelect"
                value={scheduleForm.label}
                onChange={(e) => setScheduleForm({ ...scheduleForm, label: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Rest Day">Rest Day (Non-working)</option>
                <option value="Regular Holiday">Regular Holiday</option>
                <option value="Special Holiday">Special Holiday</option>
              </select>
            </label>

            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Label Color
              <select
                id="shiftColor"
                name="shiftColor"
                value={scheduleForm.color}
                onChange={(e) => setScheduleForm({ ...scheduleForm, color: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="#10b981">Emerald Green</option>
                <option value="#06b6d4">Cyan Blue</option>
                <option value="#f59e0b">Amber Orange</option>
                <option value="#f43f5e">Rose Red</option>
                <option value="#8b5cf6">Purple Violet</option>
                <option value="#64748b">Slate Gray</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1 text-xs text-slate-400 font-bold">
            Day Category (Multipliers)
            <select
              id="shiftWorkType"
              name="shiftWorkType"
              value={scheduleForm.workType || "regular"}
              onChange={(e) => setScheduleForm({ ...scheduleForm, workType: e.target.value })}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white cursor-pointer outline-none focus:border-emerald-500/50"
            >
              <option value="regular">Regular Workday (1.0x)</option>
              <option value="rest_day">Rest Day (1.3x)</option>
              <option value="regular_holiday">Regular Holiday (2.0x Double Pay)</option>
              <option value="special_holiday">Special Holiday (1.3x Pay)</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs text-slate-400 font-bold">
            Custom Notes
            <input
              type="text"
              id="shiftNotes"
              name="shiftNotes"
              placeholder="e.g. Meet client at office, work from home"
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
            />
          </label>

          <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/20 p-4 sm:items-center sm:gap-4">
            <input
              type="checkbox"
              id="modalPaidBreaks"
              name="modalPaidBreaks"
              checked={scheduleForm.breakIsPaid || false}
              onChange={(e) => setScheduleForm({ ...scheduleForm, breakIsPaid: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 outline-none cursor-pointer"
            />
            <label htmlFor="modalPaidBreaks" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
              Mark this break as **Paid Break** (If checked, break duration will not be deducted from worked DTR hours)
            </label>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black transition shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Shift"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
