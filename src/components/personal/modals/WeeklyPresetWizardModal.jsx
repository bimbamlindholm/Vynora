import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Modal to batch-generate standard workdays and rest days for a selected calendar week.
 */
export default function WeeklyPresetWizardModal({
  isOpen,
  onClose,
  weekDaysList,
  presetForm,
  setPresetForm,
  onSubmit,
  submitting,
}) {
  if (!isOpen || !weekDaysList || weekDaysList.length < 7) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-full max-w-lg rounded-3xl border border-white/5 bg-slate-900 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar text-left"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">WEEKLY GENERATOR</span>
            <h3 className="text-base font-black text-white">Generate Weekly Shift Presets</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition cursor-pointer"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <p className="text-xs text-slate-400 leading-relaxed">
            Batch assign shifting hours and Rest Days for the selected week:
            <span className="text-emerald-400 font-extrabold block mt-1">
              {weekDaysList[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
              {weekDaysList[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </p>

          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-300">Select Active Workdays</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/30 p-3 rounded-2xl border border-white/5">
              {Object.entries({
                1: "Monday",
                2: "Tuesday",
                3: "Wednesday",
                4: "Thursday",
                5: "Friday",
                6: "Saturday",
                0: "Sunday",
              }).map(([dayNum, dayName]) => (
                <label key={dayNum} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1 font-semibold">
                  <input
                    type="checkbox"
                    checked={presetForm.workDays[dayNum]}
                    onChange={(e) => {
                      const nextDays = { ...presetForm.workDays, [dayNum]: e.target.checked };
                      setPresetForm({ ...presetForm, workDays: nextDays });
                    }}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 outline-none cursor-pointer"
                  />
                  {dayName.slice(0, 3)}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Shift Start Time
              <input
                type="time"
                id="presetStart"
                name="presetStart"
                value={presetForm.shiftStart}
                onChange={(e) => setPresetForm({ ...presetForm, shiftStart: e.target.value })}
                required
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </label>

            <label className="grid gap-1 text-xs text-slate-400 font-bold">
              Shift End Time
              <input
                type="time"
                id="presetEnd"
                name="presetEnd"
                value={presetForm.shiftEnd}
                onChange={(e) => setPresetForm({ ...presetForm, shiftEnd: e.target.value })}
                required
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
              />
            </label>
          </div>

          <label className="grid gap-1 text-xs text-slate-400 font-bold">
            Shift Label
            <input
              type="text"
              id="presetLabel"
              name="presetLabel"
              value={presetForm.label}
              onChange={(e) => setPresetForm({ ...presetForm, label: e.target.value })}
              required
              className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50"
            />
          </label>

          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            * Note: Checked days will be created as work shifts, unchecked days will be created explicitly as "Rest Days" (colored gray and multipliers will automatically apply if timecard events are logged).
          </p>

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
              {submitting ? "Generating..." : "Generate Preset"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
