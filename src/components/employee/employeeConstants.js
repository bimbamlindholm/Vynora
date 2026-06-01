import { Bell, Clock3, FilePenLine, Home, UserRound, CalendarDays } from "lucide-react";

export const navItems = [
  ["Dashboard", Home],
  ["My Attendance", Clock3],
  ["My Schedule", CalendarDays],
  ["Correction Requests", FilePenLine],
  ["My Profile", UserRound],
  ["Announcements", Bell],
];

export function formatPeso(value) {
  return `PHP ${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
