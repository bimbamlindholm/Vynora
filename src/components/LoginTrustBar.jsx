import { Cloud, Headphones, Infinity as InfinityIcon, XCircle } from "lucide-react";

const trustItems = [
  { icon: InfinityIcon, title: "No hidden fees", text: "100% free forever" },
  { icon: Cloud, title: "Cloud sync", text: "Access anywhere" },
  { icon: XCircle, title: "Cancel anytime", text: "No commitments" },
  { icon: Headphones, title: "24/7 Support", text: "We're here to help" },
];

function LoginTrustBar() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
      <div className="glass-panel grid gap-5 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        {trustItems.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-300">
              <Icon size={27} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white sm:text-base">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LoginTrustBar;
