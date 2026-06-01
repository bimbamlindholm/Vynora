/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars, react-hooks/exhaustive-deps, react-hooks/preserve-manual-memoization */
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Play,
  Pause,
  StopCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  Info,
  DollarSign,
  Briefcase,
  HelpCircle,
  Bell,
  X,
  Menu,
  Target,
  Camera,
  Save,
  User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabaseClient";
import { fetchMySchedules, saveSchedule, deleteSchedule } from "../utils/supabaseSchedule";
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
import { StatBlock } from "../components/personal/personalComponents";

// Extracted Modals
import DeleteConfirmationModal from "../components/personal/modals/DeleteConfirmationModal";
import EditShiftModal from "../components/personal/modals/EditShiftModal";
import WeeklyPresetWizardModal from "../components/personal/modals/WeeklyPresetWizardModal";
import EditRecordModal from "../components/personal/modals/EditRecordModal";
import AddRecordModal from "../components/personal/modals/AddRecordModal";
import DiaryRemindersModal from "../components/personal/modals/DiaryRemindersModal";
import CorrectionModal from "../components/employee/modals/CorrectionModal";
import LeaveRequestModal from "../components/employee/modals/LeaveRequestModal";
import CameraBiometricModal from "../components/employee/modals/CameraBiometricModal";
import FaceRegistrationModal from "../components/employee/modals/FaceRegistrationModal";
import PayslipsCard from "../components/employee/PayslipsCard";
import EmployeePayslipModal from "../components/employee/modals/EmployeePayslipModal";

// Helper for formatting time (HH:MM AM/PM)
function formatTime12(timeStr) {
  if (!timeStr) return "-";
  try {
    let h, m;
    // Check if it's a full ISO timestamp or date-time string
    if (timeStr.includes("T") || (timeStr.includes("-") && timeStr.includes(":"))) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        h = date.getHours();
        m = date.getMinutes();
      }
    }
    
    // Fallback to simple HH:MM splitting
    if (h === undefined || m === undefined) {
      const [hStr, mStr] = timeStr.split(":");
      h = parseInt(hStr);
      m = parseInt(mStr);
    }
    
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  } catch {
    return timeStr;
  }
}

// Helper to get YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const local = new Date(date);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to get local time in HH:MM format for time inputs
function getLocalTime24(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Helper to convert local date and 24h time selection cleanly to a UTC ISO string
function toUTCISO(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return isNaN(localDate.getTime()) ? "" : localDate.toISOString();
  } catch {
    return "";
  }
}

// Helper to determine if current time is before a scheduled shift end time (handles HH:MM 24h and AM/PM formats)
function isBeforeEndTime(endTimeStr) {
  if (!endTimeStr) return false;
  try {
    const now = new Date();
    let hours = 0;
    let minutes = 0;
    
    const cleanStr = endTimeStr.trim().toLowerCase();
    const isPm = cleanStr.includes("pm");
    const isAm = cleanStr.includes("am");
    
    const digitsOnly = cleanStr.replace(/am|pm/g, "").trim();
    const timeParts = digitsOnly.split(":");
    
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      
      if (isPm && hours < 12) {
        hours += 12;
      } else if (isAm && hours === 12) {
        hours = 0;
      }
    } else {
      hours = parseInt(digitsOnly, 10);
      if (isNaN(hours)) return false;
    }
    
    if (isNaN(hours) || isNaN(minutes)) return false;
    
    const shiftEndToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return now.getTime() < shiftEndToday.getTime();
  } catch (e) {
    console.error("Failed to parse shift end time:", e);
    return false;
  }
}


const PERSONAL_TABS = new Set([
  "dashboard",
  "history",
  "calendar",
  "schedule",
  "payroll",
  "analytics",
  "settings",
  "profile",
]);

function getSavedPersonalTab() {
  if (typeof window === "undefined") return "dashboard";

  const savedTab = window.localStorage.getItem("trackly_personal_active_tab");
  return PERSONAL_TABS.has(savedTab) ? savedTab : "dashboard";
}

function PersonalDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { profile, user, workspace, logout, updateProfile, role, permissions, refreshSessionData, connectPersonalAccountToWorkspace, disconnectFromWorkspace } = useAuth();

  const [modal, setModal] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [ephemeralSelfie, setEphemeralSelfie] = useState(null);
  const [ephemeralSelfieCountdown, setEphemeralSelfieCountdown] = useState(10);
  const [ephemeralActionName, setEphemeralActionName] = useState("");

  // Countdown timer for automatic deletion of photo from memory
  useEffect(() => {
    if (!ephemeralSelfie) return;

    setEphemeralSelfieCountdown(10);
    const interval = setInterval(() => {
      setEphemeralSelfieCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEphemeralSelfie(null); // Purge image from state completely!
          addToast("DTR photo safely purged from memory to save server storage.", "info");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ephemeralSelfie]);

  const handleRegisterFace = async (base64Photo) => {
    try {
      localStorage.setItem(`trackly_local_face_photo_${profile.id}`, base64Photo);
      await updateProfile({ ...profile, face_photo: base64Photo });
      await refreshSessionData();
      addToast("AI Face Profile registered successfully!", "success");
      setModal(null);
    } catch (err) {
      console.warn("Failed to sync face profile, local storage fallback:", err);
      addToast("Face registered locally (Offline fallback)!", "success");
      setModal(null);
    }
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState(getSavedPersonalTab); // remembers selected page after refresh/tab switch
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (role === "employee" && activeTab === "analytics") {
      setActiveTab("dashboard");
    }
  }, [role, activeTab]);

  // Interactive Demo Subscription State
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    return localStorage.getItem("trackly_mock_subscription_tier") || profile?.subscription_tier || "free";
  });

  useEffect(() => {
    if (profile?.subscription_tier) {
      const savedMock = localStorage.getItem("trackly_mock_subscription_tier");
      if (!savedMock) {
        setSubscriptionTier(profile.subscription_tier);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (PERSONAL_TABS.has(activeTab)) {
      window.localStorage.setItem("trackly_personal_active_tab", activeTab);
    }
  }, [activeTab]);

  // Profile form states
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    employeeId: "",
    sss: "",
    philhealth: "",
    pagibig: "",
    tin: "",
    facePhoto: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Hydrate profile form when profile details are available
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        position: profile.position || "",
        department: profile.department || "",
        employeeId: profile.employee_id || "",
        sss: profile.sss || "",
        philhealth: profile.philhealth || "",
        pagibig: profile.pagibig || "",
        tin: profile.tin || "",
        facePhoto: profile.face_photo || "",
      });
    }
  }, [profile]);

  // Database records
  const [rawRecords, setRawRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Settings State (Initialized with workspace values or defaults)
  const [settings, setSettings] = useState({
    payType: "daily", // hourly, daily
    hourlyRate: 100,
    dailyRate: 800,
    expectedWorkHours: 8,
    graceMinutes: 10,
    overtimeRate: 1.25,
    holidayRegularRate: 2.0,
    holidaySpecialRate: 1.3,
    restDayRate: 1.3,
    breakIsPaid: false, // Paid break vs unpaid default
    breakDurationMinutes: 60, // Standard unpaid break duration in minutes
    cutoffType: "monthly", // weekly, semi-monthly, monthly
    overtimeIncrementBlock: 1, // Overtime block setting
  });

  // Goal Preferences state (stored in localStorage)
  const [goals, setGoals] = useState({
    targetEarnings: 20000,
    targetHours: 160,
  });

  // Modals & Temp states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateRow, setSelectedDateRow] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    timeIn: "",
    timeOut: "",
    breaks: [], // Array of { breakIn, breakOut }
    notes: "",
    workType: "regular", // regular, rest_day, regular_holiday, special_holiday
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [addForm, setAddForm] = useState({
    date: getLocalDateString(),
    timeIn: "09:00",
    timeOut: "",
    hasBreak: true,
    breaks: [{ breakIn: "12:00", breakOut: "13:00" }],
    notes: "",
    workType: "regular",
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Personal Diary / Reminders States
  const [diaryNotes, setDiaryNotes] = useState({});
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [selectedDiaryDate, setSelectedDiaryDate] = useState("");
  const [diaryText, setDiaryText] = useState("");

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`trackly_personal_diary_${user.id}`);
      if (saved) {
        try {
          setDiaryNotes(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse diary notes", e);
        }
      }
    }
  }, [user?.id]);

  const handleSaveDiaryNote = (dateStr, text) => {
    if (!user?.id) return;
    const updated = { ...diaryNotes };
    if (!text || text.trim() === "") {
      delete updated[dateStr];
    } else {
      updated[dateStr] = text;
    }
    setDiaryNotes(updated);
    localStorage.setItem(`trackly_personal_diary_${user.id}`, JSON.stringify(updated));
    addToast("Diary entry saved successfully!", "success");
    setShowDiaryModal(false);
  };

  const handleConnectWorkspace = async (e) => {
    if (e) e.preventDefault();
    if (!connectCode.trim()) {
      addToast("Please enter a workspace code.", "warning");
      return;
    }
    setAgreeText("");
    setShowConnectModal(true);
  };

  const handleConfirmConnect = async () => {
    if (agreeText.trim().toLowerCase().replace(/\s+/g, " ") !== "i agree") {
      addToast("Please type 'I Agree' to confirm.", "warning");
      return;
    }
    setConnecting(true);
    try {
      const res = await connectPersonalAccountToWorkspace(connectCode, {
        fullName: profile?.full_name || "",
        email: profile?.email || "",
      });
      addToast(`Successfully connected to ${res.workspace.workspace_name}!`, "success");
      setShowConnectModal(false);
      setConnectCode("");
      setAgreeText("");
      setActiveTab("dashboard");
    } catch (err) {
      addToast(err.message || "Failed to connect to workspace.", "error");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectWorkspace = () => {
    setDisconnectAgreeText("");
    setShowDisconnectModal(true);
  };

  const handleConfirmDisconnect = async () => {
    if (disconnectAgreeText.trim().toLowerCase().replace(/\s+/g, " ") !== "i disconnect") {
      addToast("Please type 'I Disconnect' to confirm.", "warning");
      return;
    }
    setDisconnecting(true);
    try {
      await disconnectFromWorkspace();
      addToast("Successfully disconnected from workspace!", "success");
      setShowDisconnectModal(false);
      setDisconnectAgreeText("");
      setActiveTab("dashboard");
    } catch (err) {
      addToast(err.message || "Failed to disconnect.", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  // Schedule Planner States
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [connectCode, setConnectCode] = useState("");
  const [agreeText, setAgreeText] = useState("");
  const [disconnectAgreeText, setDisconnectAgreeText] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    shiftStart: "09:00",
    shiftEnd: "18:00",
    label: "Day Shift",
    color: "#10b981", // emerald
    notes: "",
    workType: "regular",
  });
  const [presetForm, setPresetForm] = useState({
    workDays: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false }, // Mon-Fri true
    shiftStart: "09:00",
    shiftEnd: "18:00",
    label: "Day Shift",
  });

  // Payroll Records & Payslip Builder States
  const [payrollStart, setPayrollStart] = useState("");
  const [payrollEnd, setPayrollEnd] = useState("");
  const [payrollDeductions, setPayrollDeductions] = useState([
    { id: "ded_1", name: "SSS Loan", amount: "" },
    { id: "ded_2", name: "Cash Advance", amount: "" }
  ]);

  const addPayrollDeduction = () => {
    setPayrollDeductions([
      ...payrollDeductions,
      { id: `ded_${Date.now()}`, name: "", amount: "" }
    ]);
  };

  const removePayrollDeduction = (id) => {
    setPayrollDeductions(payrollDeductions.filter(d => d.id !== id));
  };

  const updatePayrollDeduction = (id, field, value) => {
    setPayrollDeductions(
      payrollDeductions.map(d => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const [payslipStatus, setPayslipStatus] = useState("none"); // "none", "requested", "approved", "released"
  const [loadingPayslipStatus, setLoadingPayslipStatus] = useState(false);
  const [releasedPayslipAlert, setReleasedPayslipAlert] = useState(null);

  // Helper to format minutes to hours
  const formatMinutesToHours = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  };

  // Check individual employee payslip status when cutoff changes
  useEffect(() => {
    let active = true;
    const checkPayslipStatus = async () => {
      if (!profile?.id || !payrollStart || !payrollEnd || !supabase) return;
      try {
        setLoadingPayslipStatus(true);
        const workspaceId = profile.workspace_id || workspace?.id;
        const { data: batch } = await supabase
          .from("payroll_batches")
          .select("id, status")
          .eq("workspace_id", workspaceId)
          .eq("start_date", payrollStart)
          .eq("end_date", payrollEnd)
          .maybeSingle();

        if (!active) return;

        if (batch) {
          const { data: payslip } = await supabase
            .from("payslips")
            .select("status")
            .eq("batch_id", batch.id)
            .eq("user_id", profile.id)
            .maybeSingle();

          if (!active) return;
          if (payslip) {
            setPayslipStatus(payslip.status || batch.status);
          } else {
            setPayslipStatus(batch.status || "none");
          }
        } else {
          setPayslipStatus("none");
        }
      } catch (err) {
        console.error("Error checking employee payslip status:", err);
      } finally {
        if (active) setLoadingPayslipStatus(false);
      }
    };

    checkPayslipStatus();
    return () => {
      active = false;
    };
  }, [profile?.id, payrollStart, payrollEnd, workspace?.id]);

  // Fetch released payslips for alerts
  useEffect(() => {
    let active = true;
    const fetchReleasedPayslips = async () => {
      if (!profile?.id || !supabase) return;
      try {
        const { data: slips, error } = await supabase
          .from("payslips")
          .select("id, status, batch_id, net_pay, payroll_batches(start_date, end_date)")
          .eq("user_id", profile.id)
          .eq("status", "released")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!active) return;

        if (slips && slips.length > 0) {
          const latestSlip = slips[0];
          const period = latestSlip.payroll_batches
            ? `${latestSlip.payroll_batches.start_date} to ${latestSlip.payroll_batches.end_date}`
            : "";
          setReleasedPayslipAlert({
            id: latestSlip.id,
            period,
            netPay: latestSlip.net_pay,
            startDate: latestSlip.payroll_batches?.start_date,
            endDate: latestSlip.payroll_batches?.end_date,
          });
        } else {
          setReleasedPayslipAlert(null);
        }
      } catch (err) {
        console.error("Error fetching released payslip alerts:", err);
      }
    };

    fetchReleasedPayslips();
    return () => {
      active = false;
    };
  }, [profile?.id, activeTab]);

  const handleRequestPayslip = async () => {
    if (!profile?.id || !payrollStart || !payrollEnd || !supabase) return;
    
    try {
      setLoadingPayslipStatus(true);
      
      let batchIdToUse = null;
      const workspaceId = profile.workspace_id || workspace?.id;
      
      const { data: batch } = await supabase
        .from("payroll_batches")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("start_date", payrollStart)
        .eq("end_date", payrollEnd)
        .maybeSingle();

      if (batch) {
        batchIdToUse = batch.id;
      } else {
        // Since employees do not have INSERT permissions on payroll_batches (violating RLS),
        // we show a friendly alert asking them to request the admin to initiate the payroll cutoff!
        addToast("Your Workspace Administrator has not initiated the payroll batch for this cutoff period yet. Please ask your admin to open this pay period.", "warning");
        setLoadingPayslipStatus(false);
        return;
      }

      const latenessDeduction = payrollSummary.latenessDeduction;
      const customDeductionsTotal = payrollSummary.customDeductionsTotal;
      const totalDeductions = latenessDeduction + customDeductionsTotal;
      
      const payslipPayload = {
        batch_id: batchIdToUse,
        user_id: profile.id,
        completed_days: payrollSummary.totalDaysWorked,
        rows_count: payrollRows.length,
        total_hours: formatMinutesToHours(payrollSummary.totalWorkedMinutes),
        overtime_hours: formatMinutesToHours(payrollSummary.totalOvertimeMinutes),
        late_minutes: payrollSummary.totalLateMinutes,
        undertime_hours: "0h 00m",
        regular_pay: payrollSummary.basicEarnings,
        overtime_pay: payrollSummary.overtimeEarnings,
        holiday_pay: 0,
        night_diff_pay: 0,
        gross_pay: payrollSummary.totalGrossEarnings,
        late_deduction: latenessDeduction,
        undertime_deduction: 0,
        sss_deduction: Math.min(1350, payrollSummary.totalGrossEarnings * 0.045),
        philhealth_deduction: Math.min(1000, payrollSummary.totalGrossEarnings * 0.025),
        pagibig_deduction: Math.min(200, payrollSummary.totalGrossEarnings * 0.02),
        custom_deductions: payrollDeductions || [],
        total_deductions: totalDeductions,
        net_pay: payrollSummary.netPay,
        status: "requested",
      };

      const { data: existingPayslip } = await supabase
        .from("payslips")
        .select("id")
        .eq("batch_id", batchIdToUse)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (existingPayslip) {
        const { error: upsertErr } = await supabase
          .from("payslips")
          .update(payslipPayload)
          .eq("id", existingPayslip.id);

        if (upsertErr) throw upsertErr;
      } else {
        const { error: upsertErr } = await supabase
          .from("payslips")
          .insert(payslipPayload);

        if (upsertErr) throw upsertErr;
      }

      setPayslipStatus("requested");
      addToast("Payslip request sent successfully to Admin!", "success");

      try {
        const { createAuditLog } = await import("../utils/supabaseAuditLogs");
        await createAuditLog({
          workspaceId: workspaceId,
          userId: profile.id,
          action: "payslip_requested",
          details: {
            start_date: payrollStart,
            end_date: payrollEnd,
            net_pay: payrollSummary.netPay,
          },
        });
      } catch (logErr) {
        console.error("Failed to write audit log:", logErr);
      }
    } catch (err) {
      console.error("Error requesting payslip:", err);
      addToast("Failed to request payslip: " + err.message, "error");
    } finally {
      setLoadingPayslipStatus(false);
    }
  };

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Real-time ticking clock for dashboard widget
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filter States for History
  const [historyFilter, setHistoryFilter] = useState("month"); // today, week, month, custom
  const [historyStart, setHistoryStart] = useState("");
  const [historyEnd, setHistoryEnd] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all"); // all, complete, incomplete
  const [historySearch, setHistorySearch] = useState("");

  // Month tracking for Calendar view
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Dynamic ticking clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all personal DTR records from Supabase (Stale-While-Revalidate Caching Layer)
  const fetchRecords = async () => {
    if (!workspace?.id || !user?.id) {
      setLoading(false);
      return;
    }

    // Load from cache first for instant hydration
    const cacheKey = `trackly_records_cache_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setRawRecords(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached records", e);
      }
    }

    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .order("timestamp", { ascending: true });

      if (error) throw error;
      const records = data || [];
      setRawRecords(records);
      localStorage.setItem(cacheKey, JSON.stringify(records));
    } catch (err) {
      console.error("Error fetching DTR records:", err);
      if (navigator.onLine) {
        addToast("Failed to fetch DTR logs from cloud.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules with Stale-While-Revalidate cache
  const fetchSchedules = async () => {
    if (!workspace?.id || !user?.id) return;

    // Load from cache first
    const cacheKey = `trackly_schedules_cache_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setSchedules(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached schedules", e);
      }
    }

    if (!navigator.onLine) return;

    try {
      const data = await fetchMySchedules(workspace.id, user.id);
      const list = data || [];
      setSchedules(list);
      localStorage.setItem(cacheKey, JSON.stringify(list));
    } catch (err) {
      console.error("Failed to load schedules", err);
    }
  };

  // Background Sync Worker to process queued offline operations sequentially
  const syncOfflineQueue = async () => {
    if (!navigator.onLine || !workspace?.id || !user?.id || !supabase) return;

    const queueKey = `trackly_offline_queue_${user.id}`;
    const rawQueue = localStorage.getItem(queueKey);
    if (!rawQueue) return;

    let queue;
    try {
      queue = JSON.parse(rawQueue);
    } catch (e) {
      console.error("Failed to parse offline queue", e);
      return;
    }

    if (queue.length === 0) return;

    addToast(`Syncing ${queue.length} offline operation(s) with cloud...`, "info");

    for (const op of queue) {
      try {
        if (op.type === "insert_clock") {
          const { error } = await supabase
            .from("attendance_records")
            .insert(op.payload);
          if (error) throw error;
        } 
        else if (op.type === "add_manual" || op.type === "save_edit") {
          // Delete old records for that date first to avoid conflicts, then insert
          const { error: delError } = await supabase
            .from("attendance_records")
            .delete()
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id)
            .eq("date", op.date);
          if (delError) throw delError;

          if (op.payload && op.payload.length > 0) {
            const { error: insError } = await supabase
              .from("attendance_records")
              .insert(op.payload);
            if (insError) throw insError;
          }
        } 
        else if (op.type === "delete_row") {
          const { error } = await supabase
            .from("attendance_records")
            .delete()
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id)
            .eq("date", op.date);
          if (error) throw error;
        } 
        else if (op.type === "delete_all") {
          const { error } = await supabase
            .from("attendance_records")
            .delete()
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id);
          if (error) throw error;
        }
      } catch (err) {
        console.error("Failed to sync offline operation:", op, err);
        addToast("Offline sync paused. Will retry later.", "warning");
        return;
      }
    }

    // Wiped successfully!
    localStorage.removeItem(queueKey);
    addToast("All offline logs successfully synchronized with the cloud!", "success");
    await fetchRecords();
  };

  // Monitor network connection and trigger background sync on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [workspace?.id, user?.id]);

  // Load Settings and Local Goals
  useEffect(() => {
    if (workspace) {
      // 1. Load base workspace settings
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
      };

      // 2. Override with custom rule presets if assigned to this employee
      const presets = workspace.custom_rules_presets || [];
      const activePreset = presets.find(p => p.targetEmployeeIds && p.targetEmployeeIds.includes(user?.id));
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
    }

    if (user?.id) {
      // Clean cached DTR logs and old offline queues to completely clear timezone conflicts
      localStorage.removeItem(`trackly_records_cache_${user.id}`);
      localStorage.removeItem(`trackly_offline_queue_${user.id}`);
      
      const savedGoals = localStorage.getItem(`trackly_personal_goals_${user.id}`);
      if (savedGoals) {
        try {
          setGoals(JSON.parse(savedGoals));
        } catch (e) {
          console.error("Failed to parse goals", e);
        }
      }
    }

    fetchRecords();
    fetchSchedules();
  }, [workspace, user?.id]);

  // Auto-calculate current payroll period date bounds whenever settings or cutoffType changes
  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (settings.cutoffType === "weekly") {
      const currentDay = now.getDay();
      const distance = currentDay === 0 ? -6 : 1 - currentDay; // Back to Monday
      start = new Date(now);
      start.setDate(now.getDate() + distance);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (settings.cutoffType === "semi-monthly") {
      if (day <= 15) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth(), 15);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 16);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    }
    setPayrollStart(getLocalDateString(start));
    setPayrollEnd(getLocalDateString(end));
  }, [settings.cutoffType]);

  // Aggregation Engine: Groups individual events into complete daily log rows
  const dailyRows = useMemo(() => {
    const daysMap = {};

    // Group events by date key
    rawRecords.forEach((rec) => {
      const dKey = rec.date;
      if (!daysMap[dKey]) {
        daysMap[dKey] = [];
      }
      daysMap[dKey].push(rec);
    });

    return Object.entries(daysMap).map(([dateStr, events]) => {
      // Sort events by timestamp
      const sortedEvents = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Extract actions
      const timeIn = sortedEvents.find(e => e.action === "time_in");
      const timeOut = [...sortedEvents].reverse().find(e => e.action === "time_out");
      const firstBreakIn = sortedEvents.find(e => e.action === "break_in");
      const lastBreakOut = [...sortedEvents].reverse().find(e => e.action === "break_out");

      // Extract multiple breaks paired chronologically
      const breaks = [];
      let currentBreak = null;

      sortedEvents.forEach((e) => {
        if (e.action === "break_in") {
          currentBreak = { breakIn: e.timestamp, breakOut: null };
        } else if (e.action === "break_out" && currentBreak) {
          currentBreak.breakOut = e.timestamp;
          breaks.push(currentBreak);
          currentBreak = null;
        }
      });
      // Handle open break session
      if (currentBreak) {
        breaks.push(currentBreak);
      }

      let breakInStr = "-";
      let breakOutStr = "-";
      if (breaks.length > 0) {
        const formatTimeOption = (ts) => {
          if (!ts) return "-";
          return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        breakInStr = breaks.map(b => formatTimeOption(b.breakIn)).join(", ");
        breakOutStr = breaks.map(b => formatTimeOption(b.breakOut)).join(", ");
      }

      // Metadata extracted from comments & custom schedules
      const dayShift = schedules.find(s => s.date === dateStr);
      const dayBreakIsPaid = dayShift ? (dayShift.notes && dayShift.notes.includes("[PAID_BREAK]")) : false;
      
      const anyComment = sortedEvents.map(e => e.comment).find(Boolean) || "";
      const cleanNotes = anyComment.replace(/\[REST_DAY\]|\[REG_HOLIDAY\]|\[SPL_HOLIDAY\]/g, "").trim();

      let isRestDay = false;
      let isRegularHoliday = false;
      let isSpecialHoliday = false;

      if (dayShift) {
        if (dayShift.notes) {
          if (dayShift.notes.includes("[REST_DAY]")) isRestDay = true;
          else if (dayShift.notes.includes("[REG_HOLIDAY]")) isRegularHoliday = true;
          else if (dayShift.notes.includes("[SPL_HOLIDAY]")) isSpecialHoliday = true;
        }

        if (!isRestDay && !isRegularHoliday && !isSpecialHoliday) {
          const labelUpper = (dayShift.label || "").toUpperCase();
          if (labelUpper.includes("REST") || labelUpper.includes("REST DAY")) {
            isRestDay = true;
          } else if (labelUpper.includes("REGULAR HOLIDAY") || labelUpper.includes("REG HOLIDAY")) {
            isRegularHoliday = true;
          } else if (labelUpper.includes("SPECIAL HOLIDAY") || labelUpper.includes("SPL HOLIDAY")) {
            isSpecialHoliday = true;
          }
        }
      } else {
        // Fallback to DTR comments for backwards-compatibility of historical manually entered/tagged entries
        if (anyComment.includes("[REST_DAY]")) isRestDay = true;
        else if (anyComment.includes("[REG_HOLIDAY]")) isRegularHoliday = true;
        else if (anyComment.includes("[SPL_HOLIDAY]")) isSpecialHoliday = true;
      }

      let workType = "regular";
      if (isRestDay) workType = "rest_day";
      else if (isRegularHoliday) workType = "regular_holiday";
      else if (isSpecialHoliday) workType = "special_holiday";

      // Time calculations
      let workedMinutes = 0;
      let totalBreakMinutes = 0;

      const activeShiftStart = dayShift?.shift_start || "09:15";
      const activeShiftEnd = dayShift?.shift_end || "19:15";

      // Status resolving
      let status = "Not timed in";
      const lastAction = sortedEvents[sortedEvents.length - 1]?.action;
      if (timeIn && !timeOut) {
        if (lastAction === "break_in") {
          status = "On break";
        } else {
          status = "Working";
        }
      } else if (timeIn && timeOut) {
        status = "Timed out";
      }

      if (timeIn) {
        let payableStart = new Date(timeIn.timestamp);
        
        if (activeShiftStart) {
          const inDate = new Date(timeIn.timestamp);
          const [shiftH, shiftM] = activeShiftStart.split(":").map(Number);
          const shiftStart = new Date(inDate);
          shiftStart.setHours(shiftH, shiftM, 0, 0);
          
          // Early Clock-in Rule: Worked minutes count only starts at shift start
          if (inDate < shiftStart) {
            payableStart = shiftStart;
          }
        }

        // Active ongoing break tracking
        const activeOngoingBreak = breaks.find(b => b.breakIn && !b.breakOut);
        
        // Determine the gross end time for calculations
        const endTime = timeOut 
          ? new Date(timeOut.timestamp) 
          : (activeOngoingBreak ? new Date(activeOngoingBreak.breakIn) : currentTime);

        if (endTime >= payableStart) {
          // Unpaid break deductions with early return freeze
          let totalBreakDeductionMs = 0;
          breaks.forEach((b) => {
            if (b.breakIn && b.breakOut) {
              const bStart = new Date(b.breakIn);
              const bEnd = new Date(b.breakOut);
              const actualDurationMs = bEnd - bStart;
              const standardDurationMs = Number(settings.breakDurationMinutes || 60) * 60 * 1000;
              const requiredBreakEnd = new Date(bStart.getTime() + standardDurationMs);

              const deductionMs = endTime < requiredBreakEnd
                ? endTime - bStart
                : Math.max(actualDurationMs, standardDurationMs);
              totalBreakDeductionMs += deductionMs;
            }
          });

          const grossMs = Math.max(0, endTime - payableStart);
          const breakDeductionMs = dayBreakIsPaid ? 0 : totalBreakDeductionMs;
          workedMinutes = Math.max(0, Math.round((grossMs - breakDeductionMs) / 60000));
          totalBreakMinutes = Math.round(breakDeductionMs / 60000);
        } else {
          workedMinutes = 0;
          totalBreakMinutes = 0;
        }
      }

      // Lateness tracker relative to scheduled shift
      let lateMinutes = 0;
      if (timeIn && activeShiftStart) {
        const inDate = new Date(timeIn.timestamp);
        const [shiftH, shiftM] = activeShiftStart.split(":").map(Number);
        const shiftStart = new Date(inDate);
        shiftStart.setHours(shiftH, shiftM, 0, 0);

        const diffMinutes = Math.round((inDate - shiftStart) / 60000);
        if (diffMinutes > settings.graceMinutes) {
          lateMinutes = diffMinutes;
        }
      }

      // Overtime tracker (with expectedWorkHours dynamically calculated if shift times are explicit)
      let dayExpectedWorkHours = settings.expectedWorkHours;
      if (activeShiftStart && activeShiftEnd) {
        const [sh, sm] = activeShiftStart.split(":").map(Number);
        const [eh, em] = activeShiftEnd.split(":").map(Number);
        if (!(sh === 0 && sm === 0 && eh === 0 && em === 0) && activeShiftStart !== activeShiftEnd) {
          let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
          if (diffMinutes < 0) diffMinutes += 24 * 60; // Overnight logic
          const unpaidBreakDeduct = dayBreakIsPaid ? 0 : 60;
          dayExpectedWorkHours = Math.max(1, (diffMinutes - unpaidBreakDeduct) / 60);
        }
      }

      const expectedMinutes = dayExpectedWorkHours * 60;
      let overtimeMinutes = 0;
      
      if (workedMinutes > expectedMinutes) {
        const rawOvertimeMinutes = workedMinutes - expectedMinutes;
        const block = Number(settings.overtimeIncrementBlock || 1);
        overtimeMinutes = Math.floor(rawOvertimeMinutes / block) * block;
      }

      // Salary math
      const multiplier = workType === "regular_holiday"
        ? settings.holidayRegularRate
        : workType === "special_holiday"
          ? settings.holidaySpecialRate
          : workType === "rest_day"
            ? settings.restDayRate
            : 1.0;

      const effectiveHourlyRate = settings.payType === "hourly"
        ? settings.hourlyRate
        : settings.dailyRate / dayExpectedWorkHours;

      let regularPay;
      let overtimePay;

      if (settings.payType === "hourly") {
        const regularHours = Math.max(0, Math.min(workedMinutes - overtimeMinutes, expectedMinutes) / 60);
        regularPay = regularHours * settings.hourlyRate * multiplier;
      } else {
        // Daily Rate model must stay proportional until the expected payable hours are completed.
        // This keeps same-day running pay accurate and prevents a short timed-out session from showing a full day pay.
        const regularWorkedMinutes = Math.max(0, Math.min(workedMinutes, expectedMinutes));
        const progressRatio = Math.min(regularWorkedMinutes / expectedMinutes, 1);
        regularPay = settings.dailyRate * progressRatio * multiplier;
      }

      // OT Calculation
      overtimePay = (overtimeMinutes / 60) * effectiveHourlyRate * settings.overtimeRate * multiplier;
      const estimatedEarnings = regularPay + overtimePay;

      return {
        id: dateStr,
        date: dateStr,
        timeIn: timeIn ? timeIn.timestamp : "",
        timeInRaw: timeIn ? timeIn.timestamp : "",
        timeOut: timeOut ? timeOut.timestamp : "",
        timeOutRaw: timeOut ? timeOut.timestamp : "",
        breakIn: breakInStr,
        breakInRaw: firstBreakIn ? firstBreakIn.timestamp : "",
        breakOut: breakOutStr,
        breakOutRaw: lastBreakOut ? lastBreakOut.timestamp : "",
        breaks,
        notes: cleanNotes,
        workType,
        workedMinutes,
        breakMinutes: totalBreakMinutes,
        lateMinutes,
        overtimeMinutes,
        status,
        regularPay,
        overtimePay,
        estimatedEarnings,
        isAbsent: !timeIn,
        events: sortedEvents,
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [rawRecords, settings, currentTime, schedules]);

  // Today's specific row state
  const todayRow = useMemo(() => {
    const tKey = getLocalDateString(currentTime);
    return dailyRows.find(r => r.date === tKey) || null;
  }, [dailyRows, currentTime]);

  // Computed dashboard analytics
  const analyticsSummary = useMemo(() => {
    // Cutoff dates based on setting
    const now = new Date(currentTime);
    const day = now.getDate();
    let cutoffStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let cutoffEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (settings.cutoffType === "weekly") {
      const currentDay = now.getDay();
      const distance = currentDay === 0 ? -6 : 1 - currentDay; // Back to Monday
      cutoffStart = new Date(now);
      cutoffStart.setDate(now.getDate() + distance);
      cutoffStart.setHours(0, 0, 0, 0);
      cutoffEnd = new Date(cutoffStart);
      cutoffEnd.setDate(cutoffStart.getDate() + 6);
      cutoffEnd.setHours(23, 59, 59, 999);
    } else if (settings.cutoffType === "semi-monthly") {
      if (day <= 15) {
        cutoffStart = new Date(now.getFullYear(), now.getMonth(), 1);
        cutoffEnd = new Date(now.getFullYear(), now.getMonth(), 15);
      } else {
        cutoffStart = new Date(now.getFullYear(), now.getMonth(), 16);
        cutoffEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    }

    const startStr = getLocalDateString(cutoffStart);
    const endStr = getLocalDateString(cutoffEnd);

    // Dynamic stats filtering
    const monthRows = dailyRows.filter(r => r.date.slice(0, 7) === getLocalDateString(now).slice(0, 7));
    const cutoffRows = dailyRows.filter(r => r.date >= startStr && r.date <= endStr);
    
    // Weekly rows
    const mon = new Date(now);
    mon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    const weekStart = getLocalDateString(mon);
    const weekRows = dailyRows.filter(r => r.date >= weekStart);

    const todayEarnings = todayRow ? todayRow.estimatedEarnings : 0;
    const todayWorkedHours = todayRow ? (todayRow.workedMinutes / 60) : 0;
    const todayBreakTime = todayRow ? (todayRow.breakMinutes) : 0;

    const cutoffEarnings = cutoffRows.reduce((sum, r) => sum + r.estimatedEarnings, 0);
    const cutoffHours = cutoffRows.reduce((sum, r) => sum + (r.workedMinutes / 60), 0);

    const weeklyEarnings = weekRows.reduce((sum, r) => sum + r.estimatedEarnings, 0);

    const monthlyEarnings = monthRows.reduce((sum, r) => sum + r.estimatedEarnings, 0);
    const monthlyHours = monthRows.reduce((sum, r) => sum + (r.workedMinutes / 60), 0);

    const totalOvertimeHours = monthRows.reduce((sum, r) => sum + (r.overtimeMinutes / 60), 0);
    const totalLateMinutes = monthRows.reduce((sum, r) => sum + r.lateMinutes, 0);
    const totalLateCount = monthRows.filter(r => r.lateMinutes > 0).length;

    const completedDays = monthRows.filter(r => r.status === "Timed out").length;
    const avgDailyHours = completedDays > 0 ? (monthlyHours / completedDays) : 0;

    // Check incomplete reminders
    const incompleteRecords = dailyRows.filter(r => r.timeIn && !r.timeOut && r.date !== getLocalDateString(currentTime));

    return {
      todayEarnings,
      todayWorkedHours,
      todayBreakTime,
      cutoffEarnings,
      cutoffHours,
      weeklyEarnings,
      monthlyEarnings,
      monthlyHours,
      totalOvertimeHours,
      totalLateMinutes,
      totalLateCount,
      avgDailyHours,
      incompleteRecords,
    };
  }, [dailyRows, todayRow, settings, currentTime]);

  // Filtered rows for the selected payroll cutoff period
  const payrollRows = useMemo(() => {
    if (!payrollStart || !payrollEnd) return [];
    return dailyRows.filter(r => r.date >= payrollStart && r.date <= payrollEnd);
  }, [dailyRows, payrollStart, payrollEnd]);

  // Aggregated pay metrics for the selected payroll period
  const payrollSummary = useMemo(() => {
    const totalDaysWorked = payrollRows.filter(r => r.timeIn).length;
    const totalWorkedMinutes = payrollRows.reduce((sum, r) => sum + (r.workedMinutes || 0), 0);
    const totalOvertimeMinutes = payrollRows.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);
    const totalLateMinutes = payrollRows.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);

    const basicEarnings = payrollRows.reduce((sum, r) => sum + (r.regularPay || 0), 0);
    const overtimeEarnings = payrollRows.reduce((sum, r) => sum + (r.overtimePay || 0), 0);
    const totalGrossEarnings = basicEarnings + overtimeEarnings;

    // Awtomatikong bawas mula sa late docking
    let latenessDeduction;
    if (settings.payType === "daily") {
      const effectiveHourlyRate = settings.dailyRate / settings.expectedWorkHours;
      latenessDeduction = (totalLateMinutes / 60) * effectiveHourlyRate;
    } else {
      latenessDeduction = (totalLateMinutes / 60) * settings.hourlyRate;
    }

    // Custom manual deductions na ininput ng user
    const customDeductionsTotal = payrollDeductions.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    const totalDeductions = latenessDeduction + customDeductionsTotal;
    const netPay = Math.max(0, totalGrossEarnings - totalDeductions);

    return {
      totalDaysWorked,
      totalWorkedMinutes,
      totalOvertimeMinutes,
      totalLateMinutes,
      basicEarnings,
      overtimeEarnings,
      totalGrossEarnings,
      latenessDeduction,
      customDeductionsTotal,
      totalDeductions,
      netPay,
    };
  }, [payrollRows, settings, payrollDeductions]);

  const getScheduleForDate = (dateStr) => {
    if (!dateStr) return null;
    return schedules.find((schedule) => schedule.date === dateStr) || null;
  };

  const requireScheduleForDate = (dateStr, actionLabel = "create or edit an attendance log") => {
    const schedule = getScheduleForDate(dateStr);

    if (schedule) return true;

    addToast(
      `Please add a Work Schedule for ${dateStr || "this date"} before you ${actionLabel}.`,
      "warning"
    );
    return false;
  };

  // Dashboard Clocking Operations
  const handleClockAction = async (actionType, verificationPhoto) => {
    if (!workspace?.id || !user?.id) {
      addToast("Connection to Supabase lost. Please reload.", "error");
      return;
    }

    const localDate = getLocalDateString(new Date());
    if (!requireScheduleForDate(localDate, "record time actions")) {
      setActiveTab("schedule");
      return;
    }

    // New business logic check: Block early Time Out if it's before scheduled shift end time!
    if (actionType === "time_out") {
      const todayKey = getLocalDateString(new Date());
      const todayShift = schedules.find((s) => s.date === todayKey);
      if (todayShift && isBeforeEndTime(todayShift.shift_end)) {
        addToast(
          `You cannot Time Out yet because your scheduled shift has not ended (Ends at ${formatTime12(todayShift.shift_end)}).`,
          "warning"
        );
        return;
      }
    }

    // Intercept with Face Verification if active for employees
    if (role === "employee" && permissions?.faceVerification && (actionType === "time_in" || actionType === "time_out")) {
      const facePhoto = profile?.face_photo || localStorage.getItem(`trackly_local_face_photo_${profile.id}`) || "";
      if (!facePhoto) {
        addToast("Kailangang mag-enroll ng Face Profile bago makapag-Time In/Out.", "warning");
        setModal("face-registration");
        return;
      }
      if (!verificationPhoto) {
        setPendingAction(actionType);
        setModal("camera-biometric");
        return;
      }
    }

    setSubmitting(true);
    try {
      const nowString = new Date().toISOString();

      // Prepare payload
      const payload = {
        workspace_id: workspace.id,
        user_id: user.id,
        action: actionType,
        status: actionType === "time_out" ? "Completed" : actionType === "break_in" ? "On Break" : "Working",
        timestamp: nowString,
        date: localDate,
        created_at: nowString,
        verification_photo: verificationPhoto || undefined,
      };

      // Handle overtime reason modal triggering if they are timing out late
      if (actionType === "time_out" && todayRow) {
        const expected = settings.expectedWorkHours * 60;
        if (todayRow.workedMinutes > expected) {
          payload.overtime_approved = true; // Auto approved for personal DTR!
        }
      }

      if (!navigator.onLine) {
        // Offline optimistic update: construct a mock db record
        const mockRecord = {
          id: `offline_${Date.now()}`,
          ...payload
        };
        const updatedRecords = [...rawRecords, mockRecord];
        setRawRecords(updatedRecords);
        localStorage.setItem(`trackly_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        // Trigger Ephemeral Selfie DTR Proof display on dashboard
        if (verificationPhoto) {
          setEphemeralSelfie(verificationPhoto);
          setEphemeralActionName(actionType === "time_in" ? "Time In" : "Time Out");
        }

        // Queue in offline queue
        const queueKey = `trackly_offline_queue_${user.id}`;
        const rawQueue = localStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "insert_clock",
          payload: [payload]
        });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        addToast(`Offline Mode: Action ${actionType.replace("_", " ")} saved locally!`, "warning");
        setSubmitting(false);
        return;
      }

      if (!supabase) throw new Error("Supabase client is not available.");

      const { data, error } = await supabase
        .from("attendance_records")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Trigger Ephemeral Selfie DTR Proof display on dashboard
      if (verificationPhoto) {
        setEphemeralSelfie(verificationPhoto);
        setEphemeralActionName(actionType === "time_in" ? "Time In" : "Time Out");
      }

      addToast(`Action ${actionType.replace("_", " ")} successfully logged!`, "success");
      await fetchRecords();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to record clock action.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Manual Record Logic
  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!workspace?.id || !user?.id) return;

    // Attendance records are only valid when the selected date has a Work Schedule.
    const baseDate = addForm.date;
    if (!requireScheduleForDate(baseDate, "create an attendance log")) {
      setShowAddModal(false);
      setActiveTab("schedule");
      return;
    }

    setSubmitting(true);

    try {
      // Form date string validation
      
      // Construct events payload array
      const eventsToInsert = [];
      const tag = addForm.workType === "rest_day" ? "[REST_DAY]" : addForm.workType === "regular_holiday" ? "[REG_HOLIDAY]" : addForm.workType === "special_holiday" ? "[SPL_HOLIDAY]" : "";
      const fullComment = `${tag} ${addForm.notes}`.trim();

      // Time In Event. Required, because this is the anchor that lets today's incomplete log resume on the dashboard.
      if (addForm.timeIn) {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_in",
          status: "Working",
          timestamp: toUTCISO(baseDate, addForm.timeIn),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, addForm.timeIn)
        });
      }

      // Multiple break sessions. Break Out is optional so users can resume/complete today's log on the dashboard.
      if (addForm.hasBreak) {
        const breakSessions = Array.isArray(addForm.breaks) ? addForm.breaks : [];
        breakSessions.forEach((session) => {
          if (session.breakIn) {
            eventsToInsert.push({
              workspace_id: workspace.id,
              user_id: user.id,
              action: "break_in",
              status: "On Break",
              timestamp: toUTCISO(baseDate, session.breakIn),
              date: baseDate,
              comment: fullComment,
              created_at: toUTCISO(baseDate, session.breakIn)
            });
          }

          if (session.breakOut) {
            eventsToInsert.push({
              workspace_id: workspace.id,
              user_id: user.id,
              action: "break_out",
              status: "Working",
              timestamp: toUTCISO(baseDate, session.breakOut),
              date: baseDate,
              comment: fullComment,
              created_at: toUTCISO(baseDate, session.breakOut)
            });
          }
        });
      }

      // Time Out Event is optional. If blank, the log stays incomplete and dashboard buttons can continue the session.
      if (addForm.timeOut) {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_out",
          status: "Completed",
          timestamp: toUTCISO(baseDate, addForm.timeOut),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, addForm.timeOut),
          overtime_approved: true
        });
      }

      eventsToInsert.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      if (!navigator.onLine) {
        // Optimistic UI update: Filter out old records of this date, add new ones
        const updatedRecords = rawRecords.filter(r => r.date !== baseDate).concat(eventsToInsert);
        setRawRecords(updatedRecords);
        localStorage.setItem(`trackly_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        // Queue offline operation
        const queueKey = `trackly_offline_queue_${user.id}`;
        const rawQueue = localStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "add_manual",
          date: baseDate,
          payload: eventsToInsert
        });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        addToast("Offline Mode: Manual record saved locally!", "warning");
        setShowAddModal(false);
        setSubmitting(false);
        return;
      }

      // We will delete existing logs for this date first to avoid conflicts
      const { error: delError } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .eq("date", baseDate);

      if (delError) throw delError;

      const { error: insError } = await supabase
        .from("attendance_records")
        .insert(eventsToInsert);

      if (insError) throw insError;

      addToast("Manual record added successfully!", "success");
      setShowAddModal(false);
      
      // Wipe cache to force reload fresh DTR data
      localStorage.removeItem(`trackly_records_cache_${user.id}`);
      console.log("SUCCESSFULLY SAVED MANUAL DTR WITH TIMEZONE-AWARE RESOLUTION!");
      
      await fetchRecords();
    } catch (err) {
      console.error(err);
      addToast("Failed to add manual record.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal for a row
  const openEditRow = (row) => {
    setSelectedDateRow(row);
    // Parse breaks or construct blank break
    const activeBreaks = row.breaks.map(b => ({
      breakIn: getLocalTime24(b.breakIn),
      breakOut: getLocalTime24(b.breakOut)
    }));

    setEditForm({
      date: row.date,
      timeIn: getLocalTime24(row.timeIn),
      timeOut: getLocalTime24(row.timeOut),
      breaks: activeBreaks,
      notes: row.notes || "",
      workType: row.workType || "regular",
    });
    setShowEditModal(true);
  };

  // Save Edited Record
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!workspace?.id || !user?.id || !selectedDateRow) return;

    // Editing is blocked when the record date has no Work Schedule.
    const baseDate = editForm.date;
    if (!requireScheduleForDate(baseDate, "edit an attendance log")) {
      setShowEditModal(false);
      setActiveTab("schedule");
      return;
    }

    setSubmitting(true);

    try {

      // Compile new events list
      const eventsToInsert = [];
      const tag = editForm.workType === "rest_day" ? "[REST_DAY]" : editForm.workType === "regular_holiday" ? "[REG_HOLIDAY]" : editForm.workType === "special_holiday" ? "[SPL_HOLIDAY]" : "";
      const fullComment = `${tag} ${editForm.notes}`.trim();

      // Time In Event
      if (editForm.timeIn) {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_in",
          status: "Working",
          timestamp: toUTCISO(baseDate, editForm.timeIn),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, editForm.timeIn)
        });
      }

      // Add Breaks
      editForm.breaks.forEach((b) => {
        if (b.breakIn) {
          eventsToInsert.push({
            workspace_id: workspace.id,
            user_id: user.id,
            action: "break_in",
            status: "On Break",
            timestamp: toUTCISO(baseDate, b.breakIn),
            date: baseDate,
            comment: fullComment,
            created_at: toUTCISO(baseDate, b.breakIn)
          });
        }
        if (b.breakOut) {
          eventsToInsert.push({
            workspace_id: workspace.id,
            user_id: user.id,
            action: "break_out",
            status: "Working",
            timestamp: toUTCISO(baseDate, b.breakOut),
            date: baseDate,
            comment: fullComment,
            created_at: toUTCISO(baseDate, b.breakOut)
          });
        }
      });

      // Time Out Event
      if (editForm.timeOut) {
        eventsToInsert.push({
          workspace_id: workspace.id,
          user_id: user.id,
          action: "time_out",
          status: "Completed",
          timestamp: toUTCISO(baseDate, editForm.timeOut),
          date: baseDate,
          comment: fullComment,
          created_at: toUTCISO(baseDate, editForm.timeOut),
          overtime_approved: true
        });
      }

      eventsToInsert.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      if (!navigator.onLine) {
        // Optimistic UI update: Filter out old records of this date, add new ones
        const updatedRecords = rawRecords.filter(r => r.date !== baseDate).concat(eventsToInsert);
        setRawRecords(updatedRecords);
        localStorage.setItem(`trackly_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        // Queue offline operation
        const queueKey = `trackly_offline_queue_${user.id}`;
        const rawQueue = localStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "save_edit",
          date: baseDate,
          payload: eventsToInsert
        });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        addToast("Offline Mode: Log corrections saved locally!", "warning");
        setShowEditModal(false);
        setSubmitting(false);
        return;
      }

      // 1. Delete all previous events for this date
      const { error: delError } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .eq("date", baseDate);

      if (delError) throw delError;

      if (eventsToInsert.length > 0) {
        const { error: insError } = await supabase
          .from("attendance_records")
          .insert(eventsToInsert);

        if (insError) throw insError;
      }

      addToast("Record updated and pay statistics recalculated!", "success");
      setShowEditModal(false);
      
      // Wipe cache and offline queue on edit success to force fresh data load
      localStorage.removeItem(`trackly_records_cache_${user.id}`);
      localStorage.removeItem(`trackly_offline_queue_${user.id}`);
      console.log("SUCCESSFULLY UPDATED DTR CORRECTION WITH TIMEZONE-AWARE RESOLUTION!");
      
      await fetchRecords();
    } catch (err) {
      console.error(err);
      addToast("Failed to edit records.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Record Row
  const handleDeleteRow = async (dateKey) => {
    if (!workspace?.id || !user?.id) return;
    setSubmitting(true);
    try {
      if (!navigator.onLine) {
        // Optimistic UI: Filter out records for this date
        const updatedRecords = rawRecords.filter(r => r.date !== dateKey);
        setRawRecords(updatedRecords);
        localStorage.setItem(`trackly_records_cache_${user.id}`, JSON.stringify(updatedRecords));

        // Queue delete operation
        const queueKey = `trackly_offline_queue_${user.id}`;
        const rawQueue = localStorage.getItem(queueKey);
        const queue = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push({
          id: `q_${Date.now()}`,
          type: "delete_row",
          date: dateKey
        });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        addToast("Offline Mode: Log removed locally!", "warning");
        setConfirmDeleteId(null);
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .eq("date", dateKey);

      if (error) throw error;
      addToast("DTR log successfully removed.", "success");
      setConfirmDeleteId(null);
      await fetchRecords();
    } catch (err) {
      console.error(err);
      addToast("Failed to delete log.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Clear All Personal Records
  const handleClearAllRecords = async () => {
    if (deleteConfirmText !== "DELETE") {
      addToast("Confirmation phrase must be 'DELETE'", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (!navigator.onLine) {
        // Optimistic UI: Clear all records
        setRawRecords([]);
        localStorage.setItem(`trackly_records_cache_${user.id}`, JSON.stringify([]));

        // Clear entire pending offline queue first because everything is wiped anyway
        const queueKey = `trackly_offline_queue_${user.id}`;
        const queue = [{
          id: `q_${Date.now()}`,
          type: "delete_all"
        }];
        localStorage.setItem(queueKey, JSON.stringify(queue));

        addToast("Offline Mode: Wiped all local records. Wipe request queued!", "warning");
        setIsDeletingAll(false);
        setDeleteConfirmText("");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id);

      if (error) throw error;
      addToast("All personal records cleared successfully.", "info");
      setIsDeletingAll(false);
      setDeleteConfirmText("");

      // Also clear local cache & queue to ensure sync state
      localStorage.setItem(`trackly_records_cache_${user.id}`, JSON.stringify([]));
      localStorage.removeItem(`trackly_offline_queue_${user.id}`);

      await fetchRecords();
    } catch (err) {
      console.error(err);
      addToast("Failed to clear personal records.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Settings Changes (in worksapce table)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!supabase || !workspace?.id) return;
    setSubmitting(true);

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
        })
        .eq("id", workspace.id);

      if (error) throw error;

      // Save Goals
      localStorage.setItem(`trackly_personal_goals_${user.id}`, JSON.stringify(goals));

      addToast("Personal Settings saved successfully!", "success");
      // Trigger session hydration reload
      window.location.reload();
    } catch (err) {
      console.error(err);
      addToast("Failed to save settings: " + (err.message || err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Export CSV Function
  const handleExportCsv = () => {
    if (dailyRows.length === 0) {
      addToast("No records to export.", "warning");
      return;
    }

    const isEmp = role === "employee";

    const headers = [
      "Date",
      "Time In",
      "Time Out",
      "Worked Hours",
      "Break Minutes",
      "Overtime Minutes",
      "Lateness (Mins)",
      "Work Type",
      "Status",
      !isEmp && "Est. Earnings (PHP)",
      "Notes"
    ].filter(Boolean);

    const rows = dailyRows.map(r => [
      r.date,
      r.timeIn ? new Date(r.timeIn).toLocaleTimeString() : "-",
      r.timeOut ? new Date(r.timeOut).toLocaleTimeString() : "-",
      (r.workedMinutes / 60).toFixed(2),
      r.breakMinutes,
      r.overtimeMinutes,
      r.lateMinutes,
      r.workType,
      r.status,
      !isEmp && r.estimatedEarnings.toFixed(2),
      `"${r.notes?.replace(/"/g, '""') || ""}"`
    ].filter(val => val !== false));

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trackly_${isEmp ? 'Employee' : 'Personal'}_DTR_Export_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("CSV Export downloaded!", "success");
  };

  // Export/Print Printable DTR Layout
  const handlePrintDtr = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const isEmp = role === "employee";

    const rowContent = dailyRows.map(r => `
      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
        <td style="padding: 10px;">${r.date}</td>
        <td style="padding: 10px;">${r.timeInRaw ? new Date(r.timeInRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
        <td style="padding: 10px;">${r.breakIn || '-'}</td>
        <td style="padding: 10px;">${r.breakOut || '-'}</td>
        <td style="padding: 10px;">${r.timeOutRaw ? new Date(r.timeOutRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
        <td style="padding: 10px;">${(r.workedMinutes / 60).toFixed(2)} hrs</td>
        <td style="padding: 10px;">${r.breakMinutes}m</td>
        <td style="padding: 10px;">${r.overtimeMinutes}m</td>
        <td style="padding: 10px;">${r.lateMinutes}m</td>
        <td style="padding: 10px; text-transform: capitalize;">${(r.workType || "regular").replace("_", " ")}</td>
        ${!isEmp ? `<td style="padding: 10px;">PHP ${r.estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>` : ""}
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${isEmp ? 'Employee' : 'Personal'} DTR Summary Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1E293B; margin: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background-color: #F8FAFC; padding: 12px 10px; border-bottom: 2px solid #CBD5E1; font-size: 13px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2 style="margin-bottom: 5px; color: #059669;">Trackly - ${isEmp ? 'Employee' : 'Personal'} DTR Summary</h2>
          <p style="font-size: 14px; margin-top: 0; color: #64748B;">User: ${profile?.email || user?.email}</p>
          <hr style="border: 1px solid #E2E8F0; margin-bottom: 25px;" />
          
          <div style="display: flex; gap: 30px; margin-bottom: 30px; font-size: 14px;">
            <div><strong>Total Hours:</strong> ${(dailyRows.reduce((a, b) => a + b.workedMinutes, 0) / 60).toFixed(2)} hrs</div>
            <div><strong>Total Overtime:</strong> ${(dailyRows.reduce((a, b) => a + b.overtimeMinutes, 0) / 60).toFixed(2)} hrs</div>
            <div><strong>Total Lateness:</strong> ${dailyRows.reduce((a, b) => a + b.lateMinutes, 0)} mins</div>
            ${!isEmp ? `<div><strong>Estimated Total Pay:</strong> PHP ${dailyRows.reduce((a, b) => a + b.estimatedEarnings, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>` : ""}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Break In</th>
                <th>Break Out</th>
                <th>Clock Out</th>
                <th>Worked Time</th>
                <th>Break</th>
                <th>Overtime</th>
                <th>Late</th>
                <th>Day Type</th>
                ${!isEmp ? "<th>Earnings</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${rowContent}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Export/Print Payslip PDF
  const handlePrintPayslip = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Build the dynamic deductions list
    const deductionsListHTML = [
      ...(payrollSummary.latenessDeduction > 0 ? [`
        <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
          <td style="padding: 10px; color: #475569;">Lateness Deductions</td>
          <td style="padding: 10px; text-align: right; color: #E11D48; font-weight: 500;">PHP ${payrollSummary.latenessDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `] : []),
      ...payrollDeductions.filter(d => d.name && Number(d.amount) > 0).map(d => `
        <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
          <td style="padding: 10px; color: #475569;">${d.name}</td>
          <td style="padding: 10px; text-align: right; color: #E11D48; font-weight: 500;">PHP ${Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `)
    ].join("");

    const hasDeductions = (payrollSummary.latenessDeduction > 0) || (payrollDeductions.some(d => d.name && Number(d.amount) > 0));

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${profileForm.fullName || 'Personal Member'}</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1E293B; margin: 40px; background-color: #FFFFFF; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #10B981; padding-bottom: 15px; }
            .logo-text { font-size: 22px; font-weight: 900; color: #10B981; letter-spacing: 0.05em; }
            .slip-title { font-size: 14px; font-weight: 800; color: #64748B; uppercase; letter-spacing: 0.1em; text-align: right; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; background-color: #F8FAFC; border-radius: 12px; padding: 20px; font-size: 13px; }
            .info-col p { margin: 6px 0; color: #475569; }
            .info-col strong { color: #0F172A; }
            .table-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; background-color: #F8FAFC; padding: 12px 10px; border-bottom: 2px solid #CBD5E1; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
            .th-right { text-align: right; }
            .td-right { text-align: right; }
            .summary-card { background: linear-gradient(135deg, #059669 0%, #10B981 100%); border-radius: 12px; padding: 20px; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2); }
            .summary-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; }
            .summary-value { font-size: 24px; font-weight: 900; }
            .sign-section { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 50px; padding-top: 30px; border-top: 1px dashed #E2E8F0; text-align: center; font-size: 12px; color: #64748B; }
            .signature-line { border-top: 1px solid #94A3B8; margin-top: 40px; padding-top: 8px; }
            @media print {
              body { margin: 0; }
              .container { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="logo-text">TRACKLY</div>
                <div style="font-size: 10px; color: #10B981; font-weight: bold; letter-spacing: 0.1em;">PERSONAL PAYROLL RECORD</div>
              </div>
              <div>
                <div class="slip-title">OFFICIAL PAYSLIP</div>
                <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Cutoff: <strong>${payrollStart}</strong> to <strong>${payrollEnd}</strong></div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-col">
                <p><strong>Employee Name:</strong> ${profileForm.fullName || 'Personal Member'}</p>
                <p><strong>Job Title:</strong> ${profileForm.position || 'Not Specified'}</p>
                <p><strong>Department:</strong> ${profileForm.department || 'Not Specified'}</p>
                <p><strong>Employee ID:</strong> ${profileForm.employeeId || 'Not Specified'}</p>
              </div>
              <div class="info-col">
                <p><strong>SSS No.:</strong> ${profileForm.sss || '-'}</p>
                <p><strong>PhilHealth No.:</strong> ${profileForm.philhealth || '-'}</p>
                <p><strong>Pag-IBIG MID:</strong> ${profileForm.pagibig || '-'}</p>
                <p><strong>TIN:</strong> ${profileForm.tin || '-'}</p>
              </div>
            </div>

            <div class="table-container">
              <div>
                <h4 style="margin: 0 0 10px 0; color: #0F172A; font-weight: 800; font-size: 14px;">Earnings Breakdown</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th class="th-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                      <td style="padding: 10px; color: #475569;">Basic Salary</td>
                      <td style="padding: 10px; text-align: right; color: #0F172A; font-weight: 500;">PHP ${payrollSummary.basicEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    ${payrollSummary.overtimeEarnings > 0 ? `
                      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                        <td style="padding: 10px; color: #475569;">Overtime Pay</td>
                        <td style="padding: 10px; text-align: right; color: #0F172A; font-weight: 500;">PHP ${payrollSummary.overtimeEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ` : ''}
                    <tr style="background-color: #F8FAFC; font-weight: bold; font-size: 13px;">
                      <td style="padding: 10px; color: #0F172A;">Gross Earnings</td>
                      <td style="padding: 10px; text-align: right; color: #059669;">PHP ${payrollSummary.totalGrossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style="margin: 0 0 10px 0; color: #0F172A; font-weight: 800; font-size: 14px;">Deductions & Adjustments</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th class="th-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${hasDeductions ? deductionsListHTML : `
                      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                        <td style="padding: 10px; color: #94A3B8; italic; text-align: center;" colspan="2">No Deductions Recorded</td>
                      </tr>
                    `}
                    <tr style="background-color: #F8FAFC; font-weight: bold; font-size: 13px;">
                      <td style="padding: 10px; color: #0F172A;">Total Deductions</td>
                      <td style="padding: 10px; text-align: right; color: #E11D48;">PHP ${payrollSummary.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="summary-card">
              <div>
                <div class="summary-title">Net Take-Home Pay</div>
                <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Gross Pay minus Total Deductions</div>
              </div>
              <div class="summary-value">PHP ${payrollSummary.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div class="sign-section">
              <div>
                <div class="signature-line">Prepared By</div>
              </div>
              <div>
                <div class="signature-line">Employee Signature / Acknowledged Date</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle Profile avatar upload (Max 1.5MB Base64 validation)
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please upload a valid image file.", "warning");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      addToast("Image must be smaller than 1.5MB to save space.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setProfileForm((current) => ({ ...current, facePhoto: base64String }));
      addToast("Profile photo loaded! Click 'Save Changes' to update.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePhoto = () => {
    setProfileForm((current) => ({ ...current, facePhoto: "" }));
    addToast("Profile photo removed! Click 'Save Changes' to apply.", "info");
  };

  // Update Profile records in Supabase profiles table
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileForm.fullName.trim()) {
      addToast("Full Name is required.", "warning");
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        address: profileForm.address,
        position: profileForm.position,
        department: profileForm.department,
        employeeId: profileForm.employeeId,
        sss: profileForm.sss,
        philhealth: profileForm.philhealth,
        pagibig: profileForm.pagibig,
        tin: profileForm.tin,
        facePhoto: profileForm.facePhoto,
      });
      addToast("Profile information updated successfully!", "success");
    } catch (err) {
      console.error("Error saving profile details:", err);
      addToast(err.message || "Failed to update profile.", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Get date strings for the selected week
  const weekDaysList = useMemo(() => {
    const list = [];
    const base = new Date(currentTime);
    // Find Monday of the week offset
    const currentDay = base.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    base.setDate(base.getDate() + distanceToMonday + currentWeekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, [currentTime, currentWeekOffset]);

  const handleSaveShift = async (e) => {
    if (e) e.preventDefault();
    if (!workspace?.id || !user?.id || !selectedScheduleDate) return;
    setSubmitting(true);
    try {
      let finalNotes = scheduleForm.notes || "";
      if (scheduleForm.breakIsPaid) {
        if (!finalNotes.includes("[PAID_BREAK]")) {
          finalNotes = `${finalNotes} [PAID_BREAK]`.trim();
        }
      } else {
        finalNotes = finalNotes.replace(/\[PAID_BREAK\]/g, "").trim();
      }

      // Clean out existing workType tags and insert the new one
      finalNotes = finalNotes.replace(/\[REST_DAY\]|\[REG_HOLIDAY\]|\[SPL_HOLIDAY\]/g, "").trim();
      if (scheduleForm.workType === "rest_day") {
        finalNotes = `${finalNotes} [REST_DAY]`.trim();
      } else if (scheduleForm.workType === "regular_holiday") {
        finalNotes = `${finalNotes} [REG_HOLIDAY]`.trim();
      } else if (scheduleForm.workType === "special_holiday") {
        finalNotes = `${finalNotes} [SPL_HOLIDAY]`.trim();
      }

      await saveSchedule({
        id: scheduleForm.id,
        workspace_id: workspace.id,
        user_id: user.id,
        date: selectedScheduleDate,
        shift_start: scheduleForm.shiftStart,
        shift_end: scheduleForm.shiftEnd,
        label: scheduleForm.label,
        color: scheduleForm.color,
        notes: finalNotes,
      });
      addToast("Shift schedule saved successfully!", "success");
      setShowShiftModal(false);
      await fetchSchedules();
    } catch (err) {
      console.error("Error saving shift:", err);
      addToast("Failed to save shift: " + (err.message || err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete shift schedule from Supabase
  const handleDeleteShift = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to clear this shift? It will fall back to default preferences.")) return;
    setSubmitting(true);
    try {
      await deleteSchedule(scheduleId);
      addToast("Shift cleared successfully!", "success");
      setShowShiftModal(false);
      await fetchSchedules();
    } catch (err) {
      console.error("Error clearing shift:", err);
      addToast("Failed to clear shift.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate batch preset schedules for the week
  const handleGeneratePreset = async (e) => {
    if (e) e.preventDefault();
    if (!workspace?.id || !user?.id) return;
    setSubmitting(true);
    try {
      const promises = weekDaysList.map(async (dayDate) => {
        const dayOfWeek = dayDate.getDay(); // 0 is Sunday, 1-6 Mon-Sat
        const isWorkDay = presetForm.workDays[dayOfWeek];
        const dateStr = getLocalDateString(dayDate);

        if (isWorkDay) {
          return saveSchedule({
            workspace_id: workspace.id,
            user_id: user.id,
            date: dateStr,
            shift_start: presetForm.shiftStart,
            shift_end: presetForm.shiftEnd,
            label: presetForm.label,
            color: "#10b981", // emerald
            notes: "Weekly Preset Shift",
          });
        } else {
          // Explicit Rest Day shift
          return saveSchedule({
            workspace_id: workspace.id,
            user_id: user.id,
            date: dateStr,
            shift_start: "00:00",
            shift_end: "00:00",
            label: "Rest Day",
            color: "#64748b", // slate
            notes: "Weekly Preset Rest Day",
          });
        }
      });

      await Promise.all(promises);
      addToast("Weekly schedule generated successfully!", "success");
      setShowPresetModal(false);
      await fetchSchedules();
    } catch (err) {
      console.error("Error generating preset:", err);
      addToast("Failed to generate weekly preset.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Sign out method
  const handleSignOut = async () => {
    try {
      await logout();
      addToast("Logged out successfully.", "info");
      navigate("/");
    } catch {
      addToast("Failed to sign out.", "error");
    }
  };

  // Filtering Logic for History View
  const filteredHistoryRows = useMemo(() => {
    return dailyRows.filter((r) => {
      // Date filters
      if (historyFilter === "today") {
        if (r.date !== getLocalDateString(currentTime)) return false;
      } else if (historyFilter === "week") {
        const mon = new Date(currentTime);
        mon.setDate(currentTime.getDate() - (currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1));
        if (r.date < getLocalDateString(mon)) return false;
      } else if (historyFilter === "month") {
        const first = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
        if (r.date < getLocalDateString(first)) return false;
      } else if (historyFilter === "custom") {
        if (historyStart && r.date < historyStart) return false;
        if (historyEnd && r.date > historyEnd) return false;
      }

      // Status filters
      if (historyStatusFilter === "complete") {
        if (r.status !== "Timed out") return false;
      } else if (historyStatusFilter === "incomplete") {
        if (r.status === "Timed out" || r.isAbsent) return false;
      }

      // Search notes
      if (historySearch.trim()) {
        const term = historySearch.toLowerCase();
        if (!r.notes.toLowerCase().includes(term)) return false;
      }

      return true;
    });
  }, [dailyRows, historyFilter, historyStart, historyEnd, historyStatusFilter, historySearch, currentTime]);

  // Calendar calculations (build days grid)
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    // Pad previous month days
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex === 0 ? 6 : firstDayIndex - 1; i > 0; i--) {
      grid.push({
        dateStr: "",
        dayNum: prevDaysInMonth - i + 1,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const log = dailyRows.find(r => r.date === dStr);
      grid.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        log,
      });
    }

    return grid;
  }, [calendarDate, dailyRows]);

  // Goals progress percentage calculation
  const goalsProgress = useMemo(() => {
    const earnPercent = Math.min(100, Math.round((analyticsSummary.monthlyEarnings / goals.targetEarnings) * 100)) || 0;
    const hourPercent = Math.min(100, Math.round((analyticsSummary.monthlyHours / goals.targetHours) * 100)) || 0;
    return { earnPercent, hourPercent };
  }, [analyticsSummary, goals]);

  // Dynamic SVG Chart paths
  const chartPath = useMemo(() => {
    if (dailyRows.length === 0) return "";
    const padding = 30;
    const width = 600;
    const height = 150;
    
    // Sort oldest first for trending
    const chron = [...dailyRows].reverse().slice(-14);
    if (chron.length < 2) return "";

    const maxVal = Math.max(...chron.map(c => c.workedMinutes / 60)) || 8;
    
    return chron.map((c, i) => {
      const x = padding + (i / (chron.length - 1)) * (width - 2 * padding);
      const val = c.workedMinutes / 60;
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }, [dailyRows]);

  // Dynamic earnings trends path
  const earningsPath = useMemo(() => {
    if (dailyRows.length === 0) return "";
    const padding = 30;
    const width = 600;
    const height = 150;
    
    const chron = [...dailyRows].reverse().slice(-14);
    if (chron.length < 2) return "";

    const maxVal = Math.max(...chron.map(c => c.estimatedEarnings)) || 1000;
    
    return chron.map((c, i) => {
      const x = padding + (i / (chron.length - 1)) * (width - 2 * padding);
      const val = c.estimatedEarnings;
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }, [dailyRows]);

  // Dynamic ticking button states
  const dtrButtonsConfig = useMemo(() => {
    const isClockedIn = todayRow && todayRow.timeIn && !todayRow.timeOut;
    const isOnBreak = todayRow?.status === "On break";

    // 1. Find today's shift schedule
    const todayKey = getLocalDateString(currentTime);
    const todayShift = schedules.find((s) => s.date === todayKey);
    
    // 2. Check if today's shift is not finished yet
    const shiftNotFinished = todayShift && isBeforeEndTime(todayShift.shift_end);

    return {
      canTimeIn: !isClockedIn && (!todayRow || !todayRow.timeOut),
      canBreakIn: isClockedIn && !isOnBreak,
      canBreakOut: isClockedIn && isOnBreak,
      canTimeOut: isClockedIn, // Let it be clickable so early click triggers the helpful toast warning!
      shiftNotFinished: !!shiftNotFinished,
      todayShiftEnd: todayShift?.shift_end || null,
    };
  }, [todayRow, schedules, currentTime]);

  if (loading && rawRecords.length === 0) {
    return <SkeletonLoader />;
  }

  return (
    <PageTransition>
      <main className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-[#060D17] font-sans text-slate-100 md:flex-row pb-24 md:pb-0">
        <div className="galaxy-bg" />
        <div className="noise-overlay" />

        {/* Modular Navigation & Header Wrapper */}
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

        {/* --- MAIN WORKSPACE AREA --- */}
        <section className="relative z-10 flex w-full min-w-0 flex-1 flex-col pb-28 md:max-h-screen md:overflow-y-auto md:pb-10 custom-scrollbar">
          
          {/* Released Payslip Notification Alert */}
          {releasedPayslipAlert && (
            <div className="flex flex-col gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-base">🎉</span>
                <span className="min-w-0 leading-5">
                  Your payslip for <strong>{releasedPayslipAlert.period}</strong> (Net Pay: PHP {Number(releasedPayslipAlert.netPay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) has been approved and released by Admin! You can now print/download it.
                </span>
              </div>
              <button 
                onClick={() => {
                  setPayrollStart(releasedPayslipAlert.startDate);
                  setPayrollEnd(releasedPayslipAlert.endDate);
                  setActiveTab("payroll");
                }}
                className="self-start text-[10px] font-black uppercase tracking-wider text-emerald-400 underline hover:text-emerald-300 sm:self-auto cursor-pointer"
              >
                Go to Payslip
              </button>
            </div>
          )}

          {/* TOP ALERTS (Incomplete Record Notification) */}
          {analyticsSummary.incompleteRecords.length > 0 && (
            <div className="flex flex-col gap-3 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs font-semibold text-yellow-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <AlertCircle size={15} className="text-yellow-400 shrink-0" />
                <span className="min-w-0 leading-5">
                  Reminder: You have {analyticsSummary.incompleteRecords.length} DTR record(s) without a Time Out. Click logs to correct.
                </span>
              </div>
              <button 
                onClick={() => {
                  setActiveTab("history");
                  setHistoryStatusFilter("incomplete");
                }}
                className="self-start text-[10px] font-bold uppercase tracking-wider underline hover:text-white sm:self-auto"
              >
                Resolve Now
              </button>
            </div>
          )}

          {/* HEADER BAR */}
          <header className="flex min-w-0 flex-col gap-3 border-b border-white/5 bg-slate-950/20 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                {role === "employee" ? "EMPLOYEE ACCOUNT" : "PERSONAL PORTAL"}
              </span>
              <h1 className="text-xl font-black text-white leading-tight capitalize">{activeTab.replace("_", " ")}</h1>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end sm:gap-4">
              <span className="hidden sm:inline text-xs text-slate-400">
                Shift: <span className="font-bold text-slate-200">{settings.shiftStartTime || "None"}</span> ({settings.graceMinutes}m grace)
              </span>
              {isOnline ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-[10px] font-bold uppercase text-emerald-300 border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 rounded-full">
                    Cloud Synced
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  <span className="text-[10px] font-bold uppercase text-amber-300 border border-amber-400/20 bg-amber-400/5 px-2.5 py-1 rounded-full" title="All operations are cached locally and will sync once internet returns.">
                    Offline Mode
                  </span>
                </>
              )}
            </div>
          </header>

          {/* TAB CONTENTS */}
          <div className="mx-auto w-full max-w-[1180px] min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12"
                >
                  <PersonalWelcomeCard
                    currentTime={currentTime}
                    todayRow={todayRow}
                    dtrButtonsConfig={dtrButtonsConfig}
                    submitting={submitting}
                    onClockAction={handleClockAction}
                    role={role}
                  />

                  {role !== "employee" && (
                    <PersonalAnalytics
                      analyticsSummary={analyticsSummary}
                      goals={goals}
                      goalsProgress={goalsProgress}
                    />
                  )}

                  <PersonalRecordsTable
                    recentOnly={true}
                    dailyRows={dailyRows}
                    setActiveTab={setActiveTab}
                    role={role}
                  />
                </motion.div>
              )}

              {/* ATTENDANCE HISTORY TAB */}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <PersonalRecordsTable
                    recentOnly={false}
                    filteredHistoryRows={filteredHistoryRows}
                    historyFilter={historyFilter}
                    setHistoryFilter={setHistoryFilter}
                    historyStart={historyStart}
                    setHistoryStart={setHistoryStart}
                    historyEnd={historyEnd}
                    setHistoryEnd={setHistoryEnd}
                    historySearch={historySearch}
                    setHistorySearch={setHistorySearch}
                    historyStatusFilter={historyStatusFilter}
                    setHistoryStatusFilter={setHistoryStatusFilter}
                    onAddLogClick={() => role === "employee" ? setShowCorrectionModal(true) : setShowAddModal(true)}
                    onExportCsv={handleExportCsv}
                    onPrintDtr={handlePrintDtr}
                    onEditRow={(row) => role === "employee" ? setShowCorrectionModal(true) : openEditRow(row)}
                    onDeleteRow={handleDeleteRow}
                    role={role}
                    onFileLeaveClick={() => setShowLeaveModal(true)}
                  />
                </motion.div>
              )}

              {/* CALENDAR VIEW TAB */}
              {activeTab === "calendar" && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <PersonalScheduler
                    calendarDate={calendarDate}
                    setCalendarDate={setCalendarDate}
                    calendarDays={calendarDays}
                    currentTime={currentTime}
                    openEditRow={openEditRow}
                    diaryNotes={diaryNotes}
                    onOpenDiary={(dateStr) => {
                      setSelectedDiaryDate(dateStr);
                      setDiaryText(diaryNotes[dateStr] || "");
                      setShowDiaryModal(true);
                    }}
                    role={role}
                  />
                </motion.div>
              )}

              {/* STATS & INSIGHTS TAB */}
              {activeTab === "analytics" && (
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
              )}

              {/* PREFERENCES / SETTINGS TAB */}
              {activeTab === "settings" && (
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
                          className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
                        />
                      </label>

                      <label className="grid gap-1.5 text-xs text-slate-400">
                        Overtime Increment Block
                        <select
                          id="overtimeIncrementBlock"
                          name="overtimeIncrementBlock"
                          value={settings.overtimeIncrementBlock}
                          onChange={(e) => setSettings({ ...settings, overtimeIncrementBlock: Number(e.target.value) })}
                          disabled={role === "employee"}
                          className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-50"
                        >
                          <option value={1}>1 Minute (Continuous)</option>
                          <option value={15}>15 Minutes (Quarter-hour)</option>
                          <option value={30}>30 Minutes (Half-hour)</option>
                          <option value={60}>60 Minutes (Hourly)</option>
                        </select>
                      </label>

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
                          className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
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
                          className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white disabled:opacity-50"
                        />
                      </label>
                    </div>

                    {/* Paid Breaks checkbox removed from general settings */}

                    <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 space-y-3">
                      <label className="grid gap-1.5 text-xs text-slate-400">
                        Standard Unpaid Break Duration (Docked Time)
                        <select
                          id="breakDurationMinutes"
                          name="breakDurationMinutes"
                          value={settings.breakDurationMinutes}
                          onChange={(e) => setSettings({ ...settings, breakDurationMinutes: Number(e.target.value) })}
                          disabled={role === "employee"}
                          className="h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 disabled:opacity-50"
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
                              className="h-10 px-4 rounded-xl bg-slate-950 border border-rose-500/20 text-xs text-white focus:border-rose-500 outline-none max-w-xs"
                            />
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={handleClearAllRecords}
                              disabled={submitting || deleteConfirmText !== "DELETE"}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition"
                            >
                              Yes, Purge Everything
                            </button>
                            <button
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
                          onClick={() => setIsDeletingAll(true)}
                          className="px-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 rounded-xl text-xs font-bold text-rose-300 transition active:scale-95"
                        >
                          Clear All DTR Logs
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <PersonalProfileCard
                    profile={profile}
                    user={user}
                    profileForm={profileForm}
                    setProfileForm={setProfileForm}
                    updatingProfile={updatingProfile}
                    handleSaveProfile={handleSaveProfile}
                    handleProfilePhotoChange={handleProfilePhotoChange}
                    handleRemoveProfilePhoto={handleRemoveProfilePhoto}
                    setActiveTab={setActiveTab}
                    subscriptionTier={subscriptionTier}
                    setSubscriptionTier={setSubscriptionTier}
                  />
                </motion.div>
              )}

              {activeTab === "schedule" && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  {/* Top Header Card */}
                  <div className="flex flex-col justify-between gap-4 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4 backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Shifting Calendar</span>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Work Schedule Planner</h2>
                      <p className="text-xs text-slate-400 mt-1">Visually plan your shifting calendar. Customized shift start and end times dynamically calculate daily lateness and pay!</p>
                    </div>
                    {role !== "employee" && (
                      <div className="flex w-full items-center gap-3 sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setShowPresetModal(true)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-[0_0_15px_rgba(52,211,153,0.25)] transition hover:bg-emerald-400 active:scale-95 sm:w-auto"
                        >
                          <Sparkles size={13} />
                          Weekly Presets
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Week Picker Navigation */}
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                        className="p-2 border border-white/5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
                        title="Previous Week"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentWeekOffset(0)}
                        className="px-3 py-1 border border-white/5 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
                      >
                        Current Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                        className="p-2 border border-white/5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
                        title="Next Week"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="text-xs font-extrabold leading-5 text-slate-400 sm:text-right">
                      Week Range:{" "}
                      <span className="text-white">
                        {weekDaysList[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
                        {weekDaysList[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* 7-Days Weekly Shift Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {weekDaysList.map((dayDate, idx) => {
                      const dateStr = getLocalDateString(dayDate);
                      const dayShift = schedules.find(s => s.date === dateStr);
                      const isToday = dateStr === getLocalDateString(currentTime);

                      const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
                      const dateLabel = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                      const hasShift = !!dayShift;
                      const isRestDay = hasShift && (dayShift.label || "").toUpperCase().includes("REST");

                      return (
                        <div
                          key={dateStr}
                          className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative group flex flex-col justify-between min-h-[160px] ${
                            isToday
                              ? "border-emerald-500/35 bg-emerald-500/[0.02] shadow-[0_0_20px_rgba(52,211,153,0.06)]"
                              : "border-white/5 hover:border-emerald-500/20 bg-slate-900/30"
                          }`}
                        >
                          <div>
                            {/* Day Header */}
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-black tracking-wider ${isToday ? "text-emerald-400" : "text-slate-300"}`}>
                                {dayName} {isToday && "• Today"}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">{dateLabel}</span>
                            </div>

                            {/* Shift Block */}
                            <div className="mt-4">
                              {hasShift ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: dayShift.color || "#10b981" }}
                                    />
                                    <span className="text-xs font-black text-white">{dayShift.label || "Work Shift"}</span>
                                  </div>
                                  
                                  {isRestDay ? (
                                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded inline-block">
                                      Rest Day
                                    </div>
                                  ) : (
                                    <div className="text-[11px] font-bold text-emerald-300">
                                      {formatTime12(dayShift.shift_start)} - {formatTime12(dayShift.shift_end)}
                                    </div>
                                  )}

                                  {dayShift.notes && dayShift.notes.replace(/\[PAID_BREAK\]/g, "").trim() && (
                                    <p className="text-[10px] text-slate-500 italic mt-1 truncate max-w-[190px]" title={dayShift.notes.replace(/\[PAID_BREAK\]/g, "").trim()}>
                                      "{dayShift.notes.replace(/\[PAID_BREAK\]/g, "").trim()}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Default Shift</span>
                                  <span className="block text-xs font-extrabold text-slate-400">
                                    {formatTime12(settings.shiftStartTime)} ({settings.expectedWorkHours} Hours)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hover action overlay & Quick Clears */}
                          {role !== "employee" && (
                            <div className="mt-5 flex gap-2 justify-end">
                              {hasShift && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteShift(dayShift.id)}
                                  className="px-2 py-1 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-lg text-[10px] font-bold text-rose-300 transition"
                                >
                                  Clear
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedScheduleDate(dateStr);
                                  const rawNotes = dayShift?.notes || "";
                                  const hasPaidBreak = rawNotes.includes("[PAID_BREAK]");
                                  
                                  // Parse work type from notes, with fallback to label
                                  let parsedWorkType = "regular";
                                  if (rawNotes.includes("[REST_DAY]")) parsedWorkType = "rest_day";
                                  else if (rawNotes.includes("[REG_HOLIDAY]")) parsedWorkType = "regular_holiday";
                                  else if (rawNotes.includes("[SPL_HOLIDAY]")) parsedWorkType = "special_holiday";
                                  else if (dayShift) {
                                    const labelUpper = (dayShift.label || "").toUpperCase();
                                    if (labelUpper.includes("REST") || labelUpper.includes("REST DAY")) parsedWorkType = "rest_day";
                                    else if (labelUpper.includes("REGULAR HOLIDAY") || labelUpper.includes("REG HOLIDAY")) parsedWorkType = "regular_holiday";
                                    else if (labelUpper.includes("SPECIAL HOLIDAY") || labelUpper.includes("SPL HOLIDAY")) parsedWorkType = "special_holiday";
                                  }

                                  const cleanNotesVal = rawNotes
                                    .replace(/\[PAID_BREAK\]/g, "")
                                    .replace(/\[REST_DAY\]|\[REG_HOLIDAY\]|\[SPL_HOLIDAY\]/g, "")
                                    .trim();

                                  setScheduleForm({
                                    id: dayShift?.id || null,
                                    shiftStart: dayShift?.shift_start || settings.shiftStartTime || "09:00",
                                    shiftEnd: dayShift?.shift_end || "18:00",
                                    label: dayShift?.label || "Day Shift",
                                    color: dayShift?.color || "#10b981",
                                    notes: cleanNotesVal,
                                    breakIsPaid: hasPaidBreak,
                                    workType: parsedWorkType,
                                  });
                                  setShowShiftModal(true);
                                }}
                                className="px-3 py-1 border border-white/5 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg text-[10px] font-bold text-slate-300 transition"
                              >
                                {hasShift ? "Edit Shift" : "Assign Shift"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}


              {/* PAYROLL RECORDS TAB */}
              {activeTab === "payroll" && (
                (subscriptionTier === "free" && role !== "employee") ? (
                  <motion.div
                    key="payroll-gate"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="mx-auto max-w-3xl"
                  >
                    <div className="relative overflow-hidden glass-panel border-cyan-500/20 bg-slate-950/40 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(6,182,212,0.08)] border-2 backdrop-blur-xl text-center">
                      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
                      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.25)] animate-pulse">
                          <DollarSign size={40} className="stroke-[1.5]" />
                        </div>
                        
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/35 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                          Solo Pro Feature
                        </span>
                        
                        <h2 className="mt-5 text-2xl sm:text-3xl font-black text-white leading-tight">
                          Unlock <span className="gradient-text">Estimated Pay</span> & PDF Payslips
                        </h2>
                        
                        <p className="mt-4 max-w-lg text-slate-400 text-xs sm:text-sm leading-relaxed">
                          Upgrade to <strong className="text-white">Solo Pro</strong> to track your real-time accumulated earnings, overtime pay, late docking calculations, custom contributions, and print corporate-ready PDF payslips.
                        </p>

                        <div className="mt-8 w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-left space-y-4">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">What you get in Solo Pro:</h4>
                          <ul className="grid gap-3 text-xs text-slate-300">
                            <li className="flex items-center gap-3">
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                              <span>Real-Time Basic & Overtime earnings projection</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                              <span>Cutoff late docking based on grace period settings</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                              <span>Unlimited custom deductions (SSS loan, advances, taxes)</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">✓</span>
                              <span>Export and print premium corporate PDF payslips</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem("trackly_mock_subscription_tier", "pro");
                              setSubscriptionTier("pro");
                              addToast("Congratulations! You have upgraded to Solo Pro (Demo Mode).", "success");
                            }}
                            className="glow-button px-8 py-4 rounded-2xl text-xs font-black text-white shadow-lg active:scale-95 transition cursor-pointer"
                          >
                            Try Solo Pro (Demo Upgrade)
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-black text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/5 transition cursor-pointer"
                          >
                            View Subscription Plans
                          </button>
                        </div>
                        <p className="mt-4 text-[10px] text-slate-500">
                          Demo Mode: Click "Try Solo Pro" to instantly simulate the upgraded premium state!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="payroll"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    {role === "employee" && workspace ? (
                      <div className="space-y-6">
                        {/* Company Name Header Card */}
                        <div className="relative overflow-hidden glass-panel border-white/10 bg-gradient-to-r from-slate-950/70 via-slate-900/50 to-cyan-950/20 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
                          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/5 rounded-full blur-[80px]" />
                          <div className="relative z-10 space-y-2">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                              🏢 {workspace?.workspace_name || workspace?.name || "Workspace Connected"}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Official Payslips</h2>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                              Tingnan at i-print ang iyong mga opisyal na payslip na inilabas ng iyong tagapamahala.
                            </p>
                          </div>
                        </div>

                        {/* Payslips List */}
                        <PayslipsCard profile={profile} onViewPayslip={setSelectedPayslip} />
                      </div>
                    ) : (
                      <PersonalPayrollCalculator
                        payrollStart={payrollStart}
                        setPayrollStart={setPayrollStart}
                        payrollEnd={payrollEnd}
                        setPayrollEnd={setPayrollEnd}
                        payrollSummary={payrollSummary}
                        settings={settings}
                        payrollDeductions={payrollDeductions}
                        addPayrollDeduction={addPayrollDeduction}
                        removePayrollDeduction={removePayrollDeduction}
                        updatePayrollDeduction={updatePayrollDeduction}
                        handlePrintPayslip={handlePrintPayslip}
                        role={role}
                        payslipStatus={payslipStatus}
                        loadingPayslipStatus={loadingPayslipStatus}
                        handleRequestPayslip={handleRequestPayslip}
                      />
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
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
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400">
                      More
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                      Personal tools
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300"
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
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
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
                          <span className="block text-xs font-black">
                            {item.label}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            Open page
                          </span>
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-3 text-xs font-black text-rose-300"
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
                    className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.14)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.7 : 2.2} />
                    <span className="max-w-full truncate text-[10px] font-black">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all ${
                  mobileMenuOpen ||
                  ["schedule", "analytics", "settings", "profile"].includes(activeTab)
                    ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.14)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Menu size={19} />
                <span className="max-w-full truncate text-[10px] font-black">
                  More
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* --- EDIT ATTENDANCE RECORD MODAL --- */}
        <EditRecordModal
          isOpen={showEditModal && selectedDateRow}
          onClose={() => setShowEditModal(false)}
          editForm={editForm}
          setEditForm={setEditForm}
          onSubmit={handleSaveEdit}
          submitting={submitting}
        />

        {/* --- EMPLOYEE CORRECTION MODAL --- */}
        {showCorrectionModal && (
          <CorrectionModal
            employee={profile}
            onClose={() => setShowCorrectionModal(false)}
            onSaved={() => {
              fetchRecords();
            }}
          />
        )}

        {/* --- EMPLOYEE LEAVE REQUEST MODAL --- */}
        {showLeaveModal && (
          <LeaveRequestModal
            onClose={() => setShowLeaveModal(false)}
            onSaved={() => {
              // Optionally do something
            }}
          />
        )}

        {/* --- ADD NEW MANUAL ATTENDANCE RECORD MODAL --- */}
        <AddRecordModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          addForm={addForm}
          setAddForm={setAddForm}
          onSubmit={handleAddRecord}
          submitting={submitting}
        />

        {/* --- PERSONAL DIARY & REMINDERS MODAL --- */}
        <DiaryRemindersModal
          isOpen={showDiaryModal}
          onClose={() => setShowDiaryModal(false)}
          selectedDate={selectedDiaryDate}
          diaryText={diaryText}
          setDiaryText={setDiaryText}
          onSave={handleSaveDiaryNote}
        />

        {/* --- SIMPLE PER-ROW TRASH CONFIRMATION DIALOG --- */}
        <DeleteConfirmationModal
          isOpen={!!confirmDeleteId}
          confirmDeleteId={confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={handleDeleteRow}
        />

        {/* --- EDIT / ASSIGN SINGLE SHIFT MODAL --- */}
        <EditShiftModal
          isOpen={showShiftModal}
          onClose={() => setShowShiftModal(false)}
          selectedScheduleDate={selectedScheduleDate}
          scheduleForm={scheduleForm}
          setScheduleForm={setScheduleForm}
          onSubmit={handleSaveShift}
          submitting={submitting}
        />

        {/* --- WEEKLY PRESETS BATCH WIZARD MODAL --- */}
        <WeeklyPresetWizardModal
          isOpen={showPresetModal}
          onClose={() => setShowPresetModal(false)}
          weekDaysList={weekDaysList}
          presetForm={presetForm}
          setPresetForm={setPresetForm}
          onSubmit={handleGeneratePreset}
          submitting={submitting}
        />

        {/* --- WORKSPACE CONNECTION WARNING MODAL --- */}
        <AnimatePresence>
          {showConnectModal && (
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
                    Your attendance records, work schedule, payroll-related records, and activity may become visible to your admin.
                  </p>
                  <p>
                    Some features will be restricted or controlled by your admin. Your private calendar notes/diary should remain personal unless explicitly shared.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 text-center">
                    Type exactly <span className="text-rose-300 font-extrabold font-mono">I Agree</span> to confirm connection:
                  </label>
                  <input
                    type="text"
                    value={agreeText}
                    onChange={(e) => setAgreeText(e.target.value)}
                    placeholder="Type I Agree"
                    className="h-11 w-full rounded-xl bg-slate-950 border border-white/10 text-center text-xs text-white outline-none focus:border-rose-500 transition font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConnectModal(false);
                      setAgreeText("");
                    }}
                    className="h-11 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
                  >
                    I Disagree (Cancel)
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmConnect}
                    disabled={connecting || agreeText.trim().toLowerCase().replace(/\s+/g, ' ') !== "i agree"}
                    className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {connecting ? "Connecting..." : "I Agree (Connect)"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- WORKSPACE DISCONNECTION WARNING MODAL --- */}
        <AnimatePresence>
          {showDisconnectModal && (
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
                    You will instantly lose access to the company's schedules, custom holidays, DTR tracking dashboards, announcements, and payslips.
                  </p>
                  <p>
                    Ensure you have communicated this action with your workspace administrator or manager before proceeding.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 text-center">
                    Type exactly <span className="text-rose-300 font-extrabold font-mono">I Disconnect</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={disconnectAgreeText}
                    onChange={(e) => setDisconnectAgreeText(e.target.value)}
                    placeholder="Type I Disconnect"
                    className="h-11 w-full rounded-xl bg-slate-950 border border-white/10 text-center text-xs text-white outline-none focus:border-rose-500 transition font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisconnectModal(false);
                      setDisconnectAgreeText("");
                    }}
                    className="h-11 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDisconnect}
                    disabled={disconnecting || disconnectAgreeText.trim().toLowerCase().replace(/\s+/g, ' ') !== "i disconnect"}
                    className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {disconnecting ? "Disconnecting..." : "Confirm Disconnect"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* --- FACE VERIFICATION MODALS --- */}
        {modal === "face-registration" && (
          <FaceRegistrationModal
            onRegister={handleRegisterFace}
            onClose={() => setModal(null)}
          />
        )}

        {modal === "camera-biometric" && (
          <CameraBiometricModal
            employee={{
              id: profile?.id || "",
              fullName: profile?.full_name || "Employee",
              facePhoto: profile?.face_photo || localStorage.getItem(`trackly_local_face_photo_${profile.id}`) || "",
            }}
            enabledTimeButtons={[
              { label: pendingAction === "time_in" ? "Time In" : "Time Out", field: pendingAction }
            ]}
            onRecordAction={async (field, photo) => {
              setModal(null);
              setPendingAction(null);
              await handleClockAction(field, photo);
            }}
            onClose={() => {
              setModal(null);
              setPendingAction(null);
            }}
          />
        )}

        {/* Ephemeral Biometric DTR Proof Watermarked Card */}
        {ephemeralSelfie && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-cyan-400/30 bg-[#0B1424]/95 p-6 shadow-[0_0_40px_rgba(6,182,212,0.35)] text-center flex flex-col items-center">
              {/* Purge Indicator Badge */}
              <div className="absolute top-3.5 right-4 text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                EPHEMERAL PROOF
              </div>

              <h4 className="text-sm font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                ⚡ {ephemeralActionName} SUCCESSFUL
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                I-download ang watermarked proof. Ito ay mabubura sa memorya pagkatapos ng 10 segundo!
              </p>

              {/* Mirrored Canvas capture preview */}
              <div className="relative mt-4 h-60 w-60 rounded-2xl overflow-hidden border border-cyan-400/20 shadow-2xl bg-slate-950">
                <img 
                  src={ephemeralSelfie} 
                  alt="Biometric DTR Watermarked Selfie" 
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Progress Count Countdown */}
              <div className="w-full mt-5 text-left">
                <div className="flex justify-between items-center text-[10px] font-black text-cyan-400/90 mb-1.5 uppercase tracking-wider">
                  <span>Auto-Purging in {ephemeralSelfieCountdown}s...</span>
                  <span>{ephemeralSelfieCountdown * 10}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-1000 shadow-[0_0_10px_#22d3ee]" 
                    style={{ width: `${ephemeralSelfieCountdown * 10}%` }}
                  />
                </div>
              </div>

              {/* Download Trigger */}
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = ephemeralSelfie;
                  link.download = `Trackly_DTR_Proof_${ephemeralActionName.replace(" ", "_")}_${new Date().toISOString().slice(0, 10)}.jpg`;
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
                onClick={() => setEphemeralSelfie(null)}
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

        <HelpSystem role="personal" />
      </main>
    </PageTransition>
  );
}

export default PersonalDashboardPage;

