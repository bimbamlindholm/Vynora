import { useMemo } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border border-white/10 bg-[#0B1424]/90 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} className="mt-1 text-sm font-black" style={{ color: p.color }}>
            {p.name}: {p.name.includes("Earnings") ? `₱${p.value.toLocaleString()}` : `${p.value}h`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EmployeeAnalyticsSection({ myRecords }) {
  const analyticsData = useMemo(() => {
    // If myRecords is empty, use highly realistic mock data
    const hasEnoughRecords = myRecords && myRecords.length >= 2;
    const sourceRecords = hasEnoughRecords 
      ? [...myRecords].reverse() // show in chronological order
      : [
          { date: "May 15", totalHours: "8h 00m", lateMinutes: 0 },
          { date: "May 16", totalHours: "9h 30m", lateMinutes: 15 },
          { date: "May 17", totalHours: "8h 00m", lateMinutes: 0 },
          { date: "May 18", totalHours: "8h 00m", lateMinutes: 0 },
          { date: "May 19", totalHours: "10h 15m", lateMinutes: 5 }
        ];

    const rate = 250; // PHP 250 per hour hourly rate
    let cumulative = 0;
    const result = [];

    for (const r of sourceRecords) {
      // Parse date for clean labels
      let label = r.date;
      try {
        const dateObj = new Date(r.date);
        if (!isNaN(dateObj.getTime())) {
          label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      } catch (e) {
        console.warn("Date parse error", e);
      }

      // Parse hours
      let hours;
      if (typeof r.totalHours === "number") {
        hours = r.totalHours;
      } else {
        const hMatch = String(r.totalHours || "").match(/(\d+)h/);
        const mMatch = String(r.totalHours || "").match(/(\d+)m/);
        const h = hMatch ? parseInt(hMatch[1], 10) : 0;
        const m = mMatch ? parseInt(mMatch[1], 10) : 0;
        hours = h + (m / 60);
        if (hours === 0 && !isNaN(r.totalHours) && r.totalHours) {
          hours = parseFloat(r.totalHours);
        }
      }

      const regular = Math.min(hours, 8);
      const ot = Math.max(0, hours - 8);
      
      // Earnings calculation
      const dayEarnings = (regular * rate) + (ot * rate * 1.5);
      cumulative += dayEarnings;

      result.push({
        label,
        hours: Number(hours.toFixed(2)),
        regular: Number(regular.toFixed(2)),
        ot: Number(ot.toFixed(2)),
        earnings: Math.round(dayEarnings),
        cumulative: Math.round(cumulative),
        isSynthetic: !hasEnoughRecords
      });
    }

    return result;
  }, [myRecords]);

  const punctualityRate = useMemo(() => {
    const sourceRecords = myRecords && myRecords.length > 0 ? myRecords : null;
    if (!sourceRecords) return 92; // high realistic fallback
    const onTimeCount = sourceRecords.filter(r => (r.lateMinutes || 0) === 0 && !r.isAbsent).length;
    return Math.round((onTimeCount / sourceRecords.length) * 100);
  }, [myRecords]);

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6 lg:p-7 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <TrendingUp size={120} className="text-cyan-300" />
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-300" size={18} />
            <h2 className="text-xl font-black text-white sm:text-2xl">Performance Analytics</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time projection and work hour distribution for your pay period.
          </p>
        </div>
        {analyticsData[0]?.isSynthetic && (
          <span className="w-fit rounded-full border border-violet-500/35 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            Preview Mode (Realistic Data)
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Earnings Area Chart */}
        <div className="glass-panel border border-white/5 bg-white/[0.015] p-5 rounded-2xl lg:col-span-2 flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cumulative Earnings Projection</p>
              <h3 className="text-lg font-black text-white mt-0.5">₱{analyticsData[analyticsData.length - 1]?.cumulative.toLocaleString() || "0"}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-300/10 px-2.5 py-1 rounded-full">
                Est. rate: ₱250/hr
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumulative" name="Cumulative Earnings" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#earningsGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regular vs. OT Bar Chart */}
        <div className="glass-panel border border-white/5 bg-white/[0.015] p-5 rounded-2xl flex flex-col h-[280px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Worked Hours Split</p>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="regular" name="Regular Hours" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ot" name="Overtime" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radial Punctuality Meter Card */}
        <div className="glass-panel border border-white/5 bg-white/[0.015] p-5 rounded-2xl lg:col-span-3 flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Punctuality Score</p>
            <h3 className="text-2xl font-black text-white mt-1">Shift Reliability</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm">
              Your overall rate of on-time clock ins. Keeping late logs below 5 minutes boosts your score.
            </p>
            <div className="mt-4 flex gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-cyan-400" />
                <span className="text-slate-300">On Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-rose-500" />
                <span className="text-slate-300">Late / Absent</span>
              </div>
            </div>
          </div>

          <div className="relative h-40 w-40 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Foreground glowing track */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="url(#radialGlow)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * punctualityRate) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="radialGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center z-10">
              <span className="block text-3xl font-black text-white">{punctualityRate}%</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-cyan-300 mt-0.5">Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
