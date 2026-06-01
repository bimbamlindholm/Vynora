import { supabase } from "../lib/supabaseClient";

/**
 * Fetches all leave requests for a workspace (admin view).
 */
export async function fetchWorkspaceLeaves(workspaceId, { supervisorId } = {}) {
  if (!supabase || !workspaceId) return [];

  let query = supabase
    .from("leave_requests")
    .select("*, profile:profiles!user_id(full_name, email)")
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
  return data || [];
}

/**
 * Fetches leave requests for a specific employee.
 */
export async function fetchMyLeaves(userId) {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Creates a new leave request (employee).
 */
export async function createLeaveRequest({ workspaceId, userId, leaveType, startDate, endDate, reason }) {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!workspaceId || !userId) throw new Error("Workspace ID and User ID are required.");

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Approves or rejects a leave request (admin).
 */
export async function updateLeaveStatus(id, status, adminId) {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!id) throw new Error("Leave request ID is required.");

  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
