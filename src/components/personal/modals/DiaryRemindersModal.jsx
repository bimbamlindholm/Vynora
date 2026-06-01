import { motion } from "framer-motion";
import { X, BookOpen, Trash2, Calendar } from "lucide-react";

/**
 * Premium glassmorphic modal to view, edit, or delete a personal diary entry or reminder note for a date.
 */
export default function DiaryRemindersModal({
  isOpen,
  onClose,
  selectedDate,
  diaryText,
  setDiaryText,
  onSave,
}) {
  if (!isOpen) return null;

  const dateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-full max-w-md rounded-3xl border border-white/5 bg-slate-900 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen size={16} />
            </div>
            <div>
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block">Personal Diary</span>
              <h3 className="text-base font-black text-white">Diary & Reminders</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition cursor-pointer"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Date Display Card */}
        <div className="mb-4 flex items-center gap-3 bg-slate-950/20 p-3 rounded-2xl border border-white/5">
          <div className="p-1.5 rounded-lg bg-slate-950 text-slate-500">
            <Calendar size={14} />
          </div>
          <span className="text-xs font-black text-slate-200">{dateLabel}</span>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
            Write down your notes, tasks, or diary entries:
            <textarea
              id="diaryTextarea"
              name="diaryTextarea"
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="Type your diary entry or reminder here... e.g. Met client, completed project milestone, rest day planner..."
              className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-purple-500 h-32 resize-none custom-scrollbar transition-all duration-300"
            />
          </label>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            {diaryText && diaryText.trim() !== "" && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear this diary entry?")) {
                    setDiaryText("");
                    onSave(selectedDate, "");
                  }
                }}
                className="px-3 py-2 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl text-xs font-bold text-rose-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                Clear Note
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(selectedDate, diaryText)}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-black transition shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              Save Entry
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
