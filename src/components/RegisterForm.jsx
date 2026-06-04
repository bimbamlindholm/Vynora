import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterForm() {
  const navigate = useNavigate();
  const { registerPersonal, loginWithGoogle, loginWithFacebook } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);


  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleGoogleLogin = async () => {
    setErrors({});
    try {
      await loginWithGoogle("personal");
    } catch (err) {
      setErrors({ form: err.message || "Failed to initiate Google sign-in." });
    }
  };

  const handleFacebookLogin = async () => {
    setErrors({});
    try {
      await loginWithFacebook("personal");
    } catch (err) {
      setErrors({ form: err.message || "Failed to initiate Facebook sign-in." });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!form.email.trim()) nextErrors.email = "Email address is required";
    else if (!emailPattern.test(form.email)) nextErrors.email = "Enter a valid email address";
    if (!form.password.trim()) nextErrors.password = "Password is required";
    if (form.password && form.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await registerPersonal(form);
      navigate(result.redirectTo);
    } catch (error) {
      setErrors({ form: error.message || "Unable to create account." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="order-1 lg:order-2">
      <div className="glass-panel mx-auto w-full max-w-[590px] rounded-[1.75rem] border-cyan-300/30 p-5 shadow-[0_0_80px_rgba(124,58,237,0.22)] sm:p-8 lg:p-9">
        <h2 className="text-2xl font-black text-white sm:text-3xl">Create your account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">Let's get you started with Vynora.</p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#4285F4]/10 text-xs font-black text-white transition hover:border-[#4285F4]/40 hover:bg-[#4285F4]/20 shadow-[0_0_20px_rgba(66,133,244,0.1)]"
          >
            <svg className="h-4 w-4 fill-current text-[#4285F4]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#1877F2]/10 text-xs font-black text-white transition hover:border-[#1877F2]/40 hover:bg-[#1877F2]/20 shadow-[0_0_20px_rgba(24,119,242,0.1)]"
          >
            <Facebook size={16} className="text-[#1877F2]" />
            Facebook
          </button>
        </div>

        <div className="my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-slate-400">
          <span className="h-px bg-white/10" />
          <span>or sign up with email</span>
          <span className="h-px bg-white/10" />
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Field
            error={errors.fullName}
            icon={UserRound}
            label="Full Name"
            onChange={(value) => updateField("fullName", value)}
            placeholder="Enter your full name"
            type="text"
            value={form.fullName}
          />
          <Field
            error={errors.email}
            icon={Mail}
            label="Email Address"
            onChange={(value) => updateField("email", value)}
            placeholder="Enter your email address"
            type="email"
            value={form.email}
          />
          <PasswordField
            error={errors.password}
            label="Password"
            onChange={(value) => updateField("password", value)}
            placeholder="Create a strong password"
            value={form.password}
            visible={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
          />
          <PasswordField
            error={errors.confirmPassword}
            label="Confirm Password"
            onChange={(value) => updateField("confirmPassword", value)}
            placeholder="Confirm your password"
            value={form.confirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
          />

          <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
            <input
              type="checkbox"
              required
              className="mt-1 h-5 w-5 shrink-0 rounded border border-white/20 bg-transparent accent-cyan-400"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-semibold text-violet-300 hover:text-violet-200">
                Privacy Policy
              </Link>
            </span>
          </label>

          {errors.form && (
            <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">
              {errors.form}
            </div>
          )}

          <div className="grid gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="glow-button group relative mt-1 flex h-16 w-full items-center justify-center gap-4 rounded-xl px-6 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create Account"}
              <span className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-cyan-500 transition group-hover:translate-x-1">
                <ArrowRight size={19} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-sm font-bold text-slate-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </form>

        <p className="mx-auto mt-6 max-w-md text-center text-xs leading-6 text-slate-400">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="font-semibold text-cyan-300">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="font-semibold text-violet-300">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}

function Field({ error, icon: Icon, label, onChange, placeholder, type, value }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-300">
      {label}
      <span className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-14 w-full rounded-xl border bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)] ${error ? "border-rose-400/70" : "border-white/10"}`}
        />
      </span>
      {error && <span className="text-xs font-semibold text-rose-300">{error}</span>}
    </label>
  );
}

function PasswordField({ error, label, onChange, placeholder, value, visible, onToggle }) {
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-300">
      {label}
      <span className="relative">
        <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-14 w-full rounded-xl border bg-white/[0.025] px-12 pr-14 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)] ${error ? "border-rose-400/70" : "border-white/10"}`}
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <ToggleIcon size={18} />
        </button>
      </span>
      {error && <span className="text-xs font-semibold text-rose-300">{error}</span>}
    </label>
  );
}

export default RegisterForm;
