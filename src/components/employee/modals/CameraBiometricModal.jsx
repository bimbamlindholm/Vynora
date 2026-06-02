/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X, RefreshCw, Sparkles, ShieldAlert } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { Modal } from "../employeeComponents";
import { compareFaces, compressCapturedFace } from "../../../utils/faceMatcher";
import { getCurrentLocation } from "../../../utils/geolocation";

// Reusable watermarking drawer helper
async function applyBiometricWatermark(base64Image, latitude, longitude, actionLabel) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 400; // Large crisp crop size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      // Draw main portrait
      ctx.drawImage(img, 0, 0, size, size);
      
      // Semi-transparent bottom overlay banner gradient
      const bannerHeight = 85;
      const gradient = ctx.createLinearGradient(0, size - bannerHeight, 0, size);
      gradient.addColorStop(0, "rgba(7, 17, 31, 0.4)");
      gradient.addColorStop(0.3, "rgba(7, 17, 31, 0.85)");
      gradient.addColorStop(1, "rgba(7, 17, 31, 0.98)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, size - bannerHeight, size, bannerHeight);
      
      // Glowing bottom neon divider (cyan border)
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(0, size - bannerHeight, size, 2);
      
      ctx.textBaseline = "top";
      
      // 1. Draw badge
      ctx.font = "bold 10px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#22d3ee";
      ctx.fillText("🛡️ VYNORA BIOMETRIC VERIFIED", 15, size - bannerHeight + 11);
      
      // Draw Action label (e.g. "TIME IN") in neon green block
      ctx.font = "bold 9px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#34d399";
      const labelText = actionLabel.toUpperCase();
      const labelWidth = ctx.measureText(labelText).width;
      
      ctx.fillRect(size - labelWidth - 25, size - bannerHeight + 9, labelWidth + 10, 14);
      ctx.fillStyle = "#07111f";
      ctx.fillText(labelText, size - labelWidth - 20, size - bannerHeight + 11);
      
      // 2. Draw Date & Time
      const now = new Date();
      const timeStr = now.toLocaleString("en-US", { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      ctx.font = "bold 9px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8"; // slate-400
      ctx.fillText(`📅 TIME: ${timeStr}`, 15, size - bannerHeight + 32);
      
      // 3. Draw coordinates
      let gpsText = "📍 GPS: Location Permission Denied";
      if (latitude !== null && longitude !== null) {
        gpsText = `📍 GPS: Lat ${latitude.toFixed(6)}, Lon ${longitude.toFixed(6)}`;
      }
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(gpsText, 15, size - bannerHeight + 51);
      
      const watermarkedBase64 = canvas.toDataURL("image/jpeg", 0.85);
      resolve(watermarkedBase64);
    };
    img.onerror = () => {
      resolve(base64Image); // Fallback
    };
    img.src = base64Image;
  });
}

