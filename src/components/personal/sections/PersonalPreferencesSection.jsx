import { motion } from "framer-motion";

function PersonalPreferencesSection({
  handleSaveSettings,
  settings,
  setSettings,
  role,
  submitting,
  goals,
  setGoals,
  workspace,
  handleDisconnectWorkspace,
  disconnecting,
  handleConnectWorkspace,
  connectCode,
  setConnectCode,
  profile,
  user,
  handleUpdatePassword,
  manualPassword,
  setManualPassword,
  confirmPassword,
  setConfirmPassword,
  updatingPassword,
  isDeletingAll,
  setIsDeletingAll,
  deleteConfirmText,
  setDeleteConfirmText,
  handleClearAllRecords
}) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl"
    >
      <form onSubmit={handleSaveSettings} className="glass-panel rounded-3xl p-6 sm:p-8 border-white/5 bg-slate-900/30 space-y-6">
        <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-3">Salary settings</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs text-slate-400">
            Salary Model
            <select
              id="payType"
              name="payType"
              value={settings.payType}
              onChange={(e) => setSettings({ ...settings, payType: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-50"
            >
              <option value="hourly">Hourly Rate Basis</option>
              <option value="daily">Flat Daily Rate Basis</option>
            </select>
          </label>

          {settings.payType === "hourly" ? (
            <label className="grid gap-1.5 text-xs text-slate-400">
              Hourly Rate (PHP)
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={settings.hourlyRate}
                onChange={(e) => setSettings({ ...settings, hourlyRate: e.target.value })}
                disabled={role === "employee"}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </label>
          ) : (
            <label className="grid gap-1.5 text-xs text-slate-400">
              Daily Rate (PHP)
              <input
                type="number"
                id="dailyRate"
                name="dailyRate"
                value={settings.dailyRate}
                onChange={(e) => setSettings({ ...settings, dailyRate: e.target.value })}
                disabled={role === "employee"}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </label>
          )}

          <label className="grid gap-1.5 text-xs text-slate-400">
            Expected Hours / Day
            <input
              type="number"
              id="expectedWorkHours"
              name="expectedWorkHours"
              value={settings.expectedWorkHours}
              onChange={(e) => setSettings({ ...settings, expectedWorkHours: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
            />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-400">
            Cutoff Type
            <select
              id="cutoffType"
              name="cutoffType"
              value={settings.cutoffType}
              onChange={(e) => setSettings({ ...settings, cutoffType: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-50"
            >
              <option value="weekly">Weekly Cutoff</option>
              <option value="semi-monthly">Semi-monthly (15-day) Cutoff</option>
              <option value="monthly">Monthly Cutoff</option>
            </select>
          </label>
        </div>

        <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-3 pt-3">Grace Period</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs text-slate-400">
            Grace Period (Minutes)
            <input
              type="number"
              id="graceMinutes"
              name="graceMinutes"
              value={settings.graceMinutes}
              onChange={(e) => setSettings({ ...settings, graceMinutes: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
            />
          </label>
        </div>

        <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-3 pt-3">Multipliers & Premium Rates</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1.5 text-xs text-slate-400">
            Overtime Multiplier
            <input
              type="number"
              step="0.05"
              id="overtimeRate"
              name="overtimeRate"
              value={settings.overtimeRate}
              onChange={(e) => setSettings({ ...settings, overtimeRate: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50 focus:border-emerald-500 outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-400">
            Overtime Increment Block
            <select
              id="overtimeIncrementBlock"
              name="overtimeIncrementBlock"
              value={[1, 15, 30, 60].includes(Number(settings.overtimeIncrementBlock)) ? Number(settings.overtimeIncrementBlock) : "custom"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "custom") {
                  setSettings({ ...settings, overtimeIncrementBlock: 5 }); // default custom to 5 min
                } else {
                  setSettings({ ...settings, overtimeIncrementBlock: Number(val) });
                }
              }}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-50 cursor-pointer"
            >
              <option value={1}>1 Minute (Continuous)</option>
              <option value={15}>15 Minutes (Quarter-hour)</option>
              <option value={30}>30 Minutes (Half-hour)</option>
              <option value={60}>60 Minutes (Hourly)</option>
              <option value="custom">Custom (Minutes)</option>
            </select>
          </label>

          {![1, 15, 30, 60].includes(Number(settings.overtimeIncrementBlock)) && (
            <label className="grid gap-1.5 text-xs text-slate-400">
              Custom Block (Minutes)
              <input
                type="number"
                id="customOvertimeIncrementBlock"
                value={settings.overtimeIncrementBlock}
                onChange={(e) => setSettings({ ...settings, overtimeIncrementBlock: Math.max(1, Number(e.target.value)) })}
                disabled={role === "employee"}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50 focus:border-emerald-500 outline-none"
              />
            </label>
          )}

          <label className="grid gap-1.5 text-xs text-slate-400">
            Regular Holiday Pay (Multiplier)
            <input
              type="number"
              step="0.05"
              id="holidayRegularRate"
              name="holidayRegularRate"
              value={settings.holidayRegularRate}
              onChange={(e) => setSettings({ ...settings, holidayRegularRate: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50 focus:border-emerald-500 outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-400">
            Special Holiday Pay (Multiplier)
            <input
              type="number"
              step="0.05"
              id="holidaySpecialRate"
              name="holidaySpecialRate"
              value={settings.holidaySpecialRate}
              onChange={(e) => setSettings({ ...settings, holidaySpecialRate: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50 focus:border-emerald-500 outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-400">
            Holiday OT Multiplier
            <input
              type="number"
              step="0.05"
              id="holidayOvertimeRate"
              name="holidayOvertimeRate"
              value={settings.holidayOvertimeRate}
              onChange={(e) => setSettings({ ...settings, holidayOvertimeRate: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50 focus:border-emerald-500 outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-400">
            Night Differential Multiplier
            <input
              type="number"
              step="0.01"
              id="nightDiffRate"
              name="nightDiffRate"
              value={settings.nightDiffRate}
              onChange={(e) => setSettings({ ...settings, nightDiffRate: e.target.value })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50 focus:border-emerald-500 outline-none"
              placeholder="e.g. 0.10 for 10% premium rate on hourly rate"
            />
          </label>
        </div>

        <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 space-y-3">
          <label className="grid gap-1.5 text-xs text-slate-400">
            Standard Unpaid Break Duration (Docked Time)
            <select
              id="breakDurationMinutes"
              name="breakDurationMinutes"
              value={settings.breakDurationMinutes}
              onChange={(e) => setSettings({ ...settings, breakDurationMinutes: Number(e.target.value) })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-955 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 disabled:opacity-50"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
              <option value={90}>90 Minutes (1.5 Hours)</option>
              <option value={120}>120 Minutes (2 Hours)</option>
            </select>
          </label>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            * **Unpaid Break Rule**: If you return early from your break, the system will still dock/deduct this standard duration (pay will not resume until the full duration has passed). If you return late, the actual longer break duration will be docked instead.
          </p>
        </div>

        <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-3 pt-3">Monthly Targets & Goals</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs text-slate-400">
            Monthly Earnings Goal (PHP)
            <input
              type="number"
              id="targetEarnings"
              name="targetEarnings"
              value={goals.targetEarnings}
              onChange={(e) => setGoals({ ...goals, targetEarnings: Number(e.target.value) })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
            />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-400">
            Monthly Expected Hours Goal
            <input
              type="number"
              id="targetHours"
              name="targetHours"
              value={goals.targetHours}
              onChange={(e) => setGoals({ ...goals, targetHours: Number(e.target.value) })}
              disabled={role === "employee"}
              className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
            />
          </label>
        </div>

        {role !== "employee" ? (
          <div className="flex justify-stretch pt-3 sm:justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-white transition hover:bg-emerald-400 disabled:opacity-50 sm:w-auto"
            >
              {submitting ? "Saving Preferences..." : "Save Settings & Recalculate"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300 text-center font-bold">
            🔒 These rules are managed by your administrator, {workspace?.adminName || "Workspace Admin"}.
          </div>
        )}
      </form>

      {/* WORKSPACE CONNECTION SECTION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-white/5 bg-slate-900/30 space-y-6">
        <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-3">Workspace Connection</h3>
        
        {role === "employee" && workspace ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Status: Connected to Workspace</p>
                <h4 className="text-sm font-black text-white mt-1">{workspace.name || workspace.workspace_name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>Administrator:</strong> {workspace.adminName || "Workspace Admin"}<br />
                  <strong>Contact:</strong> {workspace.contactNumber || "N/A"}<br />
                  <strong>Company Address:</strong> {workspace.companyAddress || "N/A"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDisconnectWorkspace}
                disabled={disconnecting}
                className="rounded-xl bg-rose-600/15 border border-rose-500/20 px-5 py-2.5 text-xs font-black text-rose-300 transition hover:bg-rose-600/30 active:scale-95 disabled:opacity-50 shrink-0 self-start sm:self-center"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect Workspace"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              * Your account is currently running in **Connected Employee Mode**. Your work schedule, attendance logs, and payroll deductions are managed and tracked directly under this workspace's policies.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your company's workspace invite code provided by your administrator. Connecting will switch your account to an employee account, linking your DTR clock logs and schedules directly with your administrator's workspace.
            </p>
            <form onSubmit={handleConnectWorkspace} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Invite Code (e.g. TRK-12345)"
                value={connectCode}
                onChange={(e) => setConnectCode(e.target.value)}
                className="h-11 flex-1 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white uppercase tracking-[0.12em] placeholder:normal-case placeholder:tracking-normal focus:border-cyan-300 outline-none"
                required
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-black text-white transition active:scale-95 shrink-0"
              >
                Connect to Workspace
              </button>
            </form>
          </div>
        )}
      </div>

      {/* SECURITY & MANUAL LOGIN SECTION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-white/5 bg-slate-900/30 space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-3">Security & Manual Login</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Setting a password enables you to log in manually using your email address (<strong>{profile?.email || user?.email}</strong>) and password in the future, even if you originally registered using Google OAuth.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs text-slate-400">
              New Manual Password
              <input
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-emerald-500 outline-none"
                required
              />
            </label>
            <label className="grid gap-1.5 text-xs text-slate-400">
              Confirm Password
              <input
                type="password"
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-emerald-500 outline-none"
                required
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingPassword || !manualPassword || !confirmPassword}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-black text-white transition active:scale-95 disabled:opacity-50 sm:w-auto cursor-pointer"
            >
              {updatingPassword ? "Setting Password..." : "Set/Update Manual Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone / clear data card */}
      {role !== "employee" && (
        <div className="glass-panel rounded-3xl p-6 border-rose-500/10 bg-rose-500/[0.02] space-y-4">
          <h3 className="text-sm font-extrabold text-rose-300">Danger Zone</h3>
          <p className="text-xs text-slate-400">
            Clearing all records will permanently purge your entire cloud personal clock logs in Supabase. This action is irreversible.
          </p>
          
          {isDeletingAll ? (
            <div className="space-y-3">
              <label className="grid gap-1.5 text-xs text-rose-300 font-semibold">
                Type "DELETE" to confirm complete wipe:
                <input
                  type="text"
                  id="deleteConfirmText"
                  name="deleteConfirmText"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-10 px-4 rounded-xl bg-slate-955 border border-rose-500/20 text-xs text-white focus:border-rose-500 outline-none max-w-xs"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearAllRecords}
                  disabled={submitting || deleteConfirmText !== "DELETE"}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition"
                >
                  Yes, Purge Everything
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeletingAll(false);
                    setDeleteConfirmText("");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
                >
                  Cancel Wiping
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsDeletingAll(true)}
              className="px-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 rounded-xl text-xs font-bold text-rose-300 transition active:scale-95"
            >
              Clear All DTR Logs
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default PersonalPreferencesSection;
