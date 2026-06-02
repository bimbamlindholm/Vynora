import { useState, useMemo } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import PageTransition from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { requireSupabase } from "../lib/supabaseClient";

function ResetPasswordPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Evaluate Password Strength in Real Time
  const strengthMetrics = useMemo(() => {
    if (!password) return { score: 0, label: "Enter Password", color: "bg-slate-700" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const styles = [
      { label: "Weak (add standard characters)", color: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" },
      { label: "Fair (combine cases)", color: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" },
      { label: "Good (add numbers)", color: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" },
      { label: "Strong Premium Password", color: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" }
    ];

    const current = styles[score - 1] || { label: "Too Short", color: "bg-rose-600" };
    return {
      score,
      percent: (score / 4) * 100,
      ...current
    };
  }, [password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError("Please enter a new password.");
      addToast("Please enter a new password.", "warning");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      addToast("Password is too short.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      addToast("Passwords do not match.", "warning");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const client = requireSupabase();
      const { error: resetError } = await client.auth.updateUser({ password });
      
      if (resetError) throw resetError;
      
      setSuccess(true);
      addToast("Password has been successfully updated!", "success");
    } catch (resetError) {
      setError(resetError.message || "Failed to update password.");
      addToast("Failed to update password.", "error");
    } finally {
      setSubmitting(false);
    }

  };

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50">
        <div className="galaxy-bg" />
        <div className="register-planet-glow" />
        <div className="noise-overlay" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between">
          {/* Header Bar */}
          <header className="flex h-20 items-center justify-between border-b border-white/5 bg-[#07111F]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 text-lg font-black tracking-normal text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 text-sm font-black text-white shadow-lg">
                T
              </span>
              Vynora
            </Link>
          </header>

          {/* Form Content */}
          <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel w-full max-w-[480px] rounded-[1.75rem] border-cyan-300/30 p-6 shadow-[0_0_80px_rgba(139,92,246,0.15)] sm:p-8"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                    <LockKeyhole size={28} filter="drop-shadow(0 0 8px rgba(139,92,246,0.5))" />
                  </div>
                  
                  <h2 className="mt-5 text-center text-2xl font-black text-white sm:text-3xl">Set New Password</h2>
                  <p className="mt-2.5 text-center text-sm leading-relaxed text-slate-400">
                    Please create a strong new password that is at least 8 characters long and contains letters, numbers, and symbols.
                  </p>

                  <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                    {/* New Password */}
                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                      New Password
                      <span className="relative">
                        <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={submitting}
                          className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
                        />
                      </span>
                    </label>

                    {/* Real-time Strength Meter */}
                    {password && (
                      <div className="grid gap-2 rounded-xl border border-white/5 bg-white/[0.015] p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">Password Strength:</span>
                          <span className={strengthMetrics.score >= 3 ? "text-emerald-400" : strengthMetrics.score === 2 ? "text-yellow-400" : "text-rose-400"}>
                            {strengthMetrics.label}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${strengthMetrics.percent}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={`h-full rounded-full ${strengthMetrics.color}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Confirm Password */}
                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                      Confirm New Password
                      <span className="relative">
                        <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={submitting}
                          className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
                        />
                      </span>
                    </label>

                    {error && (
                      <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="glow-button group relative mt-2 flex h-[56px] w-full items-center justify-center gap-4 rounded-xl px-6 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Updating Password..." : "Reset My Password"}
                      <span className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-cyan-500 transition group-hover:translate-x-1">
                        <ArrowRight size={19} />
                      </span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel w-full max-w-[480px] rounded-[1.75rem] border-emerald-500/30 p-6 text-center shadow-[0_0_80px_rgba(16,185,129,0.15)] sm:p-8"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck size={32} filter="drop-shadow(0 0 8px rgba(16,185,129,0.5))" />
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">Password Reset!</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    Your account security credentials have been successfully updated. You can now use your new password to log in.
                  </p>

                  <button
                    onClick={() => navigate("/login")}
                    className="glow-button mt-8 flex h-[52px] w-full items-center justify-center rounded-xl text-sm font-black text-white"
                  >
                    Go to Login Portal
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="w-full border-t border-white/5 bg-[#07111F]/50 py-5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Vynora. All rights reserved. Premium Corporate Edition.
          </footer>
        </div>
      </main>
    </PageTransition>
  );
}

export default ResetPasswordPage;