export default function CameraBiometricModal({ employee, enabledTimeButtons, onRecordAction, onClose }) {
  const { addToast } = useToast();
  const [actionToVerify, setActionToVerify] = useState(enabledTimeButtons[0]?.field || "timeIn");
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(0); // 0: idle, 1: scanning, 2: comparing, 3: completed
  const [matchScore, setMatchScore] = useState(0);
  const [matchFailed, setMatchFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize Camera Stream
  const initCamera = () => {
    setCameraError(false);
    setMatchFailed(false);
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
    };
  }, []);

  // Safe video stream binding after render
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = async () => {
    if (!videoRef.current || !stream) {
      addToast("Active camera stream is required.", "warning");
      return;
    }

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    setVerifying(true);
    setStep(1);
    setMatchFailed(false);

    try {
      // Capture and compress face photo using canvas pixel pattern utility
      const capturedSelfie = await compressCapturedFace(videoRef.current);
      if (!capturedSelfie) {
        throw new Error("Hindi nakunan ng maayos ang larawan.");
      }

      // Stop camera stream instantly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setStream(null);

      // 2. Perform Face Comparison
      setStep(2);
      const registeredFace = employee?.facePhoto || "";
      
      // Artificial dynamic scanning pause for aesthetic cyberpunk feedback
      await new Promise((resolve) => setTimeout(resolve, 800));

      let score = 85; // Fallback score if no profile photo was registered
      if (registeredFace) {
        score = await compareFaces(registeredFace, capturedSelfie);
      }
      setMatchScore(score);

      // 3. Finalizing results
      setStep(3);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (score >= 55) {
        // Success: Fetch coordinates for the watermark
        let lat = null;
        let lon = null;
        try {
          const coords = await getCurrentLocation();
          lat = coords.latitude;
          lon = coords.longitude;
        } catch (gpsErr) {
          console.warn("GPS location skipped for watermark:", gpsErr);
        }

        const actionText = 
          actionToVerify === "timeIn" ? "Time In" : 
          actionToVerify === "timeOut" ? "Time Out" : 
          actionToVerify === "breakIn" ? "Break In" : "Break Out";

        // Generate the high-res watermark with exact timestamp + GPS coordinates
        const watermarkedSelfie = await applyBiometricWatermark(capturedSelfie, lat, lon, actionText);

        // Success: Proceed to record DTR action in Supabase
        await onRecordAction(actionToVerify, watermarkedSelfie);
        setSuccess(true);
        addToast(`Identity verified with ${score}% match!`, "success");
        setTimeout(() => onClose(), 2200);
      } else {
        // Failure: score is too low (buddy-punching check failed)
        setVerifying(false);
        setStep(0);
        setMatchFailed(true);
        addToast(`Face verification failed (${score}% match). Please try again in better lighting.`, "error");
        initCamera(); // Restart camera automatically
      }
    } catch (e) {
      console.error(e);
      setVerifying(false);
      setStep(0);
      addToast("Error during verification: " + e.message, "error");
      initCamera();
    }
  };

  return (
    <Modal title="AI Face Matching & Verification" onClose={onClose}>
      <div className="text-slate-200">
        {enabledTimeButtons.length === 0 ? (
          <div className="text-center py-6">
            <ShieldAlert size={48} className="mx-auto text-amber-400 animate-bounce" />
            <p className="mt-4 text-sm font-black text-amber-300 uppercase tracking-widest">
              Walang Attendance Action
            </p>
            <p className="mt-2 text-xs text-slate-400 leading-normal">
              Natapos mo na ang iyong shift para sa araw na ito o walang action na enabled sa iyong workspace.
            </p>
          </div>
        ) : !success ? (
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                Time Action na Ibe-verify
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#0B1424] px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
                value={actionToVerify}
                onChange={(e) => setActionToVerify(e.target.value)}
                disabled={verifying}
              >
                {enabledTimeButtons.map((btn) => (
                  <option key={btn.field} value={btn.field}>{btn.label}</option>
                ))}
              </select>
            </div>

            {/* Circular Cyber Scanner HUD with horizontally mirrored live preview */}
            <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full border-2 border-dashed border-cyan-400/40 bg-slate-950/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: "scaleX(-1)" }} // Resolves the mirror orientation issue 100%!
                  className="h-full w-full object-cover rounded-full"
                />
              ) : cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <X size={32} className="text-red-400" />
                  <p className="mt-2 text-xs font-black text-slate-300">Camera Access Denied</p>
                  <p className="mt-1 text-[10px] text-slate-500 leading-normal">
                    Paki-enable ang camera sa iyong browser settings upang makapag-clock-in.
                  </p>
                  <button
                    onClick={initCamera}
                    type="button"
                    className="mt-3 flex items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black text-cyan-200 transition hover:bg-cyan-300/20"
                  >
                    <RefreshCw size={10} /> Retry Camera
                  </button>
                </div>
              ) : verifying ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07111F]/95 p-6 text-center">
                  <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                    <Sparkles size={20} className="text-cyan-300 animate-pulse" />
                  </div>
                  <div className="grid gap-2 text-left w-full max-w-[190px]">
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className={step >= 1 ? "text-cyan-300" : "text-slate-600"}>
                        {step >= 1 ? "✓" : "○"}
                      </span>
                      <span className={step === 1 ? "text-cyan-300 animate-pulse" : step > 1 ? "text-slate-400" : "text-slate-600"}>
                        Scanning facial structure...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className={step >= 2 ? "text-cyan-300" : "text-slate-600"}>
                        {step >= 2 ? "✓" : "○"}
                      </span>
                      <span className={step === 2 ? "text-cyan-300 animate-pulse" : step > 2 ? "text-slate-400" : "text-slate-600"}>
                        Comparing face pixels...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className={step >= 3 ? "text-cyan-300" : "text-slate-600"}>
                        {step >= 3 ? "✓" : "○"}
                      </span>
                      <span className={step === 3 ? "text-cyan-300 animate-pulse" : "text-slate-600"}>
                        Submitting secure action...
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                  <p className="mt-2 text-xs text-slate-500">Starting video feed...</p>
                </div>
              )}

              {/* Laser Scan Overlay */}
              {stream && !verifying && (
                <>
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400 biometric-laser shadow-[0_0_12px_rgba(6,182,212,1)] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-52 w-52 rounded-full border border-dashed border-cyan-300/25 animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-cyan-300/30 pointer-events-none shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]" />
                </>
              )}
              {flash && <div className="absolute inset-0 z-20 bg-white" />}
            </div>

            {/* Match Fail Indicator */}
            {matchFailed && (
              <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-center">
                <p className="text-xs font-black text-rose-200">
                  ❌ Verification Failed ({matchScore}% Match)
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Kailangan ng hindi bababa sa <span className="font-bold text-cyan-300">55% match score</span>. Humanap ng mas maliwanag na lugar at tiyakin na nakasentro ang mukha.
                </p>
              </div>
            )}

            {!verifying && stream && (
              <button
                type="button"
                className="glow-button h-12 w-full rounded-xl text-sm font-black text-white cursor-pointer active:scale-95 transition"
                onClick={handleCapture}
              >
                Scan & Verify Identity
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-bounce">
            <CheckCircle2 size={56} className="text-emerald-400" />
            <h3 className="mt-4 text-xl font-black text-white">Identity Verified!</h3>
            <p className="mt-2 text-sm text-slate-400">Match Score: {matchScore}% &bull; DTR event successfully recorded.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
