import { supabase } from "../lib/supabaseClient";

/**
 * Creates a new audit log record in Supabase.
 */
export async function createAuditLog({ workspaceId, userId, action, details = {} }) {
  if (!supabase || !workspaceId || !userId) return null;
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        action,
        details,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to write audit log:", err);
    return null;
  }
}

/**
 * Fetches audit logs for a given workspace.
 */
export async function fetchAuditLogs(workspaceId) {
  if (!supabase || !workspaceId) return [];
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, profile:profiles(full_name, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
