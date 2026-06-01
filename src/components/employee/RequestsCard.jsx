import { EmptyState } from "./employeeComponents";

const STATUS_STYLES = {
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

const TYPE_STYLES = {
  leave: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  correction: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
};

export default function RequestsCard({ requests = [], leaveRequests = [] }) {
  const allRequests = [
    ...requests.map((r) => ({ ...r, _kind: "correction" })),
    ...leaveRequests.map((r) => ({ ...r, _kind: "leave" })),
  ].sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6">
      <h2 className="text-xl font-black text-white">My Requests</h2>
      <div className="mt-4 grid gap-3">
        {allRequests.length === 0 ? (
          <EmptyState text="No requests submitted yet." />
        ) : (
          allRequests.map((request) => (
            <div
              className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm"
              key={request.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${TYPE_STYLES[request._kind] || TYPE_STYLES.correction}`}>
                  {request._kind === "leave" ? `${request.leave_type || "Leave"} Leave` : request.requestType || "Correction"}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[request.status] || STATUS_STYLES.pending}`}>
                  {request.status || "Pending"}
                </span>
              </div>
              {request._kind === "leave" && (
                <p className="mt-2 text-xs text-slate-400">
                  {request.start_date} → {request.end_date}
                </p>
              )}
              {request._kind === "correction" && request.date && (
                <p className="mt-2 text-xs text-slate-400">{request.date}</p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
