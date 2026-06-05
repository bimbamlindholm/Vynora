// Helper for formatting time (HH:MM AM/PM)
export function formatTime12(timeStr) {
  if (!timeStr) return "-";
  try {
    let h, m;
    // Check if it's a full ISO timestamp or date-time string
    if (timeStr.includes("T") || (timeStr.includes("-") && timeStr.includes(":"))) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        h = date.getHours();
        m = date.getMinutes();
      }
    }
    
    // Fallback to simple HH:MM splitting
    if (h === undefined || m === undefined) {
      const [hStr, mStr] = timeStr.split(":");
      h = parseInt(hStr);
      m = parseInt(mStr);
    }
    
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    if (h === 0 && m === 0) return "00:00"; // Treat midnight 00:00 as "00:00"
    
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  } catch {
    return timeStr;
  }
}

// Helper to get YYYY-MM-DD
export function getLocalDateString(date = new Date()) {
  const local = new Date(date);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to get local time in HH:MM format for time inputs
export function getLocalTime24(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return ""; // Treat 00:00 midnight as empty/null
  const hStr = String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  return `${hStr}:${mStr}`;
}

// Helper to convert local date and 24h time selection cleanly to a UTC ISO string
export function toUTCISO(dateStr, timeStr) {
  if (!dateStr || !timeStr || timeStr === "00:00") return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return isNaN(localDate.getTime()) ? "" : localDate.toISOString();
  } catch {
    return "";
  }
}

// Helper to determine if current time is before a scheduled shift end time (handles HH:MM 24h and AM/PM formats)
export function isBeforeEndTime(endTimeStr) {
  if (!endTimeStr || endTimeStr === "00:00") return false;
  try {
    const now = new Date();
    let hours = 0;
    let minutes = 0;
    
    const cleanStr = endTimeStr.trim().toLowerCase();
    const isPm = cleanStr.includes("pm");
    const isAm = cleanStr.includes("am");
    
    const digitsOnly = cleanStr.replace(/am|pm/g, "").trim();
    const timeParts = digitsOnly.split(":");
    
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      
      if (isPm && hours < 12) {
        hours += 12;
      } else if (isAm && hours === 12) {
        hours = 0;
      }
    } else {
      hours = parseInt(digitsOnly, 10);
      if (isNaN(hours)) return false;
    }
    
    if (isNaN(hours) || isNaN(minutes)) return false;
    
    const shiftEndToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return now.getTime() < shiftEndToday.getTime();
  } catch (e) {
    console.error("Failed to parse shift end time:", e);
    return false;
  }
}

/**
 * Defensive browser localStorage wrappers.
 * Prevents runtime application crashes when localStorage is full, blocked in incognito tabs,
 * or disabled by strict browser cookie security policies.
 */
export const safeLocalStorage = {
  getItem: (key, fallback = "") => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key) || fallback;
      }
    } catch (e) {
      console.warn(`[Vynora Developer Warning] localStorage.getItem failed for key "${key}":`, e);
    }
    return fallback;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, val);
      }
    } catch (e) {
      console.error(`[Vynora Developer Error] localStorage.setItem failed for key "${key}":`, e);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`[Vynora Developer Error] localStorage.removeItem failed for key "${key}":`, e);
    }
  }
};

/**
 * A beautiful, color-coded console logging utility designed specifically for human developers.
 * Provides clear, visual diagnostic trails of application cycles, payroll calculations,
 * and database sync states directly in the browser's DevTools console.
 */
export const VynoraDeveloperLogger = {
  log: (moduleName, message, data = null, level = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[Vynora Developer Diagnostic - ${timestamp}] [${moduleName.toUpperCase()}]`;
    
    const colors = {
      info: "color: #10b981; font-weight: bold;", // emerald green
      warn: "color: #f59e0b; font-weight: bold;", // amber yellow
      error: "color: #ef4444; font-weight: bold; background-color: #2c1a1a; padding: 2px 6px; border-radius: 4px; border: 1px solid #7f1d1d;" // high contrast red
    };

    const style = colors[level] || colors.info;

    if (level === "error") {
      console.error(`%c${prefix} ${message}`, style, data || "");
    } else if (level === "warn") {
      console.warn(`%c${prefix} ${message}`, style, data || "");
    } else {
      console.log(`%c${prefix} ${message}`, style, data || "");
    }
  }
};
