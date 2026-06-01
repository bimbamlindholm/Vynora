import { Link } from "react-router-dom";

export default function VynoraFooter() {
  return (
    <footer className="w-full bg-[#07111F]/90 border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 no-print">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 xl:px-24 gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2">
          <img
            src="/vynora-logo.png"
            alt="Vynora"
            className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
          />
          <span className="text-xs font-black tracking-widest text-slate-400">
            VYNORA &bull; <span className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-[0.2em]">INTELLIGENT WORKFORCE</span>
          </span>
        </div>

        {/* Center/Right: Copyright & Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} Vynora Inc. All rights reserved.</span>
          <Link to="/privacy" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-cyan-300 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
