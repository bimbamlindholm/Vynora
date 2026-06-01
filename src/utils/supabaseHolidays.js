import { supabase } from "../lib/supabaseClient";

/**
 * Fetches all custom holidays registered for a workspace, sorted chronologically by date.
 */
export async function fetchWorkspaceHolidays(workspaceId) {
  if (!supabase || !workspaceId) return [];

  const { data, error } = await supabase
    .from("workspace_holidays")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching workspace holidays:", error);
    throw error;
  }

  return data || [];
}

/**
 * Registers a new custom holiday for a workspace in Supabase.
 */
export async function createWorkspaceHoliday({ workspaceId, date, name, type }) {
  if (!supabase || !workspaceId) throw new Error("Supabase is not initialized or workspace is missing.");

  const { data, error } = await supabase
    .from("workspace_holidays")
    .insert({
      workspace_id: workspaceId,
      date,
      name: name.trim(),
      type,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`May holiday na na-deklara sa petsang ${date}. Burahin muna ang umiiral bago magdagdag ng bago.`);
    }
    console.error("Error creating workspace holiday:", error);
    throw error;
  }

  return data;
}

/**
 * Removes a custom holiday by its ID.
 */
export async function deleteWorkspaceHoliday(id) {
  if (!supabase || !id) throw new Error("Supabase is not initialized or holiday ID is missing.");

  const { error } = await supabase
    .from("workspace_holidays")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting workspace holiday:", error);
    throw error;
  }

  return true;
}
