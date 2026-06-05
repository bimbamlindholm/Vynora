import { motion } from "framer-motion";
import StatBlock from "../dashboard/StatBlock";

function PersonalInsightsSection({
  chartPath,
  earningsPath,
  analyticsSummary
}) {
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Worked Hours Trend Chart */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 bg-slate-900/30">
          <h3 className="text-sm font-extrabold text-white mb-4">Worked Hours Trend (Last 14 days)</h3>
          {chartPath ? (
            <div className="relative">
              <svg viewBox="0 0 600 150" className="w-full h-auto text-emerald-400 overflow-visible">
                <defs>
                  <linearGradient id="hourGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path d={`${chartPath} L 570 120 L 30 120 Z`} fill="url(#hourGlow)" />
                {/* Line path */}
                <path d={chartPath} fill="none" stroke="currentColor" strokeWidth="2.5" />
              </svg>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-6">
                <span>Older logs</span>
                <span>Most Recent</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Log at least two days to render hours trend lines.
            </div>
          )}
        </div>

        {/* Earnings Trend Chart */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 bg-slate-900/30">
          <h3 className="text-sm font-extrabold text-white mb-4">Earnings Trend (PHP)</h3>
          {earningsPath ? (
            <div className="relative">
              <svg viewBox="0 0 600 150" className="w-full h-auto text-teal-400 overflow-visible">
                <defs>
                  <linearGradient id="earnGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${earningsPath} L 570 120 L 30 120 Z`} fill="url(#earnGlow)" />
                <path d={earningsPath} fill="none" stroke="currentColor" strokeWidth="2.5" />
              </svg>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-6">
                <span>Older logs</span>
                <span>Most Recent</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Log at least two days to render salary trend lines.
            </div>
          )}
        </div>

        {/* Numerical Stats overview */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBlock title="Average Hours / Day" val={`${analyticsSummary.avgDailyHours.toFixed(2)}h`} desc="Timed out days" />
          <StatBlock title="Total Month Overtime" val={`${analyticsSummary.totalOvertimeHours.toFixed(2)}h`} desc="Excess hours logged" />
          <StatBlock title="Monthly Lateness" val={`${analyticsSummary.totalLateCount} times`} desc={`${analyticsSummary.totalLateMinutes} mins total`} />
          <StatBlock title="Total Net Earnings" val={`PHP ${analyticsSummary.monthlyEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} desc="Cutoff & holiday paid" />
        </div>
      </div>
    </motion.div>
  );
}

export default PersonalInsightsSection;
