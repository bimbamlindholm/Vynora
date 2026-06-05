function StatBlock({ title, val, desc }) {
  return (
    <div className="glass-panel rounded-2xl p-5 border-white/5 bg-slate-900/30">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{title}</span>
      <span className="mt-1 block break-words text-lg font-black tracking-tight text-white">{val}</span>
      <span className="block text-[9px] text-slate-500 font-bold mt-0.5">{desc}</span>
    </div>
  );
}

export default StatBlock;
