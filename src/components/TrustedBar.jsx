const companies = ["ORVIAN TECH", "NEXORA", "PIVOT LABS", "LUMEN SOLUTIONS", "FLOW DIGITAL"];

function TrustedBar() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="glass-panel grid gap-6 rounded-2xl px-6 py-7 md:grid-cols-[1.1fr_2.9fr] md:items-center">
        <p className="max-w-sm text-sm leading-6 text-slate-300">
          Trusted by individuals and teams who value time and productivity.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {companies.map((company) => (
            <div key={company} className="flex min-w-0 items-center justify-center gap-2 text-center text-xs font-black tracking-wide text-slate-500 sm:text-sm">
              <span className="h-7 w-7 rounded-lg border border-slate-500/50 bg-white/[0.03]" />
              <span>{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedBar;
