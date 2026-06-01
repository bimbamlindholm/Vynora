import { navItems } from "./employeeConstants";
import { Users } from "lucide-react";

const shortLabels = {
  "Dashboard": "Home",
  "My Attendance": "Clock",
  "My Schedule": "Schedule",
  "Correction Requests": "Requests",
  "My Team": "Team",
  "My Profile": "Profile",
  "Announcements": "Alerts",
};

export default function EmployeeMobileNav({ activeTab, setActiveTab, isManagerOrSupervisor, permissions = {} }) {
  let items = [...navItems];
  if (isManagerOrSupervisor) {
    // Insert My Team before My Profile (index 4)
    items.splice(4, 0, ["My Team", Users]);
  }

  // Filter based on admin employee permissions
  items = items.filter(([label]) => {
    if (label === "Announcements" && !permissions.announcements) return false;
    if (label === "Correction Requests" && !permissions.correctionRequests && !permissions.leaveRequests) return false;
    return true;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07111F]/92 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl lg:hidden">
      <div
        className="scrollbar-none grid overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(4.35rem, 1fr))` }}
      >
        {items.map(([label, Icon]) => {
          const isActive = activeTab === label;
          const displayLabel = shortLabels[label] || label;
          
          return (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`grid min-h-[52px] place-items-center gap-0.5 rounded-xl px-1 py-1.5 transition-all duration-300 ${
                isActive
                  ? "text-cyan-400 bg-cyan-400/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  : "text-slate-400 hover:text-cyan-200 hover:bg-cyan-300/5"
              }`}
              type="button"
            >
              <Icon 
                size={20} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" 
                    : "scale-100"
                }`} 
              />
              <span className="mt-0.5 max-w-full truncate text-[10px] font-semibold tracking-wide">{displayLabel}</span>
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
