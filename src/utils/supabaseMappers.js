import { defaultPermissions } from "./permissions";

export const permissionColumns = {
  manualTimeTracking: "manual_time_tracking",
  cameraAttendance: "camera_attendance",
  locationRequired: "location_required",
  faceVerification: "face_verification",
  timeIn: "time_in",
  breakIn: "break_in",
  breakOut: "break_out",
  timeOut: "time_out",
  paidBreakOption: "paid_break_option",
  unpaidBreakOption: "unpaid_break_option",
  requireBreakReason: "require_break_reason",
  employeeComments: "employee_comments",
  correctionRequests: "correction_requests",
  employeePdfExport: "employee_pdf_export",
  salaryEstimate: "salary_estimate",
  leaveRequests: "leave_requests",
  restDayStatus: "rest_day_status",
  announcements: "announcements",
};

export function dbPermissionsToClient(row) {
  const next = { ...defaultPermissions };
  if (!row) return next;

  Object.entries(permissionColumns).forEach(([clientKey, dbKey]) => {
    if (typeof row[dbKey] === "boolean") next[clientKey] = row[dbKey];
  });

  return next;
}

export function clientPermissionsToDb(permissions, workspaceId) {
  const next = workspaceId ? { workspace_id: workspaceId } : {};

  Object.entries(permissionColumns).forEach(([clientKey, dbKey]) => {
    next[dbKey] = Boolean({ ...defaultPermissions, ...permissions }[clientKey]);
  });

  next.updated_at = new Date().toISOString();
  return next;
}

export function profileToEmployee(profile, membership = {}) {
  let localFace = "";
  if (typeof window !== "undefined" && profile?.id) {
    try {
      localFace = localStorage.getItem(`trackly_local_face_photo_${profile.id}`) || "";
    } catch (e) {
      console.warn("localStorage read failed:", e);
    }
  }
  return {
    id: profile?.id || "",
    fullName: profile?.full_name || "Employee",
    email: profile?.email || "",
    role: membership.role || profile?.role || "Employee",
    department: profile?.department || "No department yet",
    position: profile?.position || "No position yet",
    phone: profile?.phone || "",
    address: profile?.address || "",
    hourlyRate: Number(profile?.hourly_rate || 0),
    dailyRate: Number(profile?.daily_rate || 0),
    status: membership.status || "active",
    joinedAt: membership.joined_at || profile?.created_at || "",
    facePhoto: profile?.face_photo || localFace || "",
    subscriptionTier: profile?.subscription_tier || "free",
    subscriptionStatus: profile?.subscription_status || "active",
  };
}

export function workspaceToView(workspace, profile) {
  const createdAt = workspace?.created_at || new Date().toISOString();

  return {
    id: workspace?.id || "",
    adminName: profile?.full_name || "Workspace Admin",
    adminEmail: profile?.email || "",
    adminPhone: profile?.phone || "",
    adminPosition: profile?.position || "Workspace Owner",
    code: workspace?.workspace_code || "TRK-00000",
    companyAddress: workspace?.company_address || "",
    contactNumber: workspace?.contact_number || "",
    createdAt,
    createdDate: new Date(createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    industry: workspace?.industry || "Office Team",
    name: workspace?.workspace_name || "Trackly Workspace",
    shiftStartTime: workspace?.shift_start_time || "08:00",
    expectedWorkHours: Number(workspace?.expected_work_hours || 8),
    lateGraceMinutes: Number(workspace?.late_grace_minutes || 0),
    hourlyRate: Number(workspace?.default_hourly_rate || 0),
    dailyRate: Number(workspace?.default_daily_rate || 0),
    salaryModel: Number(workspace?.default_daily_rate || 0) > 0 ? "daily" : "hourly",
    baseAmount: Number(workspace?.default_daily_rate || 0) > 0 ? Number(workspace?.default_daily_rate || 0) : Number(workspace?.default_hourly_rate || 0),
    overtimeRate: Number(workspace?.overtime_rate || 1.25),
    payrollPeriod: workspace?.payroll_period || "semi-monthly",
    breakHours: Number(workspace?.break_hours ?? 1.0),
    breakIsPaid: Boolean(workspace?.break_is_paid ?? false),
    overtimeThresholdMinutes: Number(workspace?.overtime_threshold_minutes ?? 30),
    customDeductions: workspace?.custom_deductions ?? [],
    holidayRegularRate: Number(workspace?.holiday_regular_rate ?? 2.0),
    holidaySpecialRate: Number(workspace?.holiday_special_rate ?? 1.3),
    nightDiffRate: Number(workspace?.night_diff_rate ?? 0.10),
    geofenceEnabled: Boolean(workspace?.geofence_enabled ?? false),
    geofenceLatitude: workspace?.geofence_latitude != null ? Number(workspace.geofence_latitude) : null,
    geofenceLongitude: workspace?.geofence_longitude != null ? Number(workspace.geofence_longitude) : null,
    geofenceRadiusMeters: Number(workspace?.geofence_radius_meters ?? 100),
    role: "Workspace Owner",
    teamSize: workspace?.team_size || "1-5",
    subscriptionTier: workspace?.subscription_tier || "free",
    subscriptionStatus: workspace?.subscription_status || "active",
    customRulesPresets: workspace?.custom_rules_presets || [],
  };
}
