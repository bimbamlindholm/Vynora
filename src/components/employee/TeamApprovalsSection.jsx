/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, FilePenLine, CalendarDays, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { 
  fetchWorkspaceEmployees, 
  fetchWorkspaceAttendance, 
  buildDailyAttendanceRows, 
  todayKey 
} from "../../utils/supabaseAttendance";
import { fetchWorkspaceLeaves, updateLeaveStatus } from "../../utils/supabaseLeaves";
import { fetchCorrectionRequests, updateCorrectionRequestStatus } from "../../utils/supabaseCorrections";
import { workspaceToView } from "../../utils/supabaseMappers";

export default function TeamApprovalsSection() {
  const { profile, workspace } = useAuth();
  const { addToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = todayKey();
  const attendanceRules = useMemo(() => workspaceToView(workspace, profile), [workspace, profile]);

  const loadData = useCallback(async (isSilent = false) => {
    if (!workspace?.id || !profile?.id) return;
    if (!isSilent) setLoading(true);
    try {
      // 1. Fetch workspace employees and filter for this supervisor's subordinates
      const allEmployees = await fetchWorkspaceEmployees(workspace.id);
      const subordinates = allEmployees.filter(emp => emp.supervisorId === profile.id);
      setEmployees(subordinates);

      // Only fetch approvals & attendance if we actually have subordinates
      if (subordinates.length > 0) {
        const [recordsData, leavesData, correctionsData] = await Promise.all([
          fetchWorkspaceAttendance(workspace.id),
          fetchWorkspaceLeaves(workspace.id, { supervisorId: profile.id }),
          fetchCorrectionRequests(workspace.id, { supervisorId: profile.id })
        ]);
        setAttendanceRecords(recordsData);
        setLeaves(leavesData);
        setCorrections(correctionsData);
      } else {
        setAttendanceRecords([]);
        setLeaves([]);
        setCorrections([]);
      }
    } catch (err) {
      console.error("Failed to load supervisor team data:", err);
      addToast("Failed to load team data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workspace?.id, profile?.id, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // Build daily attendance states for subordinates
  const teamTodayRows = useMemo(() => {
    if (employees.length === 0) return [];
    return buildDailyAttendanceRows(attendanceRecords, employees, today, attendanceRules);
  }, [attendanceRecords, employees, today, attendanceRules]);

  // Filter for pending leaves (status === 'pending')
  const pendingLeaves = useMemo(() => {
    return leaves.filter(req => req.status?.toLowerCase() === "pending");
  }, [leaves]);

  // Filter for pending DTR corrections (status === 'Pending')
  const pendingCorrections = useMemo(() => {
    return corrections.filter(req => req.status === "Pending");
  }, [corrections]);

  // Handle Level 1 Approval of Leave
  const handleApproveLeave = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, "approved_by_supervisor", profile.id);
      addToast("Leave request pre-approved (Level 1 success)!", "success");
      loadData(true);
    } catch (err) {
      addToast(err.message || "Failed to approve leave.", "error");
    }
  };

  // Handle Reject of Leave
  const handleRejectLeave = async (leaveId) => {
    const confirmed = window.confirm("Are you sure you want to reject this leave request?");
    if (!confirmed) return;
    try {
      await updateLeaveStatus(leaveId, "rejected", profile.id);
      addToast("Leave request rejected.", "warning");
      loadData(true);
    } catch (err) {
      addToast(err.message || "Failed to reject leave.", "error");
    }
  };

  // Handle Level 1 Approval of DTR Correction
  const handleApproveCorrection = async (reqId) => {
    try {
      await updateCorrectionRequestStatus(reqId, "approved_by_supervisor", profile.id);
      addToast("Correction request pre-approved (Level 1 success)!", "success");
      loadData(true);
    } catch (err) {
      addToast(err.message || "Failed to approve DTR correction.", "error");
    }
  };

  // Handle Reject of DTR Correction
  const handleRejectCorrection = async (reqId) => {
    const confirmed = window.confirm("Are you sure you want to reject this correction request?");
    if (!confirmed) return;
    try {
      await updateCorrectionRequestStatus(reqId, "rejected", profile.id);
      addToast("Correction request rejected.", "warning");
      loadData(true);
    } catch (err) {
      addToast(err.message || "Failed to reject correction.", "error");
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-slate-300 text-center animate-pulse">
        Fetching supervisor dashboard credentials and subordinate status grids...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Overview stats header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="text-cyan-300" size={24} />
            My Team Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            You are managing <span className="text-cyan-300 font-bold">{employees.length} subordinates</span> assigned to you.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 px-4 rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-xs font-black text-cyan-200 hover:bg-cyan-300/20 transition active:scale-95 disabled:opacity-50"
          type="button"
        >
          {refreshing ? "Refreshing..." : "Sync Realtime"}
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-white/5">
          <span className="text-4xl block mb-3">👥</span>
          <h3 className="text-lg font-black text-white">No Assigned Subordinates</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            You haven't been assigned any subordinates in the Admin Dashboard yet. Ask your workspace Admin to select you as the supervisor for employees.
          </p>
        </div>
      ) : (
        <>
          {/* Subordinate Realtime Clock Grid */}
          <section className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-base font-black text-white flex items-center gap-2 mb-4">
              <Clock3 className="text-violet-300" size={18} />
              Today's Attendance Matrix
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teamTodayRows.map((row) => {
                const status = row.status || "Offline";
                let statusBadge = "bg-slate-400/10 text-slate-400 border-white/5";
                if (status === "Working") statusBadge = "bg-emerald-400/15 text-emerald-300 border-emerald-500/20";
                if (status === "On Break") statusBadge = "bg-violet-400/15 text-violet-300 border-violet-500/20";
                if (status === "Completed") statusBadge = "bg-sky-400/15 text-sky-300 border-sky-500/20";
                if (status === "Late") statusBadge = "bg-amber-400/15 text-amber-300 border-amber-500/20";
                if (status === "Rest Day") statusBadge = "bg-cyan-400/10 text-cyan-300 border-cyan-500/20";

                return (
                  <div 
                    key={row.id} 
                    className="rounded-xl border border-white/5 bg-white/[0.015] p-4 flex flex-col justify-between transition hover:border-cyan-300/15"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-white text-sm truncate">{row.employeeName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
                        {row.email}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-white/5 pt-3 flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                      <div className="flex justify-between">
                        <span>Clock In:</span>
                        <span className="text-slate-200 font-bold">{row.timeIn || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clock Out:</span>
                        <span className="text-slate-200 font-bold">{row.timeOut || "-"}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/[0.03] pt-1.5 mt-1">
                        <span>Worked Time:</span>
                        <span className="text-cyan-300 font-black">{row.totalHours || "0h 00m"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Double approvals grids */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* DTR Corrections Panel */}
            <section className="glass-panel rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FilePenLine className="text-cyan-300" size={18} />
                  Pending DTR Corrections
                </h3>
                <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-black text-cyan-300">
                  {pendingCorrections.length} level 1
                </span>
              </div>

              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-1">
                {pendingCorrections.length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">All subordinate DTR correction requests reviewed!</p>
                )}
                {pendingCorrections.map((req) => (
                  <div 
                    key={req.id} 
                    className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col justify-between transition hover:border-cyan-300/20"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-black text-white">{req.employeeName}</p>
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 rounded px-2 py-0.5 shrink-0">
                          {req.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-cyan-300 font-semibold mt-1 uppercase tracking-wider">
                        {req.requestType}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                        <div className="rounded bg-white/[0.02] p-2 border border-white/5">
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Current</p>
                          <p className="text-slate-300 font-bold mt-0.5">{req.currentValue || "None"}</p>
                        </div>
                        <div className="rounded bg-cyan-300/[0.02] p-2 border border-cyan-400/10">
                          <p className="text-[9px] text-cyan-300 font-bold uppercase">Requested</p>
                          <p className="text-cyan-200 font-black mt-0.5">{req.requestedValue || "-"}</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded bg-white/[0.02] p-2 border border-white/5 text-xs font-medium text-slate-400">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Reason</p>
                        <p className="italic mt-0.5">"{req.reason}"</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleRejectCorrection(req.id)}
                        className="h-9 rounded-lg border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-bold text-rose-300 transition flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} /> Deny
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveCorrection(req.id)}
                        className="h-9 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-xs font-black text-slate-950 transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Pre-Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Leave Requests Panel */}
            <section className="glass-panel rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarDays className="text-violet-300" size={18} />
                  Pending Leaves
                </h3>
                <span className="rounded-full bg-violet-400/20 px-2 py-0.5 text-xs font-black text-violet-300">
                  {pendingLeaves.length} level 1
                </span>
              </div>

              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-1">
                {pendingLeaves.length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">All subordinate leave requests reviewed!</p>
                )}
                {pendingLeaves.map((req) => (
                  <div 
                    key={req.id} 
                    className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col justify-between transition hover:border-violet-300/20"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-black text-white">{req.profile?.full_name || "Employee"}</p>
                        <span className="text-[10px] font-bold text-violet-300 bg-violet-400/10 border border-violet-500/20 rounded px-2 py-0.5 shrink-0">
                          {req.leave_type || "Leave"}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between text-xs font-semibold text-slate-300">
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Start Date</p>
                          <p className="font-bold text-slate-200 mt-0.5">{req.start_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-500 font-bold uppercase">End Date</p>
                          <p className="font-bold text-slate-200 mt-0.5">{req.end_date}</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded bg-white/[0.02] p-2 border border-white/5 text-xs font-medium text-slate-400">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Reason</p>
                        <p className="italic mt-0.5">"{req.reason || "No reason provided"}"</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleRejectLeave(req.id)}
                        className="h-9 rounded-lg border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-bold text-rose-300 transition flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} /> Deny
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveLeave(req.id)}
                        className="h-9 rounded-lg bg-violet-400 hover:bg-violet-500 text-xs font-black text-slate-950 transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Pre-Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
