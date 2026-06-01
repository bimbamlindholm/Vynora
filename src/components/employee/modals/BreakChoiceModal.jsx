import { Coffee, Clock3 } from "lucide-react";
import { Modal } from "../employeeComponents";

export default function BreakChoiceModal({ onClose, onSelect }) {
  return (
    <Modal title="Choose Break Type" onClose={onClose}>
      <div className="text-slate-200">
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Please select the type of break you wish to take. Your choice will be logged with today's attendance record.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => onSelect("paid")}
            className="flex flex-col items-center justify-between text-left p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-400/40 hover:bg-emerald-500/[0.08] transition-all duration-300 hover:-translate-y-1 group"
            type="button"
          >
            <div className="flex w-full items-start justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-300 group-hover:bg-emerald-500/20 transition-colors">
                <Coffee size={24} />
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                Paid rest
              </span>
            </div>
            <div className="mt-5 w-full">
              <h3 className="text-lg font-black text-white group-hover:text-emerald-100 transition-colors">Paid Break</h3>
              <p className="mt-2 text-xs text-slate-400 leading-5">
                Standard 15-minute rest period. Keeps active session hours tracking.
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelect("unpaid")}
            className="flex flex-col items-center justify-between text-left p-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.04] hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:border-cyan-400/40 hover:bg-cyan-500/[0.08] transition-all duration-300 hover:-translate-y-1 group"
            type="button"
          >
            <div className="flex w-full items-start justify-between">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-300 group-hover:bg-cyan-500/20 transition-colors">
                <Clock3 size={24} />
              </div>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200">
                Unpaid lunch
              </span>
            </div>
            <div className="mt-5 w-full">
              <h3 className="text-lg font-black text-white group-hover:text-cyan-100 transition-colors">Meal Break</h3>
              <p className="mt-2 text-xs text-slate-400 leading-5">
                Standard 1-hour unpaid lunch/dinner. Deducts from total worked hours today.
              </p>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}
