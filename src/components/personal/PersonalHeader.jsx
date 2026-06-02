import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Briefcase,
  Wallet,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
// Navigation Item for Sidebar
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition duration-300 ${
        active
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.05)]"
          : "bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

const MAIN_MOBILE_TABS = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard },
  { key: "history", label: "Logs", icon: ClipboardList },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "payroll", label: "Payroll", icon: Wallet },
];

const MORE_TABS = [
  { key: "schedule", label: "Work Schedule", icon: Briefcase },
  { key: "analytics", label: "Insights & Trends", icon: TrendingUp },
  { key: "settings", label: "Preferences", icon: Settings },
  { key: "profile", label: "Profile", icon: User },
];

function MobileBottomButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all active:scale-95 ${
        active
          ? "bg-emerald-400/12 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      }`}
    >
      <Icon size={19} strokeWidth={active ? 2.6 : 2.2} />
      <span className="max-w-full truncate text-[10px] font-black leading-none tracking-tight">
        {label}
      </span>
    </button>
  );
}

export default function PersonalHeader({
  activeTab,
  setActiveTab,
  profile,
  role,
  onSignOut,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_TABS.some((item) => item.key === activeTab);

  const goToTab = (tab) => {
    setActiveTab(tab);
    setMoreOpen(false);
  };

  // Filter out payroll and analytics tabs dynamically for employees to hide estimated pay details
  const filteredMainMobileTabs = MAIN_MOBILE_TABS.filter(
    (item) => !(role === "employee" && item.key === "payroll")
  );

  const filteredMoreTabs = MORE_TABS.filter(
    (item) => !(role === "employee" && item.key === "analytics")
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="z-20 hidden w-64 shrink-0 flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur-xl md:flex">
        <div className="mb-4 flex items-center justify-center border-b border-white/5 bg-slate-950/20 px-4 pb-6 pt-8">
          <img
            src="/logo-01.png"
            alt="Vynora Logo"
            className="h-auto max-h-[96px] w-full object-contain"
          />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavItem icon={ClipboardList} label="Attendance Logs" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
          <NavItem icon={CalendarDays} label="Calendar" active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} />
          <NavItem icon={Briefcase} label="Work Schedule" active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} />
          {role !== "employee" && <NavItem icon={Wallet} label="Payroll Records" active={activeTab === "payroll"} onClick={() => setActiveTab("payroll")} />}
          {role !== "employee" && <NavItem icon={TrendingUp} label="Insights & Trends" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />}
          <NavItem icon={Settings} label="Preferences" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="border-t border-white/5 bg-black/10 p-4">
          <div
            onClick={() => setActiveTab("profile")}
            className="group mb-4 flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition hover:bg-white/5 active:scale-98"
            title="View & Edit Profile Information"
          >
            {profile?.face_photo ? (
              <img
                src={profile.face_photo}
                alt="Avatar"
                className="h-8 w-8 rounded-full border border-emerald-400/30 object-cover transition group-hover:border-emerald-400"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20 text-xs font-bold uppercase text-emerald-300 transition group-hover:border-emerald-400">
                {profile?.full_name?.slice(0, 2) || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1 truncate">
              <span className="block truncate text-xs font-bold text-slate-200 transition group-hover:text-emerald-300">
                {profile?.full_name || (role === "employee" ? "Employee Member" : "Personal Member")}
              </span>
              <span className="block truncate text-[10px] text-slate-500">
                {role === "employee" ? "💼 Employee Account" : "👤 Personal Account"}
              </span>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/10 bg-rose-500/5 px-4 py-2 text-xs font-bold text-rose-300 transition duration-300 hover:border-rose-500/30 hover:bg-rose-500/10 active:scale-95"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-slate-950/70 px-4 py-3 backdrop-blur-xl md:hidden">
        <img src="/logo-01.png" alt="Vynora Logo" className="h-12 w-auto object-contain" />

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.25)] transition hover:bg-white/10 active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#07111f]/92 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-18px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[26px] border border-white/8 bg-white/[0.035] p-1">
          {filteredMainMobileTabs.map((item) => (
            <MobileBottomButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              onClick={() => goToTab(item.key)}
            />
          ))}

          <MobileBottomButton
            icon={Menu}
            label="More"
            active={isMoreActive || moreOpen}
            onClick={() => setMoreOpen(true)}
          />
        </div>
      </nav>

      {/* --- MOBILE MORE SHEET --- */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-[32px] border-t border-white/10 bg-[#08111f] p-5 pb-[calc(env(safe-area-inset-bottom)+22px)] shadow-[0_-25px_60px_rgba(0,0,0,0.55)] md:hidden"
            >
              <div className="mx-auto max-w-md">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
                      {role === "employee" ? "Vynora - Employee Portal" : "Vynora - Personal Portal"}
                    </p>
                    <h2 className="mt-1 text-lg font-black text-white">More Options</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMoreOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 active:scale-95"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid gap-2">
                  {filteredMoreTabs.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => goToTab(key)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                        activeTab === key
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/8 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                        <Icon size={18} />
                      </span>
                      <span className="text-sm font-bold">{label}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      onSignOut();
                    }}
                    className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-rose-400/15 bg-rose-500/8 px-4 py-3 text-sm font-black text-rose-300 transition active:scale-[0.98]"
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
