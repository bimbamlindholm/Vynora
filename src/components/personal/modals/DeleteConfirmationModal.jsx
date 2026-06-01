import { Trash2 } from "lucide-react";

/**
 * Modern dialog asking users to confirm deleting a DTR record.
 */
export default function DeleteConfirmationModal({
  isOpen,
  confirmDeleteId,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-3xl border-white/5 bg-slate-900 p-6 text-center space-y-4">
        <Trash2 className="text-rose-500 mx-auto animate-bounce" size={32} />
        <h4 className="text-base font-black text-white">Delete Attendance Record?</h4>
        <p className="text-xs text-slate-400">
          Are you absolutely sure you want to delete your personal attendance records for <strong>{confirmDeleteId}</strong>?
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
          >
            No, Keep it
          </button>
          <button
            type="button"
            onClick={() => onConfirm(confirmDeleteId)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white transition cursor-pointer"
          >
            Yes, Delete Log
          </button>
        </div>
      </div>
    </div>
  );
}
