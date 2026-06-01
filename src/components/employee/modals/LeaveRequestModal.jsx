import { useState } from "react";
import { CalendarCheck2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { createLeaveRequest } from "../../../utils/supabaseLeaves";
import { todayKey } from "../../../utils/supabaseAttendance";

const LEAVE_TYPES = [
  { value: "vacation", label: "Vacation Leave (VL)", color: "emerald", desc: "Pre-approved paid rest day." },
  { value: "sick", label: "Sick Leave (SL)", color: "amber", desc: "Medical or health-related absence." },
  { value: "emergency", label: "Emergency Leave (EL)", color: "rose", desc: "Unexpected urgent personal matter." },
];

const COLOR_STYLES = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300 ring-amber-500/40",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300 ring-rose-500/40",
};

export default function LeaveRequestModal({ onClose, onSaved }) {
  const { workspace, profile } = useAuth();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: "vacation",
    startDate: todayKey(),
    endDate: todayKey(),
    reason: "",
  });

  const selectedType = LEAVE_TYPES.find((t) => t.value === form.leaveType);

  const submit = async (event) => {
    event.preventDefault();
    if (!workspace?.id || !profile?.id) {
      addToast("Workspace configuration error.", "error");
      return;
    }
    if (form.endDate < form.startDate) {
      addToast("End date cannot be before start date.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createLeaveRequest({
        workspaceId: workspace.id,
        userId: profile.id,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      });
      addToast("Leave request submitted successfully! Awaiting admin approval.", "success");
      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to submit leave request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-3 backdrop-blur-sm sm:p-4">
      <div className="glass-panel max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl p-5 sm:max-h-[88vh] sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-300">
                <CalendarCheck2 size={18} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">Leave Management</p>
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">File a Leave Request</h2>
            <p className="mt-1 text-sm text-slate-400">Submit for admin review. Approved leaves count as paid days.</p>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:border-white/20 hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form className="grid gap-5" onSubmit={submit}>
          {/* Leave Type Selector */}
          <div>
            <label className="mb-3 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">Leave Type</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {LEAVE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, leaveType: type.value })}
                  className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${
                    form.leaveType === type.value
                      ? `${COLOR_STYLES[type.color]} ring-2 ring-offset-0`
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
                  }`}
                >
                  <p className="text-xs font-black">{type.label}</p>
                  <p className="mt-1 text-[10px] leading-4 opacity-80">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">Start Date</label>
              <input
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-cyan-300/50"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">End Date</label>
              <input
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-cyan-300/50"
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">Reason</label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white outline-none focus:border-cyan-300/50"
              placeholder={`Briefly explain your ${selectedType?.label || "leave"}...`}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <button
            className="glow-button h-12 w-full rounded-xl text-sm font-black text-white disabled:opacity-50"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
