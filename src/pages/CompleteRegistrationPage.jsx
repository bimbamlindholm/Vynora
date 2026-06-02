/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import PageTransition from "../components/PageTransition";
import { ArrowLeft, ArrowRight, Building2, ShieldCheck, Sparkles, User, Briefcase, Phone, MapPin, LockKeyhole } from "lucide-react";

export default function CompleteRegistrationPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, profile, completeGoogleRegistration, logout } = useAuth();
  
  const [role, setRole] = useState("personal");
  const [showStatutory, setShowStatutory] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    workspaceCode: "",
    workspaceName: "",
    industry: "",
    teamSize: "1-10",
    companyAddress: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    employeeId: "",
    sss: "",
    philhealth: "",
    pagibig: "",
    tin: "",
    shiftStartTime: "08:00",
    expectedWorkHours: "8",
    payrollPeriod: "semi-monthly",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await logout();
      localStorage.removeItem("vynora_oauth_pending_role");
      localStorage.removeItem("vynora_oauth_pending_workspace");
      addToast("Account creation cancelled. Starting over.", "info");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to cancel registration.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Redirect if they aren't signed into Supabase Auth
    if (!user) {
      navigate("/");
      return;
    }
    
    // Redirect if they already have a complete profile
    if (profile) {
      navigate(profile.role === "admin" ? "/admin-dashboard" : profile.role === "employee" ? "/employee-dashboard" : "/personal-dashboard");
      return;
    }

    const pendingRole = localStorage.getItem("vynora_oauth_pending_role") || "personal";
    const pendingWorkspace = localStorage.getItem("vynora_oauth_pending_workspace") || "";
    
    setRole(pendingRole);
    
    // Attempt to pre-fill name from Google/Apple OAuth user metadata
    const metaFullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
    setForm((current) => ({
      ...current,
      fullName: metaFullName,
      workspaceCode: pendingWorkspace,
    }));
  }, [user, profile, navigate]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      setSubmitting(false);
      return;
    }

    if (role === "employee" && !form.workspaceCode.trim()) {
      setError("Workspace code is required for employees.");
      setSubmitting(false);
      return;
    }

    if (role === "admin" && !form.workspaceName.trim()) {
      setError("Workspace/Company name is required for admins.");
      setSubmitting(false);
      return;
    }

    try {
      const redirectPath = await completeGoogleRegistration({
        role,
        fullName: form.fullName,
        workspaceCode: form.workspaceCode,
        workspaceName: form.workspaceName,
        industry: form.industry,
        teamSize: form.teamSize,
        companyAddress: form.companyAddress,
        phone: form.phone,
        address: form.address,
        department: form.department,
        position: form.position,
        employeeId: form.employeeId,
        sss: form.sss,
        philhealth: form.philhealth,
        pagibig: form.pagibig,
        tin: form.tin,
        shiftStartTime: form.shiftStartTime,
        expectedWorkHours: form.expectedWorkHours,
        payrollPeriod: form.payrollPeriod,
        manualPassword: form.manualPassword,
      });
      addToast("Welcome to Vynora! Your profile has been created successfully.", "success");
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Failed to complete registration.");
      addToast(err.message || "Failed to complete registration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "admin": return "Workspace Owner / Admin";
      case "employee": return "Workspace Employee";
      default: return "Personal Tracker";
    }
  };

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50">
        <div className="galaxy-bg" />
        <div className="register-planet-glow" />
        <div className="noise-overlay" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-[580px]">
            {/* Go Back / Cancel Button */}
            <div className="mb-6 flex justify-start">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Cancel & Start Over
              </button>
            </div>

            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <img
                src="/vynora-logo.png"
                alt="Vynora Logo"
                className="h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(45,212,191,0.38)]"
              />
              <div>
                <span className="block text-2xl font-black tracking-wide text-white">VYNORA</span>
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.34em] text-cyan-300">
                  Track Time. Grow Better.
                </span>
              </div>
            </div>

            {/* Registration Box */}
            <div className="glass-panel rounded-[1.75rem] border-cyan-300/30 p-6 shadow-[0_0_80px_rgba(124,58,237,0.22)] sm:p-8">
              <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-1.5 text-xs font-bold text-cyan-200 w-fit">
                <Sparkles size={13} className="text-violet-300" />
                {getRoleBadge()}
              </div>

              <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Complete Registration</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                You're authenticated! Let's add the final workspace details to configure your dashboard.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">
                  {error}
                </div>
              )}

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {/* Full Name */}
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Your Full Name
                  <span className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter your first and last name"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                      required
                    />
                  </span>
                </label>

                {/* Role Specific Forms */}
                {role === "employee" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Workspace Code
                        <span className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="e.g. TRK-48291"
                            value={form.workspaceCode}
                            onChange={(e) => update("workspaceCode", e.target.value.toUpperCase())}
                            className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] uppercase tracking-[0.12em] placeholder:normal-case placeholder:tracking-normal"
                            required
                          />
                        </span>
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Employee ID / Staff ID (Optional)
                        <span className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="e.g. EMP-2026-001"
                            value={form.employeeId}
                            onChange={(e) => update("employeeId", e.target.value)}
                            className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                          />
                        </span>
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Department (Optional)
                        <span className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="e.g. Engineering"
                            value={form.department}
                            onChange={(e) => update("department", e.target.value)}
                            className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                          />
                        </span>
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Position (Optional)
                        <span className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="e.g. Fullstack Dev"
                            value={form.position}
                            onChange={(e) => update("position", e.target.value)}
                            className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                          />
                        </span>
                      </label>
                    </div>

                    {/* Government Statutory Accordion for Employees */}
                    <div className="mt-2 rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition-all">
                      <button
                        type="button"
                        onClick={() => setShowStatutory(!showStatutory)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <div>
                          <span className="block text-sm font-bold text-slate-200">Statutory & Compliance IDs (Optional)</span>
                          <span className="text-xs text-slate-500 block">Add SSS, PhilHealth, Pag-IBIG, & TIN for payroll</span>
                        </div>
                        <span className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
                          {showStatutory ? "Hide [−]" : "Show [+]"}
                        </span>
                      </button>

                      {showStatutory && (
                        <div className="mt-4 grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-2">
                          <label className="grid gap-1.5 text-xs font-medium text-slate-400">
                            SSS Number
                            <input
                              type="text"
                              placeholder="00-0000000-0"
                              value={form.sss}
                              onChange={(e) => update("sss", e.target.value)}
                              className="h-[46px] w-full rounded-lg border border-white/10 bg-[#0E1726] px-3 text-xs text-white outline-none transition focus:border-cyan-300/40"
                            />
                          </label>

                          <label className="grid gap-1.5 text-xs font-medium text-slate-400">
                            PhilHealth Number
                            <input
                              type="text"
                              placeholder="00-000000000-0"
                              value={form.philhealth}
                              onChange={(e) => update("philhealth", e.target.value)}
                              className="h-[46px] w-full rounded-lg border border-white/10 bg-[#0E1726] px-3 text-xs text-white outline-none transition focus:border-cyan-300/40"
                            />
                          </label>

                          <label className="grid gap-1.5 text-xs font-medium text-slate-400">
                            Pag-IBIG Number
                            <input
                              type="text"
                              placeholder="0000-0000-0000"
                              value={form.pagibig}
                              onChange={(e) => update("pagibig", e.target.value)}
                              className="h-[46px] w-full rounded-lg border border-white/10 bg-[#0E1726] px-3 text-xs text-white outline-none transition focus:border-cyan-300/40"
                            />
                          </label>

                          <label className="grid gap-1.5 text-xs font-medium text-slate-400">
                            TIN Number
                            <input
                              type="text"
                              placeholder="000-000-000-000"
                              value={form.tin}
                              onChange={(e) => update("tin", e.target.value)}
                              className="h-[46px] w-full rounded-lg border border-white/10 bg-[#0E1726] px-3 text-xs text-white outline-none transition focus:border-cyan-300/40"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {role === "admin" && (
                  <>
                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                      Company / Workspace Name
                      <span className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="e.g. Acme Corporation"
                          value={form.workspaceName}
                          onChange={(e) => update("workspaceName", e.target.value)}
                          className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                          required
                        />
                      </span>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Industry (Optional)
                        <input
                          type="text"
                          placeholder="e.g. Tech, Retail"
                          value={form.industry}
                          onChange={(e) => update("industry", e.target.value)}
                          className="h-[52px] w-full rounded-xl border border-white/10 bg-[#0E1726] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Team Size
                        <select
                          value={form.teamSize}
                          onChange={(e) => update("teamSize", e.target.value)}
                          className="h-[52px] w-full rounded-xl border border-white/10 bg-[#0E1726] px-4 text-sm text-white outline-none transition focus:border-cyan-300/60"
                        >
                          <option value="1-10">1 - 10 employees</option>
                          <option value="11-50">11 - 50 employees</option>
                          <option value="51-200">51 - 200 employees</option>
                          <option value="200+">200+ employees</option>
                        </select>
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                      Company Address (Optional)
                      <span className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="e.g. Metro Manila, Philippines"
                          value={form.companyAddress}
                          onChange={(e) => update("companyAddress", e.target.value)}
                          className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                        />
                      </span>
                    </label>
                  </>
                )}

                {/* Common fields (Phone & Address) for Personal or others */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-300">
                    Phone Number (Optional)
                    <span className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="e.g. +639123456789"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                      />
                    </span>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-300">
                    Address (Optional)
                    <span className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="e.g. Quezon City"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                      />
                    </span>
                  </label>
                </div>

                {/* Create Password for Manual Login */}
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Create Password for Manual Login (Optional)
                  <span className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      placeholder="Create a password to allow manual email/password log in"
                      value={form.manualPassword || ""}
                      onChange={(e) => update("manualPassword", e.target.value)}
                      className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035]"
                    />
                  </span>
                  <span className="text-xs text-slate-500">
                    Set a password so you can log in by typing your email and password manually, in addition to using Google or Facebook Login.
                  </span>
                </label>

                {/* Action buttons */}
                <div className="mt-4 grid gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="glow-button group relative flex h-[60px] w-full items-center justify-center gap-4 rounded-xl px-6 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Configuring workspace..." : "Complete Setup & Launch Dashboard"}
                    <span className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-cyan-500 transition group-hover:translate-x-1">
                      <ArrowRight size={19} />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-sm font-bold text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel & Start Over
                  </button>
                </div>
              </form>
            </div>
            
            {/* Trust disclaimer */}
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck size={16} className="text-cyan-400" />
              All data is stored securely in your Supabase project.
            </p>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
