import { useState } from "react";
import { MapPin, Camera, Check, Clock, UploadCloud, CheckCircle2, ChevronRight } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

export default function FieldErrandTracker({
  activeErrand,
  errandType,
  setErrandType,
  errandPurpose,
  setErrandPurpose,
  errandNotes,
  setErrandNotes,
  setErrandPhoto,
  onStart,
  onArrive,
  onComplete,
  submitting,
}) {
  const { addToast } = useToast();
  const [photoPreview, setPhotoPreview] = useState(activeErrand?.arrival_photo || null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please upload or snap a valid image file.", "warning");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast("Photo must be smaller than 2MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setErrandPhoto(base64String);
      setPhotoPreview(base64String);
      addToast("Verification photo successfully captured!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setErrandPhoto(null);
    setPhotoPreview(null);
  };

  return (
    <div className="glass-panel border-cyan-500/15 bg-slate-950/[0.4] rounded-3xl p-5 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.05)]">
      {/* Background neon accent */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
          <MapPin size={18} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-wide text-white">Out-of-Store Field Errand Logs</h3>
          <p className="text-[10px] font-semibold text-slate-400">Real-time GPS offsite task monitor</p>
        </div>
      </div>

      {/* State A: No Active Errand */}
      {!activeErrand && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onStart();
          }}
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Errand Type</span>
              <select
                className="h-11 rounded-xl border border-white/10 bg-[#07111F]/82 px-3 text-xs font-semibold text-white outline-none focus:border-cyan-300/50 backdrop-blur-md"
                value={errandType}
                onChange={(e) => setErrandType(e.target.value)}
              >
                <option value="Bank Deposit" className="bg-[#0B1424] text-white">🏦 Bank Deposit</option>
                <option value="Supply Run" className="bg-[#0B1424] text-white">🛒 Supply / Inventory Run</option>
                <option value="Client Visit" className="bg-[#0B1424] text-white">🤝 Client / Customer Visit</option>
                <option value="Logistics" className="bg-[#0B1424] text-white">📦 Logistics & Delivery</option>
                <option value="Others" className="bg-[#0B1424] text-white">🌐 Others (Write below)</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Errand Purpose</span>
              <input
                type="text"
                placeholder="e.g. Deposit sales for May 22"
                className="h-11 rounded-xl border border-white/10 bg-[#07111F]/82 px-4 text-xs font-semibold text-white outline-none focus:border-cyan-300/50 backdrop-blur-md"
                value={errandPurpose}
                onChange={(e) => setErrandPurpose(e.target.value)}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="glow-button w-full h-11 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {submitting ? "Logging Location..." : "Start Errand & Record GPS"}
            <ChevronRight size={14} />
          </button>
        </form>
      )}

      {/* State B: Started (En Route) */}
      {activeErrand && activeErrand.status === "started" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="min-w-0 pr-1">
              <p className="text-xs font-black text-amber-200">Errand in Progress: En Route</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
                {activeErrand.errand_type} - {activeErrand.purpose}
              </p>
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock size={11} />
              {new Date(activeErrand.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              {photoPreview ? (
                <div className="relative h-28 w-44 rounded-xl overflow-hidden border border-cyan-500/20 group">
                  <img src={photoPreview} alt="Slip Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400 font-bold text-xs cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full">
                  <UploadCloud size={24} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-300">Take Slip Photo / Snap Upload</span>
                  <span className="text-[9px] text-slate-500">Camera activation supported</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="camera"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>

            <button
              type="button"
              onClick={onArrive}
              disabled={submitting || !photoPreview}
              className={`w-full h-11 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition ${
                photoPreview
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95"
                  : "bg-slate-800 border border-white/5 cursor-not-allowed opacity-40"
              }`}
            >
              <Camera size={14} />
              {submitting ? "Uploading slip..." : "Log Arrival & Upload Verification Slip"}
            </button>
          </div>
        </div>
      )}

      {/* State C: Arrived (At Destination) */}
      {activeErrand && activeErrand.status === "arrived" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onComplete();
          }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div className="min-w-0 pr-1">
              <p className="text-xs font-black text-emerald-200">Arrived & Verified</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
                Locked at destination coords. Complete the task to return.
              </p>
            </div>
            {activeErrand.arrival_photo && (
              <div className="ml-auto h-7 w-10 border border-white/10 rounded-lg overflow-hidden shrink-0">
                <img src={activeErrand.arrival_photo} className="h-full w-full object-cover" alt="Verified slip" />
              </div>
            )}
          </div>

          <label className="grid gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Errand Notes & Reference</span>
            <input
              type="text"
              placeholder="e.g. Deposit confirmed, Reference #987213"
              className="h-11 rounded-xl border border-white/10 bg-[#07111F]/82 px-4 text-xs font-semibold text-white outline-none focus:border-cyan-300/50 backdrop-blur-md"
              value={errandNotes}
              onChange={(e) => setErrandNotes(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-300 to-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            <Check size={14} className="stroke-[3]" />
            {submitting ? "Finishing errand..." : "Complete Errand & Return to Store"}
          </button>
        </form>
      )}
    </div>
  );
}
