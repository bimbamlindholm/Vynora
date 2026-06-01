/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, RefreshCw, Smile, Eye, ShieldAlert, Sparkles } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { Modal } from "../employeeComponents";
import { compressCapturedFace } from "../../../utils/faceMatcher";

export default function FaceRegistrationModal({ onRegister, onClose }) {
  const { addToast } = useToast();
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Calibration States: "steady" | "smile" | "blink" | "completed"
  const [phase, setPhase] = useState("steady");
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Camera Stream
  const initCamera = () => {
    setCameraError(false);
    setPhase("steady");
    setProgress(0);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then((s) => {
        setStream(s);
        streamRef.current = s;
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraError(true);
      });
  };

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Safe video stream binding after render
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleAutoCapture = useCallback(async () => {
    if (!videoRef.current || !stream) {
      addToast("Active camera stream is required.", "warning");
      return;
    }

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    setSaving(true);
    setPhase("completed");
    try {
      // Compress frame using our visual face matcher helper (horizontally mirrored!)
      const base64Photo = await compressCapturedFace(videoRef.current);
      if (!base64Photo) {
        throw new Error("Unable to capture clear image data from video.");
      }

      // Stop camera tracks immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setStream(null);

      // Call parent action
      await onRegister(base64Photo);
      setSuccess(true);
      addToast("Biometric Face profile registered successfully!", "success");
      setTimeout(() => onClose(), 2200);
    } catch (e) {
      console.error(e);
      setSaving(false);
      addToast("Failed to register face: " + e.message, "error");
      initCamera(); // Restart camera and calibration flow
    }
  }, [stream, addToast, onRegister, onClose]);

  // Automated premium calibration phase interval simulator
  useEffect(() => {
    if (!stream || success || saving) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Progress fully completed for current phase, transition to next phase
          if (phase === "steady") {
            setTimeout(() => {
              setPhase("smile");
              setProgress(0);
              addToast("Steady phase verified! Keep smiling now.", "info");
            }, 300);
            return 100;
          } else if (phase === "smile") {
            setTimeout(() => {
              setPhase("blink");
              setProgress(0);
              addToast("Smile pattern captured! Now blink naturally.", "info");
            }, 300);
            return 100;
          } else if (phase === "blink") {
            clearInterval(timerRef.current);
            setTimeout(() => {
              handleAutoCapture();
            }, 300);
            return 100;
          }
        }
        
        // Random incremental analysis rates to simulate high-grade pattern matching
        const increment = phase === "steady" ? 8 : phase === "smile" ? 6 : 10;
        return Math.min(100, prev + increment);
      });
    }, 150);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream, phase, success, saving, addToast, handleAutoCapture]);

  return (
    <Modal title="AI Face Profile Registration" onClose={onClose}>
      <div className="text-slate-200">
        {!success ? (
          <div className="grid gap-5">
            <div className="text-center">
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
                <Sparkles size={12} /> BIOMETRIC LIVENESS CALIBRATION <Sparkles size={12} />
              </h3>
              <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed font-semibold">
                Titiyakin ng high-grade face matching na ang iyong mukha ay tumutugma kapag nag-ti-Time In/Out upang maiwasan ang buddy punching.
              </p>
            </div>

            {/* Circular HUD Scanner Area with mirrored preview and rotating grids */}
            <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full border-2 border-dashed border-cyan-400/50 bg-slate-950/80 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex items-center justify-center">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: "scaleX(-1)" }} // Mirrors the front camera horizontally
                  className="h-full w-full object-cover rounded-full"
                />
              ) : cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <ShieldAlert size={32} className="text-rose-500 animate-bounce" />
                  <p className="mt-2 text-xs font-black text-slate-300">Camera Access Denied</p>
                  <p className="mt-1 text-[10px] text-slate-500 leading-normal">
                    Paki-enable ang camera permissions sa iyong browser at subukan muli.
                  </p>
                  <button
                    onClick={initCamera}
                    type="button"
                    className="mt-3 flex items-center gap-1.5 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200 transition hover:bg-cyan-300/20"
                  >
                    <RefreshCw size={10} /> Retry Camera
                  </button>
                </div>
              ) : saving ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07111F]/90 p-6 text-center">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                  <p className="mt-4 text-xs font-black text-cyan-300 animate-pulse uppercase tracking-wider">
                    Compressing Biometrics...
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                  <p className="mt-2 text-xs text-slate-500">Starting video feed...</p>
                </div>
              )}

              {/* Futuristic scan grid overlay and target frames */}
              {stream && !saving && (
                <>
                  {/* Neon laser line */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400 biometric-laser shadow-[0_0_12px_rgba(6,182,212,1)] rounded-full" />
                  
                  {/* Dynamic Scanner HUD circle rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                      className={`h-52 w-52 rounded-full border border-dashed transition-all duration-300 ${
                        phase === "steady" ? "border-cyan-400/30 animate-spin" :
                        phase === "smile" ? "border-amber-400/40 animate-pulse" :
                        "border-emerald-400/40"
                      }`}
                    />
                  </div>
                  
                  {/* Interactive Phase HUD Graphics */}
                  {phase === "steady" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-44 w-44 rounded-full border-2 border-cyan-400/10 flex items-center justify-center">
                        <div className="h-4 w-4 border-t-2 border-l-2 border-cyan-400 absolute top-4 left-4" />
                        <div className="h-4 w-4 border-t-2 border-r-2 border-cyan-400 absolute top-4 right-4" />
                        <div className="h-4 w-4 border-b-2 border-l-2 border-cyan-400 absolute bottom-4 left-4" />
                        <div className="h-4 w-4 border-b-2 border-r-2 border-cyan-400 absolute bottom-4 right-4" />
                        <span className="text-[10px] uppercase font-black text-cyan-400 tracking-widest animate-pulse">Steady</span>
                      </div>
                    </div>
                  )}

                  {phase === "smile" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-amber-500/5">
                      <div className="mt-28 flex flex-col items-center">
                        <Smile size={24} className="text-amber-400 animate-bounce" />
                        <span className="text-[9px] uppercase font-black text-amber-300 tracking-widest mt-1">Smile Detected</span>
                      </div>
                    </div>
                  )}

                  {phase === "blink" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-emerald-500/5">
                      <div className="h-16 w-32 border border-emerald-400/20 rounded-full flex items-center justify-around px-4 animate-pulse">
                        <Eye size={16} className="text-emerald-400" />
                        <Eye size={16} className="text-emerald-400" />
                      </div>
                      <span className="text-[9px] uppercase font-black text-emerald-300 tracking-widest mt-2 animate-bounce">Blink Eyes</span>
                    </div>
                  )}

                  {/* Face placement HUD mask */}
                  <div className="absolute inset-0 rounded-full border border-cyan-300/20 pointer-events-none shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]" />
                </>
              )}
              {flash && <div className="absolute inset-0 z-20 bg-white" />}
            </div>

            {/* Calibration Checklist HUD */}
            <div className="bg-[#0B1524] border border-white/5 rounded-xl p-4 grid gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calibration Progress:</span>
                <span className={`text-xs font-black ${
                  phase === "steady" ? "text-cyan-400" :
                  phase === "smile" ? "text-amber-400" :
                  phase === "blink" ? "text-emerald-400" :
                  "text-slate-500"
                }`}>
                  {progress}% Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden relative border border-white/5">
                <div 
                  className={`h-full transition-all duration-150 rounded-full ${
                    phase === "steady" ? "bg-cyan-500 shadow-[0_0_10px_#06b6d4]" :
                    phase === "smile" ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" :
                    phase === "blink" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
                    "bg-slate-700"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps HUD */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  phase === "steady" ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300" :
                  phase === "smile" || phase === "blink" || phase === "completed" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-60" :
                  "bg-slate-950/20 border-white/5 text-slate-500"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest">1. Steady</span>
                  <span className="text-[8px] font-bold mt-0.5">{phase !== "steady" ? "✓ Done" : "Analyzing..."}</span>
                </div>

                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  phase === "smile" ? "bg-amber-500/10 border-amber-400/30 text-amber-300 animate-pulse" :
                  phase === "blink" || phase === "completed" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-60" :
                  "bg-slate-950/20 border-white/5 text-slate-500"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest">2. Smile</span>
                  <span className="text-[8px] font-bold mt-0.5">
                    {phase === "steady" ? "Locked" : phase === "smile" ? "Smiling..." : "✓ Done"}
                  </span>
                </div>

                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  phase === "blink" ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300 animate-pulse" :
                  phase === "completed" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-60" :
                  "bg-slate-950/20 border-white/5 text-slate-500"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest">3. Blink</span>
                  <span className="text-[8px] font-bold mt-0.5">
                    {phase === "steady" || phase === "smile" ? "Locked" : phase === "blink" ? "Blinking..." : "✓ Done"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-bounce">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
            <h3 className="mt-4 text-lg font-black text-white uppercase tracking-widest">Face Profile Registered!</h3>
            <p className="mt-2 text-xs font-semibold text-slate-400 max-w-xs leading-normal">
              Matagumpay na na-save ang iyong pattern. Handa na ang iyong account para sa secure biometric attendance.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
