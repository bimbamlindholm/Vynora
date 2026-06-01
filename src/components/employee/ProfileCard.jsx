import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function ProfileCard({ employee, onEdit }) {
  // Read workspace mock subscription state and listen for live updates from Admin panel
  const [subTier, setSubTier] = useState(() => {
    return localStorage.getItem("trackly_mock_workspace_subscription_tier") || employee.subscriptionTier || "free";
  });

  useEffect(() => {
    const handleSubChange = () => {
      setSubTier(localStorage.getItem("trackly_mock_workspace_subscription_tier") || "free");
    };
    
    // Listen to changes dispatched by WorkspaceCard mock updates
    window.addEventListener("trackly_workspace_subscription_changed", handleSubChange);
    return () => {
      window.removeEventListener("trackly_workspace_subscription_changed", handleSubChange);
    };
  }, []);

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles size={60} className="text-cyan-300" />
      </div>
      
      <div className="flex items-start gap-4">
        {employee.facePhoto ? (
          <img
            src={employee.facePhoto}
            alt="My Profile"
            className="h-12 w-12 shrink-0 rounded-2xl object-cover border border-cyan-300/30"
          />
        ) : (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-lg font-black text-cyan-100">
            {(employee.fullName || "E").slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-white">My Profile</h2>
            {subTier === "premium" ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-cyan-400/35 bg-cyan-400/15 text-[8px] font-black text-cyan-300 uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                Premium Team
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-slate-600/35 bg-slate-800/50 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Free Team
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">{employee.email}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-slate-300">
        <p className="font-semibold">{employee.department || "No department yet"} | {employee.position || "No position yet"}</p>
        <p className="text-slate-400">{employee.phone || "No phone number yet"}</p>
      </div>
      <button
        className="mt-5 w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20 active:scale-95 cursor-pointer"
        onClick={onEdit}
        type="button"
      >
        Update Details
      </button>
    </section>
  );
}
