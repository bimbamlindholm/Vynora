import { useState } from "react";
import { Clock3, FileText, Sparkles } from "lucide-react";
import { Modal } from "../employeeComponents";

const QUICK_REASONS = [
  "Project Deadline",
  "Urgent Client Tasks",
  "System Maintenance",
  "Meeting Overflow",
  "Coverage / Handover",
  "Catching up on backlogs",
];

export default function OvertimeReasonModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please state a reason for your overtime worked.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    onSubmit(reason.trim());
  };

  return (
    <Modal title="Overtime Approval Form" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-200">
        {/* Header Visual */}
        <div className="flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Clock3 size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Overtime Threshold Exceeded <Sparkles size={13} className="text-amber-400 animate-pulse" />
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
              You worked past your standard shift hours. Workspace policies require a reason for admin review to approve overtime pay.
            </p>
          </div>
        </div>

        {/* Quick Reasons */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select a Quick Reason
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((qReason) => (
              <button
                key={qReason}
                type="button"
                onClick={() => {
                  setReason(qReason);
                  setError("");
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  reason === qReason
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                {qReason}
              </button>
            ))}
          </div>
        </div>

        {/* Written Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
            <span>Or Write Custom Reason</span>
            <span className="text-slate-500 font-medium">{reason.length} / 150</span>
          </label>
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value.slice(0, 150));
                setError("");
              }}
              placeholder="State what tasks you were finalizing (e.g. Deploying server updates, helping a walk-in client)..."
              rows={3}
              maxLength={150}
              className="w-full rounded-xl border border-white/10 bg-[#0C1524] p-3 text-xs font-semibold text-white outline-none transition focus:border-amber-500/40 focus:bg-amber-500/[0.01]"
            />
            <div className="absolute right-3 bottom-3 text-slate-600">
              <FileText size={14} />
            </div>
          </div>
          {error && (
            <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-white/10 text-xs font-black text-slate-300 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 flex-[2] rounded-xl text-xs font-black text-slate-950 transition flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                Saving Clock Out...
              </>
            ) : (
              "Submit & Clock Out"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
