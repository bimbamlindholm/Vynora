import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";

export default function TermsPage() {
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
                <FileText size={13} className="text-violet-300" />
                Legal Terms
              </div>
              <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Terms of Service</h1>
              <p className="mt-2 text-slate-400 text-sm">Last Updated: May 21, 2026</p>
            </div>

            {/* Legal Content Box */}
            <div className="glass-panel rounded-[1.75rem] border-cyan-300/20 p-6 md:p-10 shadow-2xl bg-white/[0.015] leading-relaxed text-slate-300 space-y-6">
              <section>
                <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  Welcome to Vynora V3. By creating an account, connecting your Google account, or using our timekeeping, DTR, and HRIS services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">2. Description of Services</h2>
                <p>
                  Vynora V3 is a cloud-based attendance, DTR (Daily Time Record), and timekeeping management application designed for Admins (Workspace Owners), Employees (Workspace Members), and Personal Trackers. We facilitate shifts, payroll logging, attendance corrections, and Google OAuth integrations to enable clean HR operations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">3. Account Registration & Security</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials, including passwords and active Supabase sessions. You agree to notify us immediately of any unauthorized use of your account. Admins are solely responsible for managing employee invitation codes and setting workspace rules.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">4. Appropriate Use</h2>
                <p>
                  You agree not to manipulate time records, falsify attendance, spoof location markers, or run automated scripts designed to bypass the manual punch-in/punch-out procedures. Violations can lead to account suspension or workspace termination.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">5. Supplying Google OAuth</h2>
                <p>
                  By logging in or linking your account via Google SSO, you grant Vynora permissions to access your basic profile metadata (Full Name, Email address, and profile picture). Vynora does not read, write, or access any other personal information on your Google Account unless explicitly asked.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">6. Modifications to Service & Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service or features of Vynora V3 at any time. Your continued use of the application following updates constitutes your acceptance of the updated terms.
                </p>
              </section>

              <section className="pt-6 border-t border-white/5 flex items-center gap-3">
                <ShieldCheck className="text-cyan-400 shrink-0" size={24} />
                <p className="text-xs text-slate-400">
                  Vynora V3 guarantees all timekeeping logs are kept securely within the hosted database. For questions regarding terms, contact your system administrator.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
