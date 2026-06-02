import { ShieldCheck } from "lucide-react";
import { StatusPill } from "./employeeComponents";

export default function WelcomeCard({ employee, permissions, workspace }) {


  return (
    <section className="glass-panel overflow-hidden rounded-2xl p-4 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-cyan-300">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              weekday: "long",
            })}
          </p>
          <h1 className="mt-3 max-w-4xl text-[clamp(1.85rem,10vw,4.75rem)] font-black leading-[1.06] tracking-normal text-white">
            Welcome, <span className="gradient-text break-words inline-flex items-center gap-2">
              {employee.fullName}
            </span>
          </h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-300">
            <StatusPill label={workspace?.workspace_name || "Vynora Workspace"} />
            <StatusPill label={`Status today: ${employee.status || "Offline"}`} />
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100 lg:max-w-sm">
          <div className="flex items-center gap-2 font-black">
            <ShieldCheck size={18} />
            Admin-Controlled
          </div>
          <p className="mt-2 leading-6 text-cyan-50/80">
            Features available here are controlled by your workspace admin.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/80">
            {permissions.manualTimeTracking ? "Time tracking enabled" : "Time tracking hidden"}
          </p>
        </div>
      </div>
    </section>
  );
}
