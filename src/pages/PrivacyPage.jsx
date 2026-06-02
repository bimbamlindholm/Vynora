import { ArrowLeft, ShieldCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-100">
        <div className="galaxy-bg" />
        <div className="register-planet-glow" />
        <div className="noise-overlay" />

        <div className="relative z-10 flex min-h-screen flex-col items-center p-6 md:p-12">
          <div className="w-full max-w-4xl">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <ArrowLeft size={17} />
              Go Back
            </button>

            {/* Header */}
            <div className="mt-8 mb-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/5 px-4 py-1.5 text-xs font-bold text-cyan-200 w-fit">
                <Eye size={13} className="text-violet-300" />
                Data Protection
              </div>
              <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Privacy Policy</h1>
              <p className="mt-2 text-slate-400 text-sm">Last Updated: May 21, 2026</p>
            </div>

            {/* Legal Content Box */}
            <div className="glass-panel rounded-[1.75rem] border-cyan-300/20 p-6 md:p-10 shadow-2xl bg-white/[0.015] leading-relaxed text-slate-300 space-y-6">
              <section>
                <h2 className="text-xl font-bold text-white mb-3">1. Introduction & Scope</h2>
                <p>
                  At Vynora V3, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, store, process, and safeguard your personal information when you register an account, utilize Google OAuth login, or use our timekeeping, DTR, and HRIS tools.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
                <div className="space-y-3">
                  <p>
                    We collect personal information necessary to facilitate employment timekeeping and workspace operations:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                    <li><strong>Google Account Data:</strong> If you connect or authenticate via Google OAuth, we retrieve your email address, full name, and profile picture URL. We do not access Google files, calendars, or private account data.</li>
                    <li><strong>Standard Profile Data:</strong> Full Name, Email address, phone number, department, position, and staff/employee identification code.</li>
                    <li><strong>Statutory & Compliance IDs:</strong> If voluntarily provided, SSS, PhilHealth, Pag-IBIG, and TIN numbers. These are encrypted and saved solely for the purpose of helping workspace admins execute payroll and state-mandated reporting.</li>
                    <li><strong>Timekeeping Records:</strong> Daily clock-in/out times, break durations, attendance logs, and manual correction requests. We may collect access log details (IP address and browser User-Agent) to safeguard against automated falsifications.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
                <p>
                  Vynora V3 utilizes the collected metrics only to provide core features: validating shift timings, compiling payroll hours, checking statutory configurations for admins, and ensuring secure authentication. Your data is never sold, traded, or used for third-party targeted marketing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">4. Row Level Security & Storage</h2>
                <p>
                  Our database runs on a secure PostgreSQL backend hosted by Supabase. We implement strict <strong>Row Level Security (RLS)</strong> policies ensuring employees can only access their own timekeeping data and personal profiles, while workspace owners can only access records associated with their registered workspace code.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">5. Data Retention & Cascade Protection</h2>
                <p>
                  We store your personal data for as long as your account is active or needed by your workspace owner. In accordance with the Philippine Data Privacy Act and global compliance standards, you have the right to request data deletion. Deleting an account executes a cascade purge that completely deletes all related logs from the live database.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">6. Cookies & Local Storage</h2>
                <p>
                  Vynora V3 uses standard local storage and session tokens strictly to keep you authenticated, retain theme preferences, and maintain active Supabase sessions. We do not use tracking cookies.
                </p>
              </section>

              <section className="pt-6 border-t border-white/5 flex items-center gap-3">
                <ShieldCheck className="text-cyan-400 shrink-0" size={24} />
                <p className="text-xs text-slate-400">
                  We maintain strict physical, technical, and organizational measures to ensure your data stays private and compliant. For inquiries, contact support@vynora.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
