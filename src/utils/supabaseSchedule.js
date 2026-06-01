import { supabase } from "../lib/supabaseClient";

/**
 * Fetch all shift schedules assigned to workspace members
 * @param {string} workspaceId - The unique ID of the workspace
 * @returns {Promise<Array>} List of schedule objects
 */
export async function fetchWorkspaceSchedules(workspaceId) {
  if (!supabase || !workspaceId) return [];

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching workspace schedules:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch assigned schedules for the current logged-in employee
 * @param {string} workspaceId - The unique ID of the workspace
 * @param {string} userId - The unique ID of the employee
 * @returns {Promise<Array>} List of schedule objects for this employee
 */
export async function fetchMySchedules(workspaceId, userId) {
  if (!supabase || !workspaceId || !userId) return [];

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching employee schedules:", error);
    throw error;
  }

  return data || [];
}

/**
 * Insert or update a daily schedule entry (Upserts automatically on unique conflict (user_id, date))
 * @param {object} payload - The schedule details (workspace_id, user_id, date, shift_start, shift_end, label, color, notes)
 * @returns {Promise<object>} The saved schedule object
 */
export async function saveSchedule({
  id,
  workspace_id,
  user_id,
  date,
  shift_start,
  shift_end,
  label,
  color,
  notes,
}) {
  if (!supabase || !workspace_id || !user_id || !date) {
    throw new Error("Missing required parameters for saving schedule.");
  }

  const payload = {
    workspace_id,
    user_id,
    date,
    shift_start,
    shift_end,
    label: label || "Day Shift",
    color: color || "#06b6d4",
    notes: notes || null,
  };

  if (id) {
    payload.id = id;
  }

  const { data, error } = await supabase
    .from("schedules")
    .upsert(payload, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a scheduled shift
 * @param {string} scheduleId - Unique ID of the schedule record
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteSchedule(scheduleId) {
  if (!supabase || !scheduleId) {
    throw new Error("Missing schedule record ID for deletion.");
  }

  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }

  return true;
}

/**
 * Helper to convert standard Date objects to local YYYY-MM-DD strings without timezone shift.
 * @param {Date} dateObj
 * @returns {string} YYYY-MM-DD
 */
export function toLocalISOString(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Resolves start/end dates for the current payroll cutoff
 * @param {string} payrollPeriod - "semi-monthly" or "monthly"
 * @param {Date} [referenceDate] - optional reference date (defaults to today)
 * @returns {object} { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
export function getCurrentCutoffRange(payrollPeriod = "semi-monthly", referenceDate = new Date()) {
  const period = (payrollPeriod || "semi-monthly").toLowerCase();
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = referenceDate.getDate();

  let start, end;

  if (period === "semi-monthly") {
    if (date <= 15) {
      start = new Date(year, month, 1);
      end = new Date(year, month, 15);
    } else {
      start = new Date(year, month, 16);
      end = new Date(year, month + 1, 0);
    }
  } else {
    // monthly
    start = new Date(year, month, 1);
    end = new Date(year, month + 1, 0);
  }

  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
}

/**
 * Resolves start/end dates for the previous payroll cutoff
 * @param {string} payrollPeriod - "semi-monthly" or "monthly"
 * @param {Date} [referenceDate] - optional reference date (defaults to today)
 * @returns {object} { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
export function getPreviousCutoffRange(payrollPeriod = "semi-monthly", referenceDate = new Date()) {
  const period = (payrollPeriod || "semi-monthly").toLowerCase();
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = referenceDate.getDate();

  let start, end;

  if (period === "semi-monthly") {
    if (date <= 15) {
      start = new Date(year, month - 1, 16);
      end = new Date(year, month, 0);
    } else {
      start = new Date(year, month, 1);
      end = new Date(year, month, 15);
    }
  } else {
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0);
  }

  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
}

