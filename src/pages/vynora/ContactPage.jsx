import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, MessageSquare, Clock, Send } from "lucide-react";
import VynoraNavbar from "../../components/vynora/VynoraNavbar";
import VynoraFooter from "../../components/vynora/VynoraFooter";
import PageTransition from "../../components/PageTransition";
import { useToast } from "../../contexts/ToastContext";

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      addToast("Message sent successfully! Our team will reach out within 2 hours.", "success");
    }, 1500);
  };

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50 flex flex-col justify-between">
        <div className="galaxy-bg" />
        <div className="noise-overlay" />
        
        <div>
          <VynoraNavbar />
          
          <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Top Heading */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black tracking-widest text-cyan-300 uppercase">
                <Sparkles size={11} className="animate-pulse" />
                Connect With Us
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Get in Touch with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Vynora Support</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
                Have questions about our platform, security parameters, or pricing? Write us a message.
              </p>
            </div>

            {/* Split Grid */}
            <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-start">
              {/* Left Column: Direct Support Channels */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden glass-panel border border-white/5 bg-slate-950/40 p-6 sm:p-8 rounded-[2.5rem] shadow-xl"
                >
                  <h2 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/5">
                    Support Channels
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Support Email */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                        <Mail size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Email Support</h3>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">DIRECT ENVELOPE CHANNEL</p>
                        <p className="mt-1.5 text-xs text-cyan-300 hover:underline cursor-pointer">support@vynora.io</p>
                      </div>
                    </div>

                    {/* Direct Message Info */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Direct Message</h3>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">LIVE CHAT CHANNEL</p>
                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                          Admins can open live support tickets directly inside the Vynora Workspace Settings panel.
                        </p>
                      </div>
                    </div>

                    {/* Response Hours */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Response Hours</h3>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">CUSTOMER ASSISTANCE SLA</p>
                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                          Monday to Friday: 24 Hours &bull; Weekends: 8:00 AM - 5:00 PM (GMT+8). Average response latency is under 2 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="relative overflow-hidden glass-panel border border-white/5 bg-slate-950/40 p-6 sm:p-8 rounded-[2.5rem] shadow-xl space-y-4"
                >
                  <h2 className="text-base font-black text-white uppercase tracking-wider mb-2 pb-3 border-b border-white/5">
                    Write us a Message
                  </h2>
                  
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="e.g. Jane Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white outline-none focus:border-cyan-500/40 focus:bg-slate-950 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="e.g. jane@vynora.io"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white outline-none focus:border-cyan-500/40 focus:bg-slate-950 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="Write your inquiries here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white outline-none focus:border-cyan-500/40 focus:bg-slate-950 transition-all placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="glow-button mt-4 w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send size={13} />
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </motion.div>
            </div>
          </section>
        </div>
        
        <VynoraFooter />
      </main>
    </PageTransition>
  );
}
