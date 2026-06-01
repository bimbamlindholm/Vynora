import { Play, Pause, StopCircle, Lock } from "lucide-react";
import { ClockButton } from "./personalComponents";

export default function PersonalWelcomeCard({
  currentTime,
  todayRow,
  dtrButtonsConfig,
  submitting,
  onClockAction,
  role,
}) {
  const colSpanClass = role === "employee" ? "md:col-span-12" : "md:col-span-8";
  return (
    <div className={`glass-panel relative flex min-w-0 flex-col justify-between overflow-hidden rounded-3xl border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-4 sm:p-6 ${colSpanClass} lg:p-8`}>
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative z-10 mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 sm:text-xs">
            TODAY IS
          </span>
          <h2 className="mt-1 break-words text-base font-black leading-tight text-white sm:text-lg">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>
        </div>

        <div
          className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold sm:text-xs ${
            todayRow?.status === "Working"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : todayRow?.status === "On break"
              ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
              : todayRow?.status === "Timed out"
              ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
              : "border-slate-500/20 bg-slate-500/5 text-slate-400"
          }`}
        >
          {todayRow?.status || "Not timed in"}
        </div>
      </div>

      <div className="relative z-10 overflow-hidden py-4 text-center sm:py-6">
        <span className="block max-w-full whitespace-nowrap text-3xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] sm:text-5xl md:text-6xl">
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <ClockButton
          icon={Play}
          label="Time In"
          color="bg-emerald-500 hover:bg-emerald-400"
          active={dtrButtonsConfig.canTimeIn}
          onClick={() => onClockAction("time_in")}
          disabled={submitting}
        />
        <ClockButton
          icon={Pause}
          label="Break In"
          color="bg-amber-500 hover:bg-amber-400"
          active={dtrButtonsConfig.canBreakIn}
          onClick={() => onClockAction("break_in")}
          disabled={submitting}
        />
        <ClockButton
          icon={Play}
          label="Break Out"
          color="bg-teal-500 hover:bg-teal-400"
          active={dtrButtonsConfig.canBreakOut}
          onClick={() => onClockAction("break_out")}
          disabled={submitting}
        />
        <ClockButton
          icon={dtrButtonsConfig?.shiftNotFinished ? Lock : StopCircle}
          label={dtrButtonsConfig?.shiftNotFinished ? "Locked" : "Time Out"}
          color={dtrButtonsConfig?.shiftNotFinished ? "bg-slate-700/60 hover:bg-slate-600/60 border-slate-700/40 text-slate-400" : "bg-rose-500 hover:bg-rose-400"}
          active={dtrButtonsConfig.canTimeOut}
          onClick={() => onClockAction("time_out")}
          disabled={submitting}
        />
      </div>
    </div>
  );
}
