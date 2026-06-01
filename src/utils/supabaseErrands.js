import { supabase } from "../lib/supabaseClient";

/**
 * Fetch all field errands for a specific workspace (Admins only)
 * @param {string} workspaceId - Unique ID of the workspace
 * @returns {Promise<Array>} List of errands with user profiles
 */
export async function fetchWorkspaceErrands(workspaceId) {
  if (!supabase || !workspaceId) return [];

  const { data, error } = await supabase
    .from("field_errands")
    .select(`
      *,
      user:profiles(id, full_name, email, position, face_photo)
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workspace errands:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch field errands for a specific employee
 * @param {string} workspaceId - Unique ID of the workspace
 * @param {string} userId - Unique ID of the employee
 * @returns {Promise<Array>} List of errands logged by the employee
 */
export async function fetchEmployeeErrands(workspaceId, userId) {
  if (!supabase || !workspaceId || !userId) return [];

  const { data, error } = await supabase
    .from("field_errands")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching employee errands:", error);
    throw error;
  }

  return data || [];
}

/**
 * Log the start of an out-of-store errand
 * @param {object} params - { workspaceId, userId, errandType, purpose, startLat, startLng }
 * @returns {Promise<object>} The newly created errand record
 */
export async function startErrand({
  workspaceId,
  userId,
  errandType,
  purpose,
  startLat,
  startLng,
}) {
  if (!supabase || !workspaceId || !userId) {
    throw new Error("Missing required parameters to start errand.");
  }

  const { data, error } = await supabase
    .from("field_errands")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      errand_type: errandType,
      purpose: purpose || null,
      status: "started",
      start_latitude: startLat || null,
      start_longitude: startLng || null,
      start_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error starting errand:", error);
    throw error;
  }

  return data;
}

/**
 * Log arrival/checkpoint at the target destination (e.g. Bank)
 * @param {object} params - { errandId, arrivalLat, arrivalLng, photoUrlOrBase64 }
 * @returns {Promise<object>} The updated errand record
 */
export async function arriveAtErrand({
  errandId,
  arrivalLat,
  arrivalLng,
  photoUrlOrBase64,
}) {
  if (!supabase || !errandId) {
    throw new Error("Missing errand ID to log arrival.");
  }

  const { data, error } = await supabase
    .from("field_errands")
    .update({
      status: "arrived",
      arrival_latitude: arrivalLat || null,
      arrival_longitude: arrivalLng || null,
      arrival_photo: photoUrlOrBase64 || null,
      arrival_time: new Date().toISOString(),
    })
    .eq("id", errandId)
    .select()
    .single();

  if (error) {
    console.error("Error logging errand arrival:", error);
    throw error;
  }

  return data;
}

/**
 * Log errand completion and return to active store duty
 * @param {object} params - { errandId, endLat, endLng, notes }
 * @returns {Promise<object>} The completed errand record
 */
export async function completeErrand({
  errandId,
  endLat,
  endLng,
  notes,
}) {
  if (!supabase || !errandId) {
    throw new Error("Missing errand ID to complete errand.");
  }

  // First fetch start time to calculate total elapsed duration
  const { data: errand, error: fetchError } = await supabase
    .from("field_errands")
    .select("start_time")
    .eq("id", errandId)
    .single();

  if (fetchError) throw fetchError;

  const endTime = new Date();
  const startTime = new Date(errand.start_time);
  const durationMinutes = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 60000));

  const { data, error } = await supabase
    .from("field_errands")
    .update({
      status: "completed",
      end_latitude: endLat || null,
      end_longitude: endLng || null,
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      notes: notes || null,
    })
    .eq("id", errandId)
    .select()
    .single();

  if (error) {
    console.error("Error completing errand:", error);
    throw error;
  }

  return data;
}
