import { supabase } from "../lib/supabaseClient";

/**
 * Fetches all announcements for a given workspace, newest first.
 */
export async function fetchAnnouncements(workspaceId) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*, created_by_profile:profiles(full_name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Creates a new announcement for the workspace (admin only).
 */
export async function createAnnouncement({ workspaceId, title, body, adminId }) {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      workspace_id: workspaceId,
      title,
      body,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes an announcement by ID (admin only).
 */
export async function deleteAnnouncement(id) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
