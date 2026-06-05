/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars, react-hooks/exhaustive-deps, react-hooks/preserve-manual-memoization, react-hooks/purity */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Coffee,
  FileText,
  DollarSign,
  Briefcase,
  User,
  X,
  Menu,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabaseClient";
import HelpSystem from "../components/HelpSystem";
import SkeletonLoader from "../components/SkeletonLoader";

// Modular Personal Portal Sub-components
import PersonalHeader from "../components/personal/PersonalHeader";
import PersonalWelcomeCard from "../components/personal/PersonalWelcomeCard";
import PersonalAnalytics from "../components/personal/PersonalAnalytics";
import PersonalRecordsTable from "../components/personal/PersonalRecordsTable";
import PersonalPayrollCalculator from "../components/personal/PersonalPayrollCalculator";
import PersonalScheduler from "../components/personal/PersonalScheduler";
import PersonalProfileCard from "../components/personal/PersonalProfileCard";

// Extracted Modals
import DeleteConfirmationModal from "../components/personal/modals/DeleteConfirmationModal";
import EditShiftModal from "../components/personal/modals/EditShiftModal";
import WeeklyPresetWizardModal from "../components/personal/modals/WeeklyPresetWizardModal";
import EditRecordModal from "../components/personal/modals/EditRecordModal";
import AddRecordModal from "../components/personal/modals/AddRecordModal";
import DiaryRemindersModal from "../components/personal/modals/DiaryRemindersModal";
import CorrectionModal from "../components/employee/modals/CorrectionModal";
import LeaveRequestModal from "../components/employee/modals/LeaveRequestModal";
import EmployeePayslipModal from "../components/employee/modals/EmployeePayslipModal";

// Extracted Page Tab Sections
import PersonalDashboardHomeSection from "../components/personal/sections/PersonalDashboardHomeSection";
import PersonalAttendanceLogSection from "../components/personal/sections/PersonalAttendanceLogSection";
import PersonalCalendarSection from "../components/personal/sections/PersonalCalendarSection";
import PersonalWorkScheduleSection from "../components/personal/sections/PersonalWorkScheduleSection";
import PersonalPayrollRecordsSection from "../components/personal/sections/PersonalPayrollRecordsSection";
import PersonalInsightsSection from "../components/personal/sections/PersonalInsightsSection";
import PersonalPreferencesSection from "../components/personal/sections/PersonalPreferencesSection";
import PersonalInformationSection from "../components/personal/sections/PersonalInformationSection";

// Custom Hooks
import { usePersonalProfile } from "../hooks/personal/usePersonalProfile";
import { usePersonalWorkspaceConnection } from "../hooks/personal/usePersonalWorkspaceConnection";
import { usePersonalPayroll } from "../hooks/personal/usePersonalPayroll";
import { usePersonalSchedules } from "../hooks/personal/usePersonalSchedules";
import { usePersonalAttendance } from "../hooks/personal/usePersonalAttendance";

import {
  safeLocalStorage,
  getLocalDateString,
  VynoraDeveloperLogger,
  isBeforeEndTime,
  formatTime12
} from "../utils/personalDashboardHelpers";

function PersonalDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { profile, user, workspace, logout, role } = useAuth();

  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Settings State (Shared by other hooks)
  const [settings, setSettings] = useState({
    payType: "daily",
    hourlyRate: 100,
    dailyRate: 800,
    expectedWorkHours: 8,
    graceMinutes: 10,
    overtimeRate: 1.25,
    holidayRegularRate: 2.0,
    holidaySpecialRate: 1.3,
    restDayRate: 1.3,
    breakIsPaid: false,
    breakDurationMinutes: 60,
    cutoffType: "monthly",
    overtimeIncrementBlock: 1,
    nightDiffRate: 0.1,
    holidayOvertimeRate: 2.0,
  });

  const [goals, setGoals] = useState({
    targetEarnings: 20000,
    targetHours: 160,
  });

  // Settings sync from workspace
  useEffect(() => {
    if (workspace) {
      const localHolidayOt = safeLocalStorage.getItem(`vynora_personal_holiday_ot_rate_${user?.id}`);
      const localNightDiff = safeLocalStorage.getItem(`vynora_personal_night_diff_rate_${user?.id}`);

      let baseRules = {
        payType: workspace.default_daily_rate > 0 ? "daily" : "hourly",
        hourlyRate: workspace.default_hourly_rate || 100,
        dailyRate: workspace.default_daily_rate || 800,
        expectedWorkHours: workspace.expected_work_hours || 8,
        graceMinutes: workspace.late_grace_minutes || 0,
        overtimeRate: workspace.overtime_rate || 1.25,
        holidayRegularRate: workspace.holiday_regular_rate || 2.0,
        holidaySpecialRate: workspace.holiday_special_rate || 1.3,
        restDayRate: 1.3,
        breakIsPaid: workspace.break_is_paid || false,
        breakDurationMinutes: workspace.break_hours ? Math.round(workspace.break_hours * 60) : 60,
        cutoffType: workspace.payroll_period || "monthly",
        overtimeIncrementBlock: workspace.overtime_threshold_minutes || 1,
        nightDiffRate: localNightDiff ? Number(localNightDiff) : workspace.night_diff_rate || 0.1,
        holidayOvertimeRate: localHolidayOt ? Number(localHolidayOt) : 2.0,
      };

      const presets = Array.isArray(workspace?.custom_rules_presets) ? workspace.custom_rules_presets : [];
      const activePreset = presets.find(
        (p) => p && p.targetEmployeeIds && Array.isArray(p.targetEmployeeIds) && p.targetEmployeeIds.includes(user?.id)
      );
      if (activePreset) {
        const isDaily = activePreset.salaryModel === "daily";
        baseRules = {
          ...baseRules,
          payType: activePreset.salaryModel || "hourly",
          hourlyRate: isDaily ? 0 : Number(activePreset.baseAmount ?? 0),
          dailyRate: isDaily ? Number(activePreset.baseAmount ?? 0) : 0,
          expectedWorkHours: Number(activePreset.expectedWorkHours ?? 8),
          graceMinutes: Number(activePreset.lateGraceMinutes ?? 0),
          overtimeRate: Number(activePreset.overtimeRate ?? 1.25),
          holidayRegularRate: Number(activePreset.holidayRegularRate ?? 2.0),
          holidaySpecialRate: Number(activePreset.holidaySpecialRate ?? 1.3),
          breakIsPaid: Boolean(activePreset.breakIsPaid ?? false),
          breakDurationMinutes: activePreset.breakHours ? Math.round(activePreset.breakHours * 60) : 60,
          cutoffType: activePreset.payrollPeriod || "semi-monthly",
          overtimeIncrementBlock: activePreset.overtimeThresholdMinutes || 30,
        };
      }

      setSettings(baseRules);
      VynoraDeveloperLogger.log("Settings Load", "Successfully loaded workspace configurations and applied overrides.", baseRules);
    }

    if (user?.id) {
      const savedGoals = safeLocalStorage.getItem(`vynora_personal_goals_${user.id}`);
      if (savedGoals) {
        try {
          const parsed = JSON.parse(savedGoals);
          if (parsed && typeof parsed === "object") {
            setGoals({
              targetEarnings: Number(parsed.targetEarnings ?? 20000),
              targetHours: Number(parsed.targetHours ?? 160),
            });
          }
        } catch (e) {
          console.error("Failed to parse goals", e);
        }
      }
    }
  }, [workspace, user?.id]);

  // Tab State
  const [activeTab, setActiveTab] = useState(() => {
    const key = profile?.id ? `vynora_personal_active_tab_${profile.id}` : "vynora_personal_active_tab";
    const savedTab = safeLocalStorage.getItem(key);
    return ["dashboard", "history", "calendar", "schedule", "payroll", "analytics", "settings", "profile"].includes(savedTab)
      ? savedTab
      : "dashboard";
  });

  useEffect(() => {
    if (role === "employee" && activeTab === "analytics") {
      setActiveTab("dashboard");
    }
  }, [role, activeTab]);

  useEffect(() => {
    safeLocalStorage.setItem("vynora_personal_active_tab", activeTab);
    if (profile?.id) {
      safeLocalStorage.setItem(`vynora_personal_active_tab_${profile.id}`, activeTab);
    }
  }, [activeTab, profile]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subscription Tier State
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    return safeLocalStorage.getItem("vynora_mock_subscription_tier") || profile?.subscription_tier || "free";
  });

  useEffect(() => {
    if (profile?.subscription_tier) {
      const savedMock = safeLocalStorage.getItem("vynora_mock_subscription_tier");
      if (!savedMock) {
        setSubscriptionTier(profile.subscription_tier);
      }
    }
  }, [profile]);

  const handleTryPro = () => {
    safeLocalStorage.setItem("vynora_mock_subscription_tier", "pro");
    setSubscriptionTier("pro");
    addToast("Congratulations! You have upgraded to Solo Pro (Demo Mode).", "success");
  };

  const handleSignOut = async () => {
    try {
      await logout();
      addToast("Logged out successfully.", "info");
      navigate("/");
    } catch {
      addToast("Failed to sign out.", "error");
    }
  };

  // 1. Profile hook
  const profileHook = usePersonalProfile();

  // 2. Schedules hook (Dummy/Reroute base schedules first)
  const [tempSchedules, setTempSchedules] = useState([]);
  const schedulesHook = usePersonalSchedules({
    dailyRows: [],
    analyticsSummary: {},
    goals,
    currentTime: new Date(),
    settings,
  });

  // 3. Attendance hook (Instantiates complete DTR events grouping)
  const attendanceHook = usePersonalAttendance({
    settings,
    schedules: schedulesHook.schedules,
    requireScheduleForDate: schedulesHook.requireScheduleForDate,
  });

  // 4. Schedules hook (Actual instantiation with resolved daily rows and timers)
  const schedulesHookActual = usePersonalSchedules({
    dailyRows: attendanceHook.dailyRows,
    analyticsSummary: attendanceHook.analyticsSummary,
    goals,
    currentTime: attendanceHook.currentTime,
    settings,
  });

  // 5. Payroll hook
  const payrollHook = usePersonalPayroll({
    dailyRows: attendanceHook.dailyRows,
    settings,
    profileForm: profileHook.profileForm,
    activeTab,
  });

  // 6. Workspace Connection hook
  const workspaceConnectionHook = usePersonalWorkspaceConnection({
    setActiveTab,
  });

  // Settings save handler that bridges setting state updates
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!supabase || !workspace?.id) return;
    setSubmittingSettings(true);
    try {
      const isDaily = settings.payType === "daily";
      const hRate = isDaily ? 0 : Number(settings.hourlyRate);
      const dRate = isDaily ? Number(settings.dailyRate) : 0;

      const { error } = await supabase
        .from("workspaces")
        .update({
          default_hourly_rate: hRate,
          default_daily_rate: dRate,
          expected_work_hours: Number(settings.expectedWorkHours),
          shift_start_time: workspace.shift_start_time || "09:15",
          late_grace_minutes: Number(settings.graceMinutes),
          overtime_rate: Number(settings.overtimeRate),
          holiday_regular_rate: Number(settings.holidayRegularRate),
          holiday_special_rate: Number(settings.holidaySpecialRate),
          break_is_paid: settings.breakIsPaid,
          break_hours: Number(settings.breakDurationMinutes || 60) / 60,
          payroll_period: settings.cutoffType,
          overtime_threshold_minutes: Number(settings.overtimeIncrementBlock),
          night_diff_rate: Number(settings.nightDiffRate),
        })
        .eq("id", workspace.id);

      if (error) throw error;

      safeLocalStorage.setItem(`vynora_personal_goals_${user?.id}`, JSON.stringify(goals));
      safeLocalStorage.setItem(`vynora_personal_holiday_ot_rate_${user?.id}`, settings.holidayOvertimeRate);
      safeLocalStorage.setItem(`vynora_personal_night_diff_rate_${user?.id}`, settings.nightDiffRate);

      addToast("Personal Settings saved successfully!", "success");
      window.location.reload();
    } catch (err) {
      console.error(err);
      addToast("Failed to save settings: " + (err.message || err), "error");
    } finally {
      setSubmittingSettings(false);
    }
  };

  const renderOnboardingModal = () => {
    const calculateAge = (bday) => {
      if (!bday) return "";
      const birthDate = new Date(bday);
      const today = new Date();
      let computedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        computedAge--;
      }
      return computedAge >= 0 ? computedAge : "";
    };

    const computedOnboardingAge = calculateAge(profileHook.onboardingForm.birthday);

    const handleOnboardingDayCheckboxChange = (dayNum) => {
      const days = [...(profileHook.onboardingForm.preferredWorkingDays || [])];
      if (days.includes(dayNum)) {
        const updated = days.filter((d) => d !== dayNum);
        profileHook.setOnboardingForm((prev) => ({ ...prev, preferredWorkingDays: updated }));
      } else {
        const updated = [...days, dayNum].sort();
        profileHook.setOnboardingForm((prev) => ({ ...prev, preferredWorkingDays: updated }));
      }
    };

    const daysOfWeek = [
      { label: "Mon", value: 1 },
      { label: "Tue", value: 2 },
      { label: "Wed", value: 3 },
      { label: "Thu", value: 4 },
      { label: "Fri", value: 5 },
      { label: "Sat", value: 6 },
      { label: "Sun", value: 0 },
    ];

    return (
      <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-2xl z-[99999] flex items-center justify-center p-4 overflow-y-auto">
        <div className="galaxy-bg opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />

        <div className={`relative w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-[#07111F]/70 backdrop-blur-md shadow-2xl flex flex-col text-center max-h-[95dvh] overflow-y-auto animate-onboarding-modal-enter transition-all ${
          profileHook.onboardingStep >= 4 ? "p-5 sm:p-6 gap-4" : "p-6 sm:p-10 gap-6"
        }`}>
          <div className="flex items-center justify-between gap-2 max-w-xs mx-auto w-full mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    profileHook.onboardingStep === step
                      ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-110"
                      : profileHook.onboardingStep > step
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                      : "bg-white/5 border border-white/10 text-slate-500"
                  }`}
                >
                  {profileHook.onboardingStep > step ? "✓" : step}
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-[2px] mx-0.5 transition-all ${
                      profileHook.onboardingStep > step ? "bg-emerald-500/40" : "bg-white/5"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {profileHook.onboardingError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-300 animate-pulse text-left flex items-start gap-2 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <span className="shrink-0 text-sm">⚠️</span>
              <div>
                <span className="block font-black uppercase text-[10px] tracking-wider text-rose-400">
                  Required Information Missing
                </span>
                <span className="block mt-0.5 leading-relaxed">{profileHook.onboardingError}</span>
              </div>
            </div>
          )}

          {profileHook.onboardingStep === 1 && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                <Sparkles size={11} className="animate-pulse" />
                Launch Vynora
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Welcome to Vynora, <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  {profileHook.onboardingForm.fullName.split(" ")[0] || "User"}!
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Let's set up your premium standalone professional account. Please complete your profile information to
                unlock the full Vynora dashboard.
              </p>

              <div className="space-y-2 border border-white/5 bg-slate-900/10 p-4 rounded-2xl">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">
                  Choose Profile Avatar
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                  {["🚀", "👑", "🎨", "⚡"].map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        profileHook.setOnboardingError("");
                        profileHook.setOnboardingForm((current) => ({ ...current, avatar: av }));
                      }}
                      className={`h-12 w-12 rounded-xl text-xl flex items-center justify-center border transition-all active:scale-90 ${
                        profileHook.onboardingForm.avatar === av
                          ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] scale-105"
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {av}
                    </button>
                  ))}

                  <label
                    className={`h-12 px-3 rounded-xl text-[9px] font-black uppercase flex flex-col items-center justify-center border cursor-pointer transition-all active:scale-95 leading-none gap-1 ${
                      profileHook.onboardingForm.avatar.startsWith("data:image")
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "bg-white/5 border-white/5 hover:border-white/10 text-slate-400"
                    }`}
                  >
                    {profileHook.onboardingForm.avatar.startsWith("data:image") ? "📷 Uploaded" : "📷 Upload"}
                    <input type="file" accept="image/*" onChange={profileHook.handleAvatarFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  profileHook.setOnboardingError("");
                  profileHook.setOnboardingStep(2);
                }}
                className="w-full h-14 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-black text-white rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                Let's Get Started 🚀
              </button>
            </div>
          )}

          {profileHook.onboardingStep === 2 && (
            <div className="space-y-5 text-left animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Identity Details</h3>
                <p className="text-xs text-slate-400">Please provide your full legal name, birthday, and contact details.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs text-slate-400 font-bold sm:col-span-2">
                  Full Name <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={profileHook.onboardingForm.fullName}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, fullName: e.target.value }));
                    }}
                    className={`h-10 px-4 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.fullName.trim()
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
                  Birthday <span className="text-rose-500">*</span>
                  <input
                    type="date"
                    value={profileHook.onboardingForm.birthday}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, birthday: e.target.value }));
                    }}
                    className={`h-10 px-4 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.birthday
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
                  Age (Calculated)
                  <input
                    type="text"
                    disabled
                    value={computedOnboardingAge ? `${computedOnboardingAge} years old` : "Select birthdate"}
                    className="h-10 px-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-500 outline-none cursor-not-allowed"
                  />
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
                  Gender <span className="text-rose-500">*</span>
                  <select
                    value={profileHook.onboardingForm.gender}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, gender: e.target.value }));
                    }}
                    className={`h-10 px-3 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.gender
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
                  Phone Number
                  <input
                    type="tel"
                    placeholder="+63 900 000 0000"
                    value={profileHook.onboardingForm.phone}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, phone: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => profileHook.setOnboardingStep(1)}
                  className="flex-1 h-12 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-black text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  ◀ Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileHook.onboardingForm.fullName.trim()) {
                      profileHook.setOnboardingError("Please enter your full name.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.birthday) {
                      profileHook.setOnboardingError("Please select your birthday.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.gender) {
                      profileHook.setOnboardingError("Please select your gender.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    profileHook.setOnboardingError("");
                    profileHook.setValidationAttempted(false);
                    profileHook.setOnboardingStep(3);
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-black text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  Continue ▶
                </button>
              </div>
            </div>
          )}

          {profileHook.onboardingStep === 3 && (
            <div className="space-y-5 text-left animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Location Details</h3>
                <p className="text-xs text-slate-400">Please provide your home address information for regional compliance logs.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs text-slate-400 font-bold sm:col-span-2">
                  Street Address <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St"
                    value={profileHook.onboardingForm.streetAddress}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, streetAddress: e.target.value }));
                    }}
                    className={`h-10 px-4 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.streetAddress
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
                  City <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Manila"
                    value={profileHook.onboardingForm.city}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, city: e.target.value }));
                    }}
                    className={`h-10 px-4 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.city
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold">
                  Province <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Metro Manila"
                    value={profileHook.onboardingForm.province}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, province: e.target.value }));
                    }}
                    className={`h-10 px-4 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.province
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-xs text-slate-400 font-bold sm:col-span-2">
                  Country
                  <input
                    type="text"
                    placeholder="e.g. Philippines"
                    value={profileHook.onboardingForm.country}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, country: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => profileHook.setOnboardingStep(2)}
                  className="flex-1 h-12 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-black text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  ◀ Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileHook.onboardingForm.streetAddress.trim()) {
                      profileHook.setOnboardingError("Please enter your street address.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.city.trim()) {
                      profileHook.setOnboardingError("Please enter your city.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.province.trim()) {
                      profileHook.setOnboardingError("Please enter your province.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    profileHook.setOnboardingError("");
                    profileHook.setValidationAttempted(false);
                    profileHook.setOnboardingStep(4);
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-black text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  Continue ▶
                </button>
              </div>
            </div>
          )}

          {profileHook.onboardingStep === 4 && (
            <div className="space-y-3.5 text-left animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Professional Setup</h3>
                <p className="text-xs text-slate-400">Select your active job, profession category, and employment setup.</p>
              </div>

              <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                <label className="grid gap-1 text-xs text-slate-400 font-bold sm:col-span-2">
                  Job Title / Role <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={profileHook.onboardingForm.position}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, position: e.target.value }));
                    }}
                    className={`h-10 px-4 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.position.trim()
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Profession Category <span className="text-rose-500">*</span>
                  <select
                    value={profileHook.onboardingForm.professionCategory}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, professionCategory: e.target.value }));
                    }}
                    className={`h-10 px-3 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.professionCategory
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Technology / IT">Technology / IT</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Business">Business</option>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Creative / Design">Creative / Design</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Employment Type <span className="text-rose-500">*</span>
                  <select
                    value={profileHook.onboardingForm.employmentType}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, employmentType: e.target.value }));
                    }}
                    className={`h-10 px-3 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.employmentType
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Student">Student</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Work Arrangement <span className="text-rose-500">*</span>
                  <select
                    value={profileHook.onboardingForm.workArrangement}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, workArrangement: e.target.value }));
                    }}
                    className={`h-10 px-3 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.workArrangement
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  >
                    <option value="">Select Setup</option>
                    <option value="On Site">On Site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Company Name <span className="text-slate-600 font-normal">(Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    value={profileHook.onboardingForm.companyName}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, companyName: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Department <span className="text-slate-600 font-normal">(Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. IT Department"
                    value={profileHook.onboardingForm.department}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, department: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Employee ID <span className="text-slate-600 font-normal">(Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. EMP-001"
                    value={profileHook.onboardingForm.employeeId}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, employeeId: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-1.5">
                <button
                  type="button"
                  onClick={() => profileHook.setOnboardingStep(3)}
                  className="flex-1 h-12 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-black text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  ◀ Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileHook.onboardingForm.position.trim()) {
                      profileHook.setOnboardingError("Please enter your job title / role.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.professionCategory) {
                      profileHook.setOnboardingError("Please select your profession category.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.employmentType) {
                      profileHook.setOnboardingError("Please select your employment type.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    if (!profileHook.onboardingForm.workArrangement) {
                      profileHook.setOnboardingError("Please select your work arrangement setup.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    profileHook.setOnboardingError("");
                    profileHook.setValidationAttempted(false);
                    profileHook.setOnboardingStep(5);
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-black text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  Continue ▶
                </button>
              </div>
            </div>
          )}

          {profileHook.onboardingStep === 5 && (
            <div className="space-y-3.5 text-left animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Goals & Preferences</h3>
                <p className="text-xs text-slate-400">Establish personal targets, core skills, and weekly working days.</p>
              </div>

              <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                <label className="grid gap-1 text-xs text-slate-400 font-bold sm:col-span-2">
                  Career Goal
                  <input
                    type="text"
                    placeholder="e.g. Learn new technologies"
                    value={profileHook.onboardingForm.careerGoal}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, careerGoal: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Skill / Field Focus
                  <input
                    type="text"
                    placeholder="e.g. Javascript, CSS"
                    value={profileHook.onboardingForm.skillFocus}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, skillFocus: e.target.value }))}
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold">
                  Experience Level
                  <select
                    value={profileHook.onboardingForm.experienceLevel}
                    onChange={(e) => profileHook.setOnboardingForm((current) => ({ ...current, experienceLevel: e.target.value }))}
                    className="h-10 px-3 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Professional">Professional</option>
                    <option value="Expert">Expert</option>
                  </select>
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold sm:col-span-2">
                  Weekly Productivity Goal (Hours/Week)
                  <input
                    type="number"
                    value={profileHook.onboardingForm.weeklyProductivityGoal}
                    onChange={(e) =>
                      profileHook.setOnboardingForm((current) => ({
                        ...current,
                        weeklyProductivityGoal: Number(e.target.value) || 0,
                      }))
                    }
                    className="h-10 px-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400 font-bold sm:col-span-2">
                  🔍 Where did you discover Vynora? <span className="text-rose-500">*</span>
                  <select
                    value={profileHook.onboardingForm.discoverySource}
                    onChange={(e) => {
                      profileHook.setOnboardingError("");
                      profileHook.setOnboardingForm((current) => ({ ...current, discoverySource: e.target.value }));
                    }}
                    className={`h-10 px-3 rounded-xl bg-slate-950 border text-xs text-white outline-none focus:border-cyan-500 transition-all ${
                      profileHook.validationAttempted && !profileHook.onboardingForm.discoverySource
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-white/10"
                    }`}
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Friend/Colleague">Friend / Colleague</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Github / Open Source">Github / Open Source</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <div className="sm:col-span-2 space-y-1.5">
                  <span className="block text-xs font-bold text-slate-400">Preferred Working Days</span>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {daysOfWeek.map((day) => {
                      const isChecked = (profileHook.onboardingForm.preferredWorkingDays || []).includes(day.value);
                      return (
                        <label
                          key={day.value}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-[10px] font-bold cursor-pointer transition select-none ${
                            isChecked
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 animate-none"
                              : "border-white/5 bg-slate-950/30 text-slate-500 hover:bg-slate-950/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleOnboardingDayCheckboxChange(day.value)}
                            className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 w-3 h-3"
                          />
                          <span>{day.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1.5">
                <button
                  type="button"
                  disabled={profileHook.updatingProfile}
                  onClick={() => profileHook.setOnboardingStep(4)}
                  className="flex-1 h-12 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-black text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  ◀ Back
                </button>
                <button
                  type="button"
                  disabled={profileHook.updatingProfile}
                  onClick={() => {
                    if (!profileHook.onboardingForm.discoverySource) {
                      profileHook.setOnboardingError("Please select where you discovered Vynora.");
                      profileHook.setValidationAttempted(true);
                      return;
                    }
                    profileHook.setOnboardingError("");
                    profileHook.setValidationAttempted(false);
                    profileHook.handleCompleteOnboarding();
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs font-black text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {profileHook.updatingProfile ? "Launching..." : "Complete Setup & Launch 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <main className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-[#060D17] font-sans text-slate-100 md:flex-row pb-24 md:pb-0">
        <div className="galaxy-bg" />
        <div className="noise-overlay" />

        <div className="hidden md:contents">
          <PersonalHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
            user={user}
            role={role}
            onSignOut={handleSignOut}
          />
        </div>

        <section className="relative z-10 flex w-full min-w-0 flex-1 flex-col pb-28 md:max-h-screen md:overflow-y-auto md:pb-10 custom-scrollbar">
          {payrollHook.releasedPayslipAlert && (
            <div className="flex flex-col gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-base">🎉</span>
                <span className="min-w-0 leading-5">
                  Your payslip for <strong>{payrollHook.releasedPayslipAlert.period}</strong> (Net Pay: PHP{" "}
                  {Number(payrollHook.releasedPayslipAlert.netPay).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  ) has been approved and released by Admin! You can now print/download it.
                </span>
              </div>
              <button
                onClick={() => {
                  payrollHook.setPayrollStart(payrollHook.releasedPayslipAlert.startDate);
                  payrollHook.setPayrollEnd(payrollHook.releasedPayslipAlert.endDate);
                  setActiveTab("payroll");
                }}
                className="self-start text-[10px] font-black uppercase tracking-wider text-emerald-400 underline hover:text-emerald-300 sm:self-auto cursor-pointer"
              >
                Go to Payslip
              </button>
            </div>
          )}

          {attendanceHook.analyticsSummary.incompleteRecords.length > 0 && (
            <div className="flex flex-col gap-3 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs font-semibold text-yellow-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <AlertCircle size={15} className="text-yellow-400 shrink-0" />
                <span className="min-w-0 leading-5">
                  Reminder: You have {attendanceHook.analyticsSummary.incompleteRecords.length} DTR record(s) without a Time Out.
                  Click logs to correct.
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("history");
                  attendanceHook.setHistoryStatusFilter("incomplete");
                }}
                className="self-start text-[10px] font-bold uppercase tracking-wider underline hover:text-white sm:self-auto cursor-pointer"
              >
                Resolve Now
              </button>
            </div>
          )}

          <header className="flex min-w-0 flex-col gap-3 border-b border-white/5 bg-slate-950/20 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                {role === "employee" ? "EMPLOYEE ACCOUNT" : "PERSONAL PORTAL"}
              </span>
              <h1 className="text-xl font-black text-white leading-tight capitalize">{activeTab.replace("_", " ")}</h1>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end sm:gap-4">
              <span className="hidden sm:inline text-xs text-slate-400">
                Shift: <span className="font-bold text-slate-200">{settings.shiftStartTime || "None"}</span> (
                {settings.graceMinutes}m grace)
              </span>
              {attendanceHook.isOnline ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-[10px] font-bold uppercase text-emerald-300 border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 rounded-full">
                    Cloud Synced
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  <span
                    className="text-[10px] font-bold uppercase text-amber-300 border border-amber-400/20 bg-amber-400/5 px-2.5 py-1 rounded-full"
                    title="All operations are cached locally and will sync once internet returns."
                  >
                    Offline Mode
                  </span>
                </>
              )}
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1180px] min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <PersonalDashboardHomeSection
                  currentTime={attendanceHook.currentTime}
                  todayRow={attendanceHook.todayRow}
                  dtrButtonsConfig={attendanceHook.dtrButtonsConfig}
                  submitting={attendanceHook.submitting}
                  handleClockAction={attendanceHook.handleClockAction}
                  role={role}
                  analyticsSummary={attendanceHook.analyticsSummary}
                  goals={goals}
                  goalsProgress={schedulesHookActual.goalsProgress}
                  dailyRows={attendanceHook.dailyRows}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "history" && (
                <PersonalAttendanceLogSection
                  filteredHistoryRows={attendanceHook.filteredHistoryRows}
                  historyFilter={attendanceHook.historyFilter}
                  setHistoryFilter={attendanceHook.setHistoryFilter}
                  historyStart={attendanceHook.historyStart}
                  setHistoryStart={attendanceHook.setHistoryStart}
                  historyEnd={attendanceHook.historyEnd}
                  setHistoryEnd={attendanceHook.setHistoryEnd}
                  historySearch={attendanceHook.historySearch}
                  setHistorySearch={attendanceHook.setHistorySearch}
                  historyStatusFilter={attendanceHook.historyStatusFilter}
                  setHistoryStatusFilter={attendanceHook.setHistoryStatusFilter}
                  role={role}
                  setShowCorrectionModal={attendanceHook.setShowCorrectionModal}
                  setShowAddModal={attendanceHook.setShowAddModal}
                  handleExportCsv={attendanceHook.handleExportCsv}
                  handlePrintDtr={attendanceHook.handlePrintDtr}
                  openEditRow={attendanceHook.openEditRow}
                  handleDeleteRow={attendanceHook.handleDeleteRow}
                  setShowLeaveModal={attendanceHook.setShowLeaveModal}
                />
              )}

              {activeTab === "calendar" && (
                <PersonalCalendarSection
                  calendarDate={schedulesHookActual.calendarDate}
                  setCalendarDate={schedulesHookActual.setCalendarDate}
                  calendarDays={schedulesHookActual.calendarDays}
                  currentTime={attendanceHook.currentTime}
                  openEditRow={attendanceHook.openEditRow}
                  diaryNotes={attendanceHook.diaryNotes}
                  setSelectedDiaryDate={attendanceHook.setSelectedDiaryDate}
                  setDiaryText={attendanceHook.setDiaryText}
                  setShowDiaryModal={attendanceHook.setShowDiaryModal}
                  role={role}
                />
              )}

              {activeTab === "analytics" && (
                <PersonalInsightsSection
                  chartPath={schedulesHookActual.chartPath}
                  earningsPath={schedulesHookActual.earningsPath}
                  analyticsSummary={attendanceHook.analyticsSummary}
                />
              )}

              {activeTab === "settings" && (
                <PersonalPreferencesSection
                  handleSaveSettings={handleSaveSettings}
                  settings={settings}
                  setSettings={setSettings}
                  role={role}
                  submitting={submittingSettings || attendanceHook.submitting}
                  goals={goals}
                  setGoals={setGoals}
                  workspace={workspace}
                  handleDisconnectWorkspace={workspaceConnectionHook.handleDisconnectWorkspace}
                  disconnecting={workspaceConnectionHook.disconnecting}
                  handleConnectWorkspace={workspaceConnectionHook.handleConnectWorkspace}
                  connectCode={workspaceConnectionHook.connectCode}
                  setConnectCode={workspaceConnectionHook.setConnectCode}
                  profile={profile}
                  user={user}
                  handleUpdatePassword={profileHook.handleUpdatePassword}
                  manualPassword={profileHook.manualPassword}
                  setManualPassword={profileHook.setManualPassword}
                  confirmPassword={profileHook.confirmPassword}
                  setConfirmPassword={profileHook.setConfirmPassword}
                  updatingPassword={profileHook.updatingPassword}
                  isDeletingAll={attendanceHook.isDeletingAll}
                  setIsDeletingAll={attendanceHook.setIsDeletingAll}
                  deleteConfirmText={attendanceHook.deleteConfirmText}
                  setDeleteConfirmText={attendanceHook.setDeleteConfirmText}
                  handleClearAllRecords={attendanceHook.handleClearAllRecords}
                />
              )}

              {activeTab === "profile" && (
                <PersonalInformationSection
                  profile={profile}
                  user={user}
                  profileForm={profileHook.profileForm}
                  setProfileForm={profileHook.setProfileForm}
                  updatingProfile={profileHook.updatingProfile}
                  handleSaveProfile={profileHook.handleSaveProfile}
                  handleProfilePhotoChange={profileHook.handleProfilePhotoChange}
                  handleRemoveProfilePhoto={profileHook.handleRemoveProfilePhoto}
                  setActiveTab={setActiveTab}
                  subscriptionTier={subscriptionTier}
                  setSubscriptionTier={setSubscriptionTier}
                />
              )}

              {activeTab === "schedule" && (
                <PersonalWorkScheduleSection
                  role={role}
                  setShowPresetModal={schedulesHookActual.setShowPresetModal}
                  setCurrentWeekOffset={schedulesHookActual.setCurrentWeekOffset}
                  weekDaysList={schedulesHookActual.weekDaysList}
                  schedules={schedulesHookActual.schedules}
                  currentTime={attendanceHook.currentTime}
                  settings={settings}
                  handleDeleteShift={schedulesHookActual.handleDeleteShift}
                  setSelectedScheduleDate={schedulesHookActual.setSelectedScheduleDate}
                  setScheduleForm={schedulesHookActual.setScheduleForm}
                  setShowShiftModal={schedulesHookActual.setShowShiftModal}
                />
              )}

              {activeTab === "payroll" && (
                <PersonalPayrollRecordsSection
                  subscriptionTier={subscriptionTier}
                  role={role}
                  handleTryPro={handleTryPro}
                  setActiveTab={setActiveTab}
                  workspace={workspace}
                  profile={profile}
                  setSelectedPayslip={setSelectedPayslip}
                  payrollStart={payrollHook.payrollStart}
                  setPayrollStart={payrollHook.setPayrollStart}
                  payrollEnd={payrollHook.payrollEnd}
                  setPayrollEnd={payrollHook.setPayrollEnd}
                  payrollSummary={payrollHook.payrollSummary}
                  settings={settings}
                  payrollDeductions={payrollHook.payrollDeductions}
                  addPayrollDeduction={payrollHook.addPayrollDeduction}
                  removePayrollDeduction={payrollHook.removePayrollDeduction}
                  updatePayrollDeduction={payrollHook.updatePayrollDeduction}
                  payrollAdditions={payrollHook.payrollAdditions}
                  addPayrollAddition={payrollHook.addPayrollAddition}
                  removePayrollAddition={payrollHook.removePayrollAddition}
                  updatePayrollAddition={payrollHook.updatePayrollAddition}
                  handlePrintPayslip={payrollHook.handlePrintPayslip}
                  payslipStatus={payrollHook.payslipStatus}
                  loadingPayslipStatus={payrollHook.loadingPayslipStatus}
                  handleRequestPayslip={payrollHook.handleRequestPayslip}
                  deductionsStart={payrollHook.deductionsStart}
                  setDeductionsStart={payrollHook.setDeductionsStart}
                  deductionsEnd={payrollHook.deductionsEnd}
                  setDeductionsEnd={payrollHook.setDeductionsEnd}
                  processedPayslips={payrollHook.processedPayslips}
                  handleApplyDeductionClick={payrollHook.handleApplyDeductionClick}
                  handleClearProcessedHistory={payrollHook.handleClearProcessedHistory}
                  handlePrintHistoryPayslip={payrollHook.handlePrintHistoryPayslip}
                />
              )}
            </AnimatePresence>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
          {mobileMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close mobile menu overlay"
                className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                className="fixed bottom-[86px] left-3 right-3 rounded-[28px] border border-white/10 bg-[#08111f]/95 p-3 shadow-2xl backdrop-blur-2xl"
              >
                <div className="mb-2 flex items-center justify-between px-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400">More</p>
                    <p className="text-xs font-semibold text-slate-400">Personal tools</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 cursor-pointer"
                    aria-label="Close more menu"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "schedule", label: "Schedule", icon: Briefcase },
                    { id: "analytics", label: "Insights", icon: TrendingUp },
                    { id: "settings", label: "Settings", icon: Settings },
                    { id: "profile", label: "Profile", icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all cursor-pointer ${
                          isActive
                            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                            : "border-white/10 bg-white/[0.04] text-slate-300"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            isActive ? "bg-emerald-400/15" : "bg-white/5"
                          }`}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-black">{item.label}</span>
                          <span className="block text-[10px] text-slate-500">Open page</span>
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-3 text-xs font-black text-rose-300 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            </>
          )}

          <nav className="mx-3 mb-3 rounded-[28px] border border-white/10 bg-[#08111f]/95 px-2 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: "dashboard", label: "Home", icon: Clock },
                { id: "history", label: "Logs", icon: FileText },
                { id: "calendar", label: "Calendar", icon: Calendar },
                { id: "payroll", label: "Payroll", icon: DollarSign },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.14)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.7 : 2.2} />
                    <span className="max-w-full truncate text-[10px] font-black">{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all cursor-pointer ${
                  mobileMenuOpen || ["schedule", "analytics", "settings", "profile"].includes(activeTab)
                    ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.14)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Menu size={19} />
                <span className="max-w-full truncate text-[10px] font-black">More</span>
              </button>
            </div>
          </nav>
        </div>

        <EditRecordModal
          isOpen={attendanceHook.showEditModal && attendanceHook.selectedDateRow}
          onClose={() => attendanceHook.setShowEditModal(false)}
          editForm={attendanceHook.editForm}
          setEditForm={attendanceHook.setEditForm}
          onSubmit={attendanceHook.handleSaveEdit}
          submitting={attendanceHook.submitting}
        />

        {attendanceHook.showCorrectionModal && (
          <CorrectionModal
            employee={profile}
            onClose={() => attendanceHook.setShowCorrectionModal(false)}
            onSaved={() => {
              attendanceHook.fetchRecords();
            }}
          />
        )}

        {attendanceHook.showLeaveModal && (
          <LeaveRequestModal
            onClose={() => attendanceHook.setShowLeaveModal(false)}
            onSaved={() => {}}
          />
        )}

        <AddRecordModal
          isOpen={attendanceHook.showAddModal}
          onClose={() => attendanceHook.setShowAddModal(false)}
          addForm={attendanceHook.addForm}
          setAddForm={attendanceHook.setAddForm}
          onSubmit={attendanceHook.handleAddRecord}
          submitting={attendanceHook.submitting}
        />

        <DiaryRemindersModal
          isOpen={attendanceHook.showDiaryModal}
          onClose={() => attendanceHook.setShowDiaryModal(false)}
          selectedDate={attendanceHook.selectedDiaryDate}
          diaryText={attendanceHook.diaryText}
          setDiaryText={attendanceHook.setDiaryText}
          onSave={attendanceHook.handleSaveDiaryNote}
        />

        <DeleteConfirmationModal
          isOpen={!!attendanceHook.confirmDeleteId}
          confirmDeleteId={attendanceHook.confirmDeleteId}
          onClose={() => attendanceHook.setConfirmDeleteId(null)}
          onConfirm={attendanceHook.handleDeleteRow}
        />

        <EditShiftModal
          isOpen={schedulesHookActual.showShiftModal}
          onClose={() => schedulesHookActual.setShowShiftModal(false)}
          selectedScheduleDate={schedulesHookActual.selectedScheduleDate}
          scheduleForm={schedulesHookActual.scheduleForm}
          setScheduleForm={schedulesHookActual.setScheduleForm}
          onSubmit={schedulesHookActual.handleSaveShift}
          submitting={attendanceHook.submitting}
        />

        <WeeklyPresetWizardModal
          isOpen={schedulesHookActual.showPresetModal}
          onClose={() => schedulesHookActual.setShowPresetModal(false)}
          weekDaysList={schedulesHookActual.weekDaysList}
          presetForm={schedulesHookActual.presetForm}
          setPresetForm={schedulesHookActual.setPresetForm}
          onSubmit={schedulesHookActual.handleGeneratePreset}
          submitting={attendanceHook.submitting}
        />

        <AnimatePresence>
          {workspaceConnectionHook.showConnectModal && (
            <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel w-full max-w-lg rounded-3xl border-rose-500/10 bg-[#07111F]/95 p-5 sm:p-7 shadow-2xl space-y-5"
              >
                <div className="text-center space-y-2">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-xl animate-pulse">
                    ⚠
                  </span>
                  <h3 className="text-lg font-black text-white">Serious Confirmation Warning</h3>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                  <p className="font-bold text-rose-300">
                    Warning: Connecting to this workspace will make your account an employee account under this administrator.
                  </p>
                  <p>
                    Your attendance records, work schedule, payroll-related records, and activity may become visible to your
                    admin.
                  </p>
                  <p>
                    Some features will be restricted or controlled by your admin. Your private calendar notes/diary should
                    remain personal unless explicitly shared.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 text-center">
                    Type exactly <span className="text-rose-300 font-extrabold font-mono">I Agree</span> to confirm connection:
                  </label>
                  <input
                    type="text"
                    value={workspaceConnectionHook.agreeText}
                    onChange={(e) => workspaceConnectionHook.setAgreeText(e.target.value)}
                    placeholder="Type I Agree"
                    className="h-11 w-full rounded-xl bg-slate-950 border border-white/10 text-center text-xs text-white outline-none focus:border-rose-500 transition font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      workspaceConnectionHook.setShowConnectModal(false);
                      workspaceConnectionHook.setAgreeText("");
                    }}
                    className="h-11 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] cursor-pointer"
                  >
                    I Disagree (Cancel)
                  </button>
                  <button
                    type="button"
                    onClick={workspaceConnectionHook.handleConfirmConnect}
                    disabled={
                      workspaceConnectionHook.connecting ||
                      workspaceConnectionHook.agreeText.trim().toLowerCase().replace(/\s+/g, " ") !== "i agree"
                    }
                    className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {workspaceConnectionHook.connecting ? "Connecting..." : "I Agree (Connect)"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {workspaceConnectionHook.showDisconnectModal && (
            <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel w-full max-w-lg rounded-3xl border-rose-500/10 bg-[#07111F]/95 p-5 sm:p-7 shadow-2xl space-y-5"
              >
                <div className="text-center space-y-2">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-xl animate-pulse">
                    ⚠️
                  </span>
                  <h3 className="text-lg font-black text-white">Workspace Disconnection Warning</h3>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                  <p className="font-bold text-rose-300">
                    Warning: Disconnecting from this workspace will revert your account back to a private personal account.
                  </p>
                  <p>
                    You will instantly lose access to the company's schedules, custom holidays, DTR tracking dashboards,
                    announcements, and payslips.
                  </p>
                  <p>Ensure you have communicated this action with your workspace administrator or manager before proceeding.</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 text-center">
                    Type exactly <span className="text-rose-300 font-extrabold font-mono">I Disconnect</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={workspaceConnectionHook.disconnectAgreeText}
                    onChange={(e) => workspaceConnectionHook.setDisconnectAgreeText(e.target.value)}
                    placeholder="Type I Disconnect"
                    className="h-11 w-full rounded-xl bg-slate-950 border border-white/10 text-center text-xs text-white outline-none focus:border-rose-500 transition font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      workspaceConnectionHook.setShowDisconnectModal(false);
                      workspaceConnectionHook.setDisconnectAgreeText("");
                    }}
                    className="h-11 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={workspaceConnectionHook.handleConfirmDisconnect}
                    disabled={
                      workspaceConnectionHook.disconnecting ||
                      workspaceConnectionHook.disconnectAgreeText.trim().toLowerCase().replace(/\s+/g, " ") !== "i disconnect"
                    }
                    className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {workspaceConnectionHook.disconnecting ? "Disconnecting..." : "Confirm Disconnect"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {attendanceHook.ephemeralSelfie && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-cyan-400/30 bg-[#0B1424]/95 p-6 shadow-[0_0_40px_rgba(6,182,212,0.35)] text-center flex flex-col items-center">
              <div className="absolute top-3.5 right-4 text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                EPHEMERAL PROOF
              </div>

              <h4 className="text-sm font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                ⚡ {attendanceHook.ephemeralActionName} SUCCESSFUL
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                I-download ang watermarked proof. Ito ay mabubura sa memorya pagkatapos ng 10 segundo!
              </p>

              <div className="relative mt-4 h-60 w-60 rounded-2xl overflow-hidden border border-cyan-400/20 shadow-2xl bg-slate-950">
                <img
                  src={attendanceHook.ephemeralSelfie}
                  alt="Biometric DTR Watermarked Selfie"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="w-full mt-5 text-left">
                <div className="flex justify-between items-center text-[10px] font-black text-cyan-400/90 mb-1.5 uppercase tracking-wider">
                  <span>Auto-Purging in {attendanceHook.ephemeralSelfieCountdown}s...</span>
                  <span>{attendanceHook.ephemeralSelfieCountdown * 10}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-1000 shadow-[0_0_10px_#22d3ee]"
                    style={{ width: `${attendanceHook.ephemeralSelfieCountdown * 10}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = attendanceHook.ephemeralSelfie;
                  link.download = `Vynora_DTR_Proof_${attendanceHook.ephemeralActionName.replace(
                    " ",
                    "_"
                  )}_${new Date().toISOString().slice(0, 10)}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  addToast("Watermarked DTR Proof downloaded successfully!", "success");
                }}
                className="mt-5 w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-black text-white rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                📥 Download Watermarked Photo
              </button>

              <button
                onClick={() => attendanceHook.setEphemeralSelfie(null)}
                className="mt-3 text-[10px] font-black text-slate-500 hover:text-slate-400 uppercase tracking-widest cursor-pointer"
              >
                Close & Skip
              </button>
            </div>
          </div>
        )}

        {selectedPayslip && (
          <EmployeePayslipModal
            payslip={selectedPayslip}
            profile={profile}
            workspace={workspace}
            onClose={() => setSelectedPayslip(null)}
          />
        )}

        {profileHook.showOnboarding && renderOnboardingModal()}

        <HelpSystem role="personal" />
      </main>
    </PageTransition>
  );
}

export default PersonalDashboardPage;
