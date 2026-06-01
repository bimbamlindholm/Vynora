import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";
// Dashboard Stat Card Widget
function StatCard({ icon: Icon, title, val, subtitle }) {
  return (
    <div className="glass-panel flex min-w-0 flex-col justify-between rounded-2xl border-white/5 bg-slate-900/30 p-4">
      <div className="flex justify-between items-center">
        <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
          <Icon size={12} />
        </div>
      </div>
      <div className="mt-3">
        <span className="block max-w-full truncate text-sm font-black tracking-tight text-white sm:text-base">{val}</span>
        <span className="block text-[9px] text-slate-500 font-bold truncate mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
}

// Goals Progress Bar Indicator
function ProgressBar({ percent, color }) {
  return (
    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function PersonalAnalytics({ analyticsSummary, goals, goalsProgress }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-4 md:gap-4">
        <StatCard
          icon={DollarSign}
          title="Est. Today"
          val={`PHP ${analyticsSummary.todayEarnings.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`${analyticsSummary.todayWorkedHours.toFixed(2)} hrs worked`}
        />
        <StatCard
          icon={TrendingUp}
          title="Cutoff Total"
          val={`PHP ${analyticsSummary.cutoffEarnings.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`${analyticsSummary.cutoffHours.toFixed(2)} hrs logged`}
        />
        <StatCard
          icon={Calendar}
          title="Weekly Est."
          val={`PHP ${analyticsSummary.weeklyEarnings.toLocaleString(undefined, {
            minimumFractionDigits: 0,
          })}`}
          subtitle="Monday to Sunday"
        />
        <StatCard
          icon={Target}
          title="Month Est."
          val={`PHP ${analyticsSummary.monthlyEarnings.toLocaleString(undefined, {
            minimumFractionDigits: 0,
          })}`}
          subtitle="Calendar Month"
        />
      </div>

      <div className="glass-panel rounded-3xl border-white/5 bg-slate-900/30 p-4 sm:p-6 md:col-span-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-white">
          <Target size={16} className="text-emerald-400" />
          Monthly Target Goals
        </h3>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex flex-col gap-1 text-xs font-bold text-slate-300 sm:flex-row sm:justify-between">
              <span>Target Earnings</span>
              <span>
                PHP {analyticsSummary.monthlyEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {goals.targetEarnings.toLocaleString()} ({goalsProgress.earnPercent}%)
              </span>
            </div>
            <ProgressBar percent={goalsProgress.earnPercent} color="from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
          </div>

          <div>
            <div className="mb-1.5 flex flex-col gap-1 text-xs font-bold text-slate-300 sm:flex-row sm:justify-between">
              <span>Target Work Hours</span>
              <span>
                {analyticsSummary.monthlyHours.toFixed(1)}h / {goals.targetHours}h ({goalsProgress.hourPercent}%)
              </span>
            </div>
            <ProgressBar percent={goalsProgress.hourPercent} color="from-emerald-400 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          </div>
        </div>
      </div>
    </>
  );
}
