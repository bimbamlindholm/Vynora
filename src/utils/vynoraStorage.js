// ==========================================
// VYNORA CLIENT-SIDE STORAGE & DEVICE INDEXEDDB MANAGER
// ==========================================

const DB_NAME = "vynora_db";
const STORE_NAME = "vynora_media";

/**
 * Initializes browser-native IndexedDB database on the user's mobile or desktop device.
 * Exposes huge local data capacity (gigabytes of storage) to bypass server costs.
 */
export function initVynoraDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported by this browser environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Saves heavy media (e.g. Base64 biometric references or DTR selfie proofs)
 * directly to the user's local mobile device storage.
 */
export async function setLocalMedia(key, base64Data) {
  try {
    const db = await initVynoraDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(base64Data, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("[Vynora Media Storage Error] Failed to write local IndexedDB media:", e);
    return false;
  }
}

/**
 * Retrieves heavy media from the user's local mobile device storage.
 */
export async function getLocalMedia(key, fallback = "") {
  try {
    const db = await initVynoraDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || fallback);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("[Vynora Media Storage Error] Failed to read local IndexedDB media:", e);
    return fallback;
  }
}

/**
 * Deletes media from the user's local mobile device storage to conserve space.
 */
export async function removeLocalMedia(key) {
  try {
    const db = await initVynoraDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("[Vynora Media Storage Error] Failed to delete local IndexedDB media:", e);
    return false;
  }
}

const keys = {
  corrections: "vynora_correction_requests",
  announcements: "vynora_announcements",
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Vynora Storage Error] Failed writing JSON to key "${key}":`, e);
  }
}

export function getCorrectionRequests() {
  return readJson(keys.corrections, []);
}

export function saveCorrectionRequests(requests) {
  writeJson(keys.corrections, requests);
}

export function getAnnouncements() {
  return readJson(keys.announcements, []);
}

export function saveAnnouncements(announcements) {
  writeJson(keys.announcements, announcements);
}

export function exportCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
