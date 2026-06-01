import { useState } from "react";
import { Camera, X } from "lucide-react";
import { Modal } from "../employeeComponents";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

const Facebook = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function ProfileModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(employee);
  const { addToast } = useToast();
  const { user, linkGoogleIdentity, unlinkGoogleIdentity, linkFacebookIdentity, unlinkFacebookIdentity, updatePassword } = useAuth();
  const [linking, setLinking] = useState(false);
  const [manualPassword, setManualPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please upload a valid image file.", "warning");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      addToast("Image must be smaller than 1.5MB to save space.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setForm((curr) => ({ ...curr, facePhoto: base64String }));
      addToast("Profile photo loaded! Click Save to apply.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((curr) => ({ ...curr, facePhoto: "" }));
    addToast("Profile photo removed! Click Save to apply.", "info");
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (manualPassword.length < 6) {
      addToast("Password must be at least 6 characters.", "warning");
      return;
    }
    setUpdatingPassword(true);
    try {
      await updatePassword(manualPassword);
      addToast("Password successfully set for manual login!", "success");
      setManualPassword("");
    } catch (err) {
      addToast(err.message || "Failed to update password.", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const googleIdentity = user?.identities?.find((id) => id.provider === "google");
  const isGoogleConnected = !!googleIdentity;
  const facebookIdentity = user?.identities?.find((id) => id.provider === "facebook");
  const isFacebookConnected = !!facebookIdentity;

  const handleGoogleLink = async (e) => {
    e.preventDefault();
    setLinking(true);
    try {
      if (isGoogleConnected) {
        if (window.confirm("Are you sure you want to disconnect your Google Account? You will need to log in using email & password next time.")) {
          await unlinkGoogleIdentity(googleIdentity.id);
        }
      } else {
        await linkGoogleIdentity();
      }
    } catch (err) {
      console.error("[EmployeeProfile] Failed to change Google linking:", err);
    } finally {
      setLinking(false);
    }
  };

  const handleFacebookLink = async (e) => {
    e.preventDefault();
    setLinking(true);
    try {
      if (isFacebookConnected) {
        if (window.confirm("Are you sure you want to disconnect your Facebook Account? You will need to log in using email & password next time.")) {
          await unlinkFacebookIdentity(facebookIdentity.id);
        }
      } else {
        await linkFacebookIdentity();
      }
    } catch (err) {
      console.error("[EmployeeProfile] Failed to change Facebook linking:", err);
    } finally {
      setLinking(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onSaved(form);
  };

  const fields = ["fullName", "phone", "address", "department", "position", "emergencyContact", "birthday"];

  return (
    <Modal title="Update Profile" onClose={onClose}>
      <form className="grid gap-3" onSubmit={submit}>
        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-2 pb-2 border-b border-white/5">
            <div className="relative group h-20 w-20 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.06)]">
              {form.facePhoto ? (
                <img
                  src={form.facePhoto}
                  alt="Profile"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-black text-xl">
                  {(form.fullName || "E").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div
                onClick={() => document.getElementById("employee-avatar-input").click()}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Camera size={18} className="text-white animate-pulse" />
              </div>
            </div>
            
            <input
              type="file"
              id="employee-avatar-input"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            
            {form.facePhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition"
              >
                <X size={10} />
                Remove Photo
              </button>
            )}
          </div>
          {fields.map((field) => (
            <div key={field} className="grid gap-1">
              <span className="text-xs font-semibold text-slate-400 capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <input
                className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none focus:border-cyan-300/50"
                placeholder={`Enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase().trim()}`}
                value={form[field] || ""}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              />
            </div>
          ))}
        </div>

        {/* Google & Facebook Identity Connection Cards */}
        <div className="mt-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#4285F4]">G</span>
              <div>
                <p className="text-xs font-bold text-white">Google SSO</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {isGoogleConnected ? user?.email : "Not linked"}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={linking}
              onClick={handleGoogleLink}
              className={`h-8 rounded-lg px-3 text-[10px] font-black transition ${
                isGoogleConnected
                  ? "bg-rose-400/10 text-rose-300 hover:bg-rose-400/25"
                  : "bg-[#4285F4]/10 text-white hover:bg-[#4285F4]/20"
              }`}
            >
              {linking ? "Loading..." : isGoogleConnected ? "Disconnect" : "Link Google"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-2">
            <div className="flex items-center gap-2">
              <Facebook size={16} className="text-[#1877F2]" />
              <div>
                <p className="text-xs font-bold text-white">Facebook SSO</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {isFacebookConnected ? user?.email : "Not linked"}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={linking}
              onClick={handleFacebookLink}
              className={`h-8 rounded-lg px-3 text-[10px] font-black transition ${
                isFacebookConnected
                  ? "bg-rose-400/10 text-rose-300 hover:bg-rose-400/25"
                  : "bg-[#1877F2]/10 text-white hover:bg-[#1877F2]/20"
              }`}
            >
              {linking ? "Loading..." : isFacebookConnected ? "Disconnect" : "Link Facebook"}
            </button>
          </div>
        </div>

        {/* Manual Login Password Card */}
        <div className="mt-1 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left">
          <p className="text-xs font-bold text-white mb-1">Manual Login Password</p>
          <p className="text-[10px] text-slate-400 mb-2">Set a password to log in manually with email + password.</p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter password (min 6 chars)"
              value={manualPassword}
              onChange={(e) => setManualPassword(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-white/10 bg-[#0E1726] px-3 text-xs text-white outline-none focus:border-cyan-300/50 transition placeholder:text-slate-500"
            />
            <button
              type="button"
              disabled={updatingPassword || manualPassword.length < 6}
              onClick={handleSetPassword}
              className="h-9 rounded-lg bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 px-3 text-[10px] font-black transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingPassword ? "Saving..." : "Set Password"}
            </button>
          </div>
        </div>

        <button className="glow-button h-12 rounded-xl text-sm font-black text-white mt-2" type="submit">
          Save Profile
        </button>
      </form>
    </Modal>
  );
}
