import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import PageTransition from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { requireSupabase } from "../lib/supabaseClient";

function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      addToast("Please enter your email address.", "warning");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const client = requireSupabase();
      const { error: resetError } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (resetError) throw resetError;
      
      setSent(true);
      addToast("Password recovery link sent successfully!", "success");
    } catch (resetError) {
      setError(resetError.message || "Failed to send reset link.");
      addToast("Failed to send reset link.", "error");
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
              Trackly
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </header>

          {/* Form Content */}
          <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div
                  key="forgot-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel w-full max-w-[480px] rounded-[1.75rem] border-cyan-300/30 p-6 shadow-[0_0_80px_rgba(6,182,212,0.15)] sm:p-8"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                    <ShieldAlert size={28} filter="drop-shadow(0 0 8px rgba(6,182,212,0.5))" />
                  </div>
                  
                  <h2 className="mt-5 text-center text-2xl font-black text-white sm:text-3xl">Forgot Password?</h2>
                  <p className="mt-2.5 text-center text-sm leading-relaxed text-slate-400">
                    Enter your registered email below, and we will send you a secure link to reset your password.
                  </p>

                  <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                      Email Address
                      <span className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                      {submitting ? "Sending Link..." : "Send Reset Link"}
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
                    <CheckCircle2 size={32} filter="drop-shadow(0 0 8px rgba(16,185,129,0.5))" />
                  </div>

                  <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">Link Sent!</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    We have successfully dispatched a secure password recovery URL to <strong className="text-white">{email}</strong>.
                  </p>
                  
                  <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-5 text-slate-400">
                    If you don't receive the email within 5 minutes, please check your spam folder or try request again.
                  </div>

                  <Link
                    to="/login"
                    className="glow-button mt-8 flex h-[52px] w-full items-center justify-center rounded-xl text-sm font-black text-white"
                  >
                    Return to Login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="w-full border-t border-white/5 bg-[#07111F]/50 py-5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Trackly. All rights reserved. Premium Corporate Edition.
          </footer>
        </div>
      </main>
    </PageTransition>
  );
}

export default ForgotPasswordPage;
