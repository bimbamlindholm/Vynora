import { supabase } from "../lib/supabaseClient";
import { getActionStatus } from "./supabaseAttendance";

/**
 * Merges a YYYY-MM-DD date string and a time string (HH:MM or ISO) into a full ISO timestamp.
 */
function mergeDateAndTime(dateStr, timeStr) {
  if (!timeStr) return new Date().toISOString();
  if (timeStr.includes("T")) return timeStr;

  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, "0");
    const minutes = timeMatch[2];
    // Return full ISO string in UTC or standard timezone representation
    return new Date(`${dateStr}T${hours}:${minutes}:00`).toISOString();
  }
  
  try {
    return new Date(`${dateStr}T${timeStr}`).toISOString();
  } catch {
    return new Date(`${dateStr}T00:00:00`).toISOString();
  }
}

/**
 * Fetches all correction requests for a given workspace.
 */
export async function fetchCorrectionRequests(workspaceId, { supervisorId } = {}) {
  if (!supabase || !workspaceId) return [];

  let query = supabase
    .from("attendance_correction_requests")
    .select("*, profile:profiles!user_id(*)")
    .eq("workspace_id", workspaceId);

  if (supervisorId) {
    const { data: subordinates, error: subErr } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("supervisor_id", supervisorId);

    if (subErr) throw subErr;
    if (!subordinates || subordinates.length === 0) {
      return [];
    }

    const subordinateIds = subordinates.map((s) => s.user_id);
    query = query.in("user_id", subordinateIds);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((req) => {
    // Gracefully convert database status to original UI Title Case casing
    let displayStatus = "Pending";
    if (req.status === "approved_by_supervisor") displayStatus = "Approved by Supervisor";
    if (req.status === "approved") displayStatus = "Approved";
    if (req.status === "rejected") displayStatus = "Rejected";

    return {
      id: req.id,
      workspaceId: req.workspace_id,
      employeeId: req.user_id,
      employeeName: req.profile?.full_name || "Employee",
      email: req.profile?.email || "",
      date: req.attendance_date,
      requestType: req.request_type,
      currentValue: req.current_value,
      requestedValue: req.requested_value,
      reason: req.reason,
      status: displayStatus,
      reviewedBy: req.reviewed_by,
      reviewedAt: req.reviewed_at,
      createdAt: req.created_at,
    };
  });
}

/**
 * Submits a new correction request for an employee.
 */
export async function createCorrectionRequest(payload) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { workspaceId, employeeId, date, requestType, currentValue, requestedValue, reason } = payload;

  const { data, error } = await supabase
    .from("attendance_correction_requests")
    .insert({
      workspace_id: workspaceId,
      user_id: employeeId,
      attendance_date: date,
      request_type: requestType,
      current_value: currentValue || "",
      requested_value: requestedValue,
      reason: reason,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Approves or Rejects a correction request, aligning DTR records on Approval.
 */
export async function updateCorrectionRequestStatus(requestId, status, adminId) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const dbStatus = status.toLowerCase(); // approved, rejected

  // 1. Fetch request details to identify date, user, and action type
  const { data: req, error: fetchErr } = await supabase
    .from("attendance_correction_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchErr) throw fetchErr;

  // Guard check: Prevent review actions if the target date is locked under a released payroll cutoff
  const locked = await checkIsDateLocked(req.attendance_date, req.workspace_id);
  if (locked) {
    throw new Error("Action blocked: this date falls within a released payroll cutoff period and is permanently locked.");
  }

  // 2. Update request status in database
  const { error: updateErr } = await supabase
    .from("attendance_correction_requests")
    .update({
      status: dbStatus,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateErr) throw updateErr;

  // Log the correction decision
  try {
    const { createAuditLog } = await import("./supabaseAuditLogs");
    await createAuditLog({
      workspaceId: req.workspace_id,
      userId: adminId,
      action: dbStatus === "approved" ? "correction_approved" : "correction_rejected",
      details: {
        request_id: requestId,
        employee_id: req.user_id,
        date: req.attendance_date,
        request_type: req.request_type,
        requested_value: req.requested_value,
      },
    });
  } catch (logErr) {
    console.error("Failed to write audit log for correction decision:", logErr);
  }

  // 3. If approved, align the DTR attendance record
  if (dbStatus === "approved") {
    const reqType = req.request_type.toLowerCase();
    let action = "";

    if (reqType.includes("time in") || reqType.includes("time_in")) action = "time_in";
    else if (reqType.includes("break in") || reqType.includes("break_in")) action = "break_in";
    else if (reqType.includes("break out") || reqType.includes("break_out")) action = "break_out";
    else if (reqType.includes("time out") || reqType.includes("time_out")) action = "time_out";

    if (action) {
      const correctedTimestamp = mergeDateAndTime(req.attendance_date, req.requested_value);

      // Check if an attendance record already exists for this user, date, and action
      const { data: existingRecord } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("user_id", req.user_id)
        .eq("date", req.attendance_date)
        .eq("action", action)
        .maybeSingle();

      if (existingRecord) {
        // Update the timestamp of the existing record
        const { error: recordErr } = await supabase
          .from("attendance_records")
          .update({
            timestamp: correctedTimestamp,
            status: getActionStatus(action),
          })
          .eq("id", existingRecord.id);

        if (recordErr) throw recordErr;
      } else {
        // Insert a new attendance record representing the corrected entry
        const { error: recordErr } = await supabase
          .from("attendance_records")
          .insert({
            workspace_id: req.workspace_id,
            user_id: req.user_id,
            action,
            status: getActionStatus(action),
            timestamp: correctedTimestamp,
            date: req.attendance_date,
          });

        if (recordErr) throw recordErr;
      }
    }
  }

  return true;
}

/**
 * Checks if a specific date is locked under a released payroll batch.
 */
export async function checkIsDateLocked(date, workspaceId) {
  if (!supabase || !workspaceId || !date) return false;

  const { data, error } = await supabase
    .from("payroll_batches")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("status", "released")
    .lte("start_date", date)
    .gte("end_date", date);

  if (error) {
    console.error("Error checking locked period:", error);
    return false;
  }

  return data && data.length > 0;
}
