import { Link } from "react-router-dom";
import { navItems } from "./employeeConstants";
import { Users } from "lucide-react";

export default function EmployeeHeader({ onLogout, activeTab, setActiveTab, isManagerOrSupervisor, permissions = {} }) {
  let items = [...navItems];
  if (isManagerOrSupervisor) {
    items.splice(4, 0, ["My Team", Users]);
  }

  // Filter based on admin employee permissions
  items = items.filter(([item]) => {
    if (item === "Announcements" && !permissions.announcements) return false;
    if (item === "Correction Requests" && !permissions.correctionRequests && !permissions.leaveRequests) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111F]/80 px-3 py-3 backdrop-blur-2xl sm:px-6 lg:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link to="/employee-dashboard" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img src="/trackly-logo.png" alt="Trackly" className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <div className="min-w-0 leading-none">
            <span className="block truncate text-lg font-black sm:text-2xl">TRACKLY</span>
            <span className="hidden text-[0.56rem] font-bold uppercase tracking-[0.28em] text-cyan-300 sm:block">
              Employee Portal
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {items.map(([item]) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => setActiveTab && setActiveTab(item)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-black transition-all duration-300 ${
                  isActive
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                    : "border-white/10 text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-300/5 hover:text-white"
                }`}
                type="button"
              >
                {item}
              </button>
            );
          })}
        </nav>

        <button
          className="shrink-0 rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-xs font-bold text-rose-100 transition hover:bg-rose-400/20 sm:px-5 sm:py-3 sm:text-sm"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
