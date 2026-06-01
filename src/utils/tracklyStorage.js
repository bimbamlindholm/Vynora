const keys = {
  corrections: "trackly_correction_requests",
  announcements: "trackly_announcements",
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
