import { useState } from "react";
import { Clock, Mail, MapPin, MessageSquare, Send } from "lucide-react";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    // Mock send delay for high quality interaction feedback
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });

      // Auto-clear success banner after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }, 1200);
  };

  return (
    <section id="contact" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
        {/* Support coordinates */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Get in Touch</p>
            <h2 className="mt-4 text-[clamp(2.1rem,4vw,3.6rem)] font-black leading-tight text-white">
              Connect with <span className="gradient-text">support</span>
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Have questions about custom shifts, setting up your team, or managing timesheets? Get in touch with me directly, and I'll help you get started.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="glass-panel border-white/5 bg-white/[0.01] rounded-2xl p-5 flex items-center gap-4 hover:border-cyan-300/25 transition duration-300">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <Mail size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Support</span>
                <a href="mailto:support@vynora.com" className="block text-base font-black text-white hover:text-cyan-300 transition mt-0.5 break-all">
                  support@vynora.com
                </a>
              </div>
            </div>

            <div className="glass-panel border-white/5 bg-white/[0.01] rounded-2xl p-5 flex flex-col gap-3 hover:border-cyan-300/25 transition duration-300">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Message</span>
                  <span className="block text-sm font-bold text-white mt-0.5">
                    Messenger: <span className="text-cyan-200">Vynora Support</span>
                  </span>
                </div>
              </div>
              <div className="pl-12 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>WhatsApp: <a href="#" className="text-cyan-300 hover:underline">+63 900 000 0000</a></span>
                <span className="text-slate-600">|</span>
                <span>Telegram: <a href="#" className="text-cyan-300 hover:underline">+63 900 000 0000</a></span>
              </div>
            </div>

            <div className="glass-panel border-white/5 bg-white/[0.01] rounded-2xl p-5 flex items-center gap-4 hover:border-cyan-300/25 transition duration-300">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                <Clock size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Response Hours</span>
                <span className="block text-base font-black text-white mt-0.5">
                  Monday to Friday, 10:00 AM - 10:00 PM
                </span>
              </div>
            </div>

            <div className="glass-panel border-white/5 bg-white/[0.01] rounded-2xl p-5 flex items-start gap-4 hover:border-cyan-300/25 transition duration-300">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-400 mt-1">
                <MapPin size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Location</span>
                <span className="block text-sm font-bold text-white mt-0.5 leading-snug">
                  Quezon City, Metro Manila, Philippines
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="glass-panel w-full rounded-[1.75rem] border-cyan-300/20 p-5 shadow-[0_0_80px_rgba(6,182,212,0.08)] sm:p-8 space-y-5"
          >
            <h3 className="text-xl font-black text-white">Send a Message</h3>
            
            {success && (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200 animate-fadeIn">
                ✓ Thank you! Your message has been received. I will get back to you during my response hours.
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Your Name
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Email Address
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Subject
              <input
                type="text"
                required
                placeholder="How can we help?"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Message Body
              <textarea
                rows={4}
                required
                placeholder="Detail your request or inquiry..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-cyan-300/[0.035] focus:shadow-[0_0_0_4px_rgba(6,182,212,0.08)] resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="glow-button group relative mt-1 flex h-[56px] w-full items-center justify-center gap-4 rounded-xl px-6 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending..." : "Submit Inquiry"}
              <span className="absolute right-4 grid h-9 w-9 place-items-center rounded-full bg-white text-cyan-500 transition group-hover:translate-x-1">
                <Send size={15} />
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Landing footer */}
      <footer className="mt-24 border-t border-white/5 pt-8 text-center text-xs leading-6 text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Vynora. Built in the Philippines. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="/terms" className="font-semibold text-slate-400 hover:text-cyan-300 transition">Terms of Service</a>
          <a href="/privacy" className="font-semibold text-slate-400 hover:text-violet-300 transition">Privacy Policy</a>
        </div>
      </footer>
    </section>
  );
}

export default Contact;
