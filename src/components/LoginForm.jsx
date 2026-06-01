import { useState } from "react";
import { ArrowRight, Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const portalRoles = {
  "/admin-dashboard": "admin",
  "/employee-dashboard": "employee",
  "/personal-dashboard": "personal",
};

function LoginForm({ portal }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  
  // Standardize error states for Google/Facebook OAuth signup
  const [error, setError] = useState(() => {
    const errorDesc = searchParams.get("error_description");
    const err = searchParams.get("error");
    if (errorDesc) return errorDesc;
    if (err) return err.replace(/_/g, " ");
    return "";
  });

  const emailField = portal.fields.find((field) => field.type === "email")?.name;

  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    if (emailField) {
      const remembered = localStorage.getItem("trackly_remembered_email");
      const rememberMe = localStorage.getItem("trackly_remember_me") !== "false";
      if (remembered && rememberMe) {
        initial[emailField] = remembered;
      }
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // True Remember Me State
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("trackly_remember_me") !== "false";
  });

  const updateValue = (name, value) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const togglePassword = (name) => {
    setVisiblePasswords((current) => ({
      ...current,
      [name]: !current[name],
    }));
  };

  const handleGoogleLogin = async () => {
    setError("");
    const workspaceField = portal.fields.find((field) => field.type === "workspace")?.name;
    const workspaceCode = workspaceField ? formValues[workspaceField] || "" : "";
    const expectedRole = portalRoles[portal.dashboardTo];

    try {
      await loginWithGoogle(expectedRole, workspaceCode);
    } catch (err) {
      setError(err.message || "Failed to initiate Google sign-in.");
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    const workspaceField = portal.fields.find((field) => field.type === "workspace")?.name;
    const workspaceCode = workspaceField ? formValues[workspaceField] || "" : "";
    const expectedRole = portalRoles[portal.dashboardTo];

    try {
      await loginWithFacebook(expectedRole, workspaceCode);
    } catch (err) {
      setError(err.message || "Failed to initiate Facebook sign-in.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const emailField = portal.fields.find((field) => field.type === "email")?.name;
    const passwordField = portal.fields.find((field) => field.type === "password")?.name;
    const workspaceField = portal.fields.find((field) => field.type === "workspace")?.name;

    const email = formValues[emailField] || "";

    try {
      // Save or clear email under Remember Me
      if (rememberMe && email) {
        localStorage.setItem("trackly_remembered_email", email.trim());
        localStorage.setItem("trackly_remember_me", "true");
      } else {
        localStorage.removeItem("trackly_remembered_email");
        localStorage.setItem("trackly_remember_me", "false");
      }

      const redirectTo = await login({
        email: email,
        password: formValues[passwordField] || "",
        workspaceCode: workspaceField ? formValues[workspaceField] || "" : "",
        expectedRole: portalRoles[portal.dashboardTo],
      });
      navigate(redirectTo);
    } catch (loginError) {
      const errMsg = loginError.message || "Unable to log in. Please check your credentials.";
      if (errMsg.toLowerCase().includes("invalid login credentials")) {
        setError("Invalid login credentials. Tip: If you registered using Google, please click the 'Connect Google Account' button above to sign in, or set a password using 'Forgot password' for manual login.");
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-form order-1">
      <div className="glass-panel mx-auto w-full max-w-[540px] rounded-[1.75rem] border-cyan-300/30 p-5 shadow-[0_0_80px_rgba(124,58,237,0.22)] sm:p-7 lg:p-8">
        <h2 className="text-2xl font-black text-white sm:text-3xl">{portal.formTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
          Welcome back! Please enter your details.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#4285F4]/10 text-xs font-black text-white transition hover:border-[#4285F4]/40 hover:bg-[#4285F4]/20 shadow-[0_0_20px_rgba(66,133,244,0.1)]"
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
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#1877F2]/10 text-xs font-black text-white transition hover:border-[#1877F2]/40 hover:bg-[#1877F2]/20 shadow-[0_0_20px_rgba(24,119,242,0.1)]"
          >
            <Facebook size={16} className="text-[#1877F2]" />
            Facebook
          </button>
        </div>

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-slate-400">
          <span className="h-px bg-white/10" />
          <span className="text-center">{portal.dividerText}</span>
          <span className="h-px bg-white/10" />
        </div>

        <form autoComplete="off" className="grid gap-4" onSubmit={handleSubmit}>
          <input autoComplete="false" className="hidden" name="trackly-hidden-user" tabIndex="-1" type="text" />
          <input autoComplete="new-password" className="hidden" name="trackly-hidden-pass" tabIndex="-1" type="password" />
          {portal.fields.map((field) => (
            <LoginField
              key={field.name}
              field={field}
              onChange={(value) => updateValue(field.name, value)}
              onTogglePassword={() => togglePassword(field.name)}
              passwordVisible={Boolean(visiblePasswords[field.name])}
              value={formValues[field.name] || ""}
            />
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded border border-white/20 bg-transparent accent-cyan-400 cursor-pointer"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="glow-button group relative mt-1 flex h-[60px] w-full items-center justify-center gap-4 rounded-xl px-6 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Checking account..." : portal.submitLabel}
            <span className="absolute right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-cyan-500 transition group-hover:translate-x-1">
              <ArrowRight size={19} />
            </span>
          </button>
        </form>

        <p className="mx-auto mt-5 max-w-md text-center text-xs leading-6 text-slate-400">
          By logging in, you agree to our{" "}
          <Link to="/terms" className="font-semibold text-cyan-300">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="font-semibold text-violet-300">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}

function LoginField({ field, onChange, onTogglePassword, passwordVisible, value }) {
  const isPassword = field.type === "password";
  const isWorkspace = field.type === "workspace";
  const Icon = isPassword ? LockKeyhole : isWorkspace ? Building2 : Mail;
  const autoCompleteValue = isPassword ? "new-password" : "off";

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-300">
      {field.label}
      <span className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          autoComplete={autoCompleteValue}
          data-1p-ignore="true"
          data-lpignore="true"
          name={`trackly-${field.name}-no-autofill`}
          onChange={(event) => onChange(event.target.value)}
          type={isPassword && !passwordVisible ? "password" : "text"}
          value={value}
          placeholder={field.placeholder}
          className={`h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.025] px-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)] ${isPassword ? "pr-14" : ""} ${isWorkspace ? "uppercase tracking-[0.12em] placeholder:normal-case placeholder:tracking-normal" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
            onClick={onTogglePassword}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
    </label>
  );
}

export default LoginForm;
