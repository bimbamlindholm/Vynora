import {
  Camera, MapPin, Coffee, MessageSquareText,
  FilePenLine, Download, WalletCards, CalendarCheck2, SunMedium,
} from "lucide-react";
import { ActionButton, EmptyState } from "./employeeComponents";
import { useToast } from "../../contexts/ToastContext";

function FeatureCard({ icon: Icon, text, title, onClick }) {
  const isClickable = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      className={`min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 ${
        isClickable ? "cursor-pointer active:scale-95" : ""
      }`}
    >
      <Icon className="text-cyan-300" size={25} />
      <h3 className="mt-3 font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function FeatureButtonCard({ buttonText, icon: Icon, onClick, text, title }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10">
      <Icon className="text-cyan-300" size={25} />
      <h3 className="mt-3 font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
      <button
        className="mt-4 w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20"
        onClick={onClick}
        type="button"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default function AttendanceActions({
  actionError,
  comment,
  enabledTimeButtons,
  featureCount,
  onCommentChange,
  onCorrection,
  onDownload,
  onLeave,
  onRecordAction,
  onSaveComment,
  permissions,
  submittingAction,
  onBiometricClick,
  isTodayLocked = false,
  isOffline = false,
  pendingOfflineCount = 0,
  onSyncNow = () => {},
}) {
  const { addToast } = useToast();
  const breakOptions = [
    permissions.paidBreakOption && "Paid Break",
    permissions.unpaidBreakOption && "Unpaid Break",
  ].filter(Boolean);

  const showBreakSettings =
    permissions.breakIn && (breakOptions.length > 0 || permissions.requireBreakReason);

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">Allowed Attendance Actions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Only admin-enabled tools appear here.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOffline && (
            <span className="flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-200 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-orange-400"></span>
              Offline
            </span>
          )}
          {pendingOfflineCount > 0 && (
            <button
              onClick={onSyncNow}
              disabled={isOffline}
              title={isOffline ? "You are offline. Reconnect to sync." : "Click to sync now."}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black border transition active:scale-95 disabled:scale-100 ${
                isOffline
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300/60 cursor-not-allowed"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] cursor-pointer"
              }`}
            >
              🔄 {pendingOfflineCount} Pending
            </button>
          )}
          <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-100">
            Admin-Controlled
          </span>
        </div>
      </div>

      {featureCount === 0 ? (
        <EmptyState text="Your admin has not enabled any employee tools yet." />
      ) : (
        <div className="mt-5 grid gap-4">
          {permissions.manualTimeTracking && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-black text-white">Time Tracking</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Vynora will show the next allowed action only.
                  </p>
                </div>
                {permissions.locationRequired && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-200">
                    <MapPin size={14} /> Location required
                  </span>
                )}
              </div>

              {isTodayLocked ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <span className="shrink-0 text-amber-400">🔒</span>
                  <p className="font-semibold">
                    Attendance tracking is locked for today. This cutoff period has been finalized and released by the administrator.
                  </p>
                </div>
              ) : enabledTimeButtons.length > 0 ? (
                <div className="mt-4 grid gap-2 min-[380px]:grid-cols-2 lg:grid-cols-4">
                  {enabledTimeButtons.map((button) => (
                    <ActionButton
                      key={button.field}
                      label={button.label}
                      loading={submittingAction === button.field}
                      disabled={Boolean(submittingAction)}
                      onClick={() => onRecordAction(button.field)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                  Attendance for today is complete or no time action is currently available.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
            {permissions.cameraAttendance && (
              <FeatureCard
                icon={Camera}
                title="Camera Attendance"
                text="Capture attendance with photo, time, and date."
                onClick={() => {
                  if (isTodayLocked) {
                    addToast("Today's period is locked. Attendance actions are disabled.", "error");
                  } else {
                    onBiometricClick("camera-biometric");
                  }
                }}
              />
            )}
            {permissions.locationRequired && (
              <FeatureCard icon={MapPin} title="Location Required" text="GPS/location verification is required by your admin." />
            )}

            {showBreakSettings && (
              <FeatureCard
                icon={Coffee}
                title="Break Settings"
                text={
                  breakOptions.length > 0
                    ? `Break type selection enabled: ${breakOptions.join(" or ")}.`
                    : "Break reason rules are enabled."
                }
              />
            )}
            {permissions.requireBreakReason && (
              <FeatureCard
                icon={MessageSquareText}
                title="Break Reason"
                text="Reason may be required for extended or late breaks."
              />
            )}
            {permissions.correctionRequests && (
              <FeatureButtonCard
                icon={FilePenLine}
                title="Correction Request"
                text="Request changes to incorrect attendance records. Admin approval required."
                buttonText="Request Correction"
                onClick={onCorrection}
              />
            )}
            {permissions.employeePdfExport && (
              <FeatureButtonCard
                icon={Download}
                title="Download My DTR"
                text="Export your own attendance records for review."
                buttonText="Export CSV"
                onClick={onDownload}
              />
            )}
            {permissions.salaryEstimate && (
              <FeatureCard icon={WalletCards} title="Salary Estimate" text="Preview estimated earnings from recorded work hours." />
            )}
            {permissions.leaveRequests && (
              <FeatureButtonCard
                icon={CalendarCheck2}
                title="Leave Request"
                text="Submit VL, SL, or EL for admin review and approval."
                buttonText="File a Leave"
                onClick={onLeave}
              />
            )}
            {permissions.restDayStatus && (
              <FeatureCard icon={SunMedium} title="Rest Day / Status" text="View rest day and daily work status information." />
            )}
          </div>

          {permissions.employeeComments && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <MessageSquareText className="text-cyan-300" size={22} />
                <div>
                  <h3 className="font-black text-white">Comments / Reason Notes</h3>
                  <p className="mt-1 text-sm text-slate-400">Add a note to today's attendance record.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50"
                  placeholder="Example: Late due to traffic"
                  value={comment}
                  onChange={(event) => onCommentChange(event.target.value)}
                />
                <button
                  className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20"
                  onClick={onSaveComment}
                  type="button"
                >
                  Save Comment
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm font-semibold text-rose-100">
              {actionError}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
