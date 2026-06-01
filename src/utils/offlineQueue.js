import { getActionLabel, getActionStatus, formatRecordTime, todayKey } from "./supabaseAttendance";

const QUEUE_KEY = "trackly_offline_attendance_queue";

/**
 * Retrieves the current offline queue for the logged-in user.
 */
export function getOfflineQueue(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${QUEUE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read offline queue:", error);
    return [];
  }
}

/**
 * Saves a new clock action to the user's offline queue.
 */
export function enqueueOfflineAction(userId, { action, comment, overtimeReason, latitude, longitude, verificationPhoto }) {
  if (!userId) return null;
  const queue = getOfflineQueue(userId);
  const timestamp = new Date().toISOString();

  const newAction = {
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    action,
    comment: comment || "",
    overtimeReason: overtimeReason || "",
    latitude: latitude != null ? Number(latitude) : null,
    longitude: longitude != null ? Number(longitude) : null,
    timestamp,
    date: todayKey(new Date(timestamp)),
    verificationPhoto: verificationPhoto || "",
  };

  queue.push(newAction);
  try {
    localStorage.setItem(`${QUEUE_KEY}_${userId}`, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save offline queue:", error);
  }
  return newAction;
}

/**
 * Empties the user's offline queue.
 */
export function clearOfflineQueue(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(`${QUEUE_KEY}_${userId}`);
  } catch (error) {
    console.error("Failed to clear offline queue:", error);
  }
}

/**
 * Removes a specific synchronized action from the queue.
 */
export function removeOfflineAction(userId, actionId) {
  if (!userId || !actionId) return;
  const queue = getOfflineQueue(userId);
  const filtered = queue.filter((item) => item.id !== actionId);
  try {
    localStorage.setItem(`${QUEUE_KEY}_${userId}`, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to update offline queue:", error);
  }
}

/**
 * Merges Supabase-fetched attendance events with locally pending offline actions.
 * This guarantees the user's dashboard matches their offline actions in real-time.
 */
export function mergeRecordsWithOffline(fetchedRecords, offlineQueue, profile) {
  if (!profile) return fetchedRecords;

  const normalizedOffline = offlineQueue.map((item) => {
    return {
      ...item,
      userId: profile.id,
      employeeId: profile.id,
      employeeName: profile.full_name || "Employee",
      employeeEmail: profile.email || "",
      actionLabel: getActionLabel(item.action),
      status: getActionStatus(item.action),
      time: formatRecordTime(item.timestamp),
      overtime_reason: item.overtimeReason,
      isOfflinePending: true,
    };
  });

  // Sort them dynamically when they are mapped in useMemo, but placing them first ensures correct chronological order
  return [...normalizedOffline, ...fetchedRecords];
}
