import { motion } from "framer-motion";

export default function SkeletonLoader() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07111F] text-slate-200">
      {/* Background glowing aura */}
      <div className="galaxy-bg" />
      <div className="noise-overlay" />

      {/* Shimmer CSS Style (injected inline to guarantee active shimmer animations across all devices) */}
      <style>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-block {
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s infinite linear;
        }
        .shimmer-glow {
          background: linear-gradient(90deg, rgba(6,182,212,0.05) 25%, rgba(124,58,237,0.1) 50%, rgba(6,182,212,0.05) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 2s infinite linear;
        }
      `}</style>

      {/* Desktop Dashboard Sidebar Skeleton (hidden on mobile, visible on lg) */}
      <div className="fixed bottom-0 left-0 top-0 z-20 hidden w-[280px] border-r border-white/5 bg-[#050B16]/80 p-6 backdrop-blur-md lg:block">
        {/* Brand Logo Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl shimmer-block" />
          <div className="h-5 w-28 rounded-lg shimmer-block" />
        </div>

        {/* Navigation Stack Skeletons */}
        <div className="mt-10 space-y-4">
          <div className="h-4 w-16 rounded-md shimmer-block opacity-40 mb-2" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2">
              <div className="h-5 w-5 rounded-lg shimmer-block" />
              <div className="h-4 w-32 rounded-md shimmer-block" />
            </div>
          ))}
        </div>

        {/* Profile Card Bottom Badge Skeleton */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.01] p-3">
          <div className="h-10 w-10 rounded-full shimmer-block" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-24 rounded-md shimmer-block" />
            <div className="h-2.5 w-16 rounded-md shimmer-block opacity-60" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 lg:pl-[280px]">
        {/* Topbar Skeleton */}
        <div className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#050B16]/30 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Toggle Icon */}
            <div className="h-8 w-8 rounded-lg shimmer-block lg:hidden" />
            <div className="h-4 w-40 rounded-md shimmer-block" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-28 rounded-full shimmer-block" />
            <div className="h-8 w-8 rounded-full shimmer-block" />
            <div className="h-8 w-8 rounded-full shimmer-block" />
          </div>
        </div>

        {/* Main Grid Content */}
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Card Header Shimmer */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900/60 to-slate-950/40 p-6 sm:p-8 shimmer-glow">
            <div className="max-w-md space-y-3">
              <div className="h-4 w-28 rounded-md shimmer-block" />
              <div className="h-7 w-64 rounded-lg shimmer-block" />
              <div className="h-3 w-80 rounded-md shimmer-block opacity-65" />
            </div>
          </div>

          {/* Overview Cards Grid Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.015] p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 w-20 rounded-md shimmer-block" />
                  <div className="h-5 w-5 rounded-lg shimmer-block" />
                </div>
                <div className="h-6 w-24 rounded-lg shimmer-block" />
                <div className="h-2.5 w-32 rounded-md shimmer-block opacity-60" />
              </div>
            ))}
          </div>

          {/* Double Column Grid Skeleton */}
          <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
            {/* Left Column: Analytics Chart & Table */}
            <div className="space-y-6">
              {/* Analytics Chart Block */}
              <div className="rounded-2xl border border-white/5 bg-[#050B16]/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 rounded-md shimmer-block" />
                  <div className="h-8 w-24 rounded-lg shimmer-block" />
                </div>
                {/* Horizontal pulsing blocks simulating charts */}
                <div className="h-48 w-full rounded-xl shimmer-block" />
              </div>

              {/* Attendance Logs Table */}
              <div className="rounded-2xl border border-white/5 bg-[#050B16]/20 p-5 space-y-4">
                <div className="h-5 w-36 rounded-md shimmer-block" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full shimmer-block" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 rounded-md shimmer-block" />
                          <div className="h-2.5 w-20 rounded-md shimmer-block opacity-60" />
                        </div>
                      </div>
                      <div className="h-4 w-12 rounded-md shimmer-block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Side Info Cards */}
            <div className="space-y-6">
              {/* Sidebar card 1 */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-3">
                <div className="h-4 w-28 rounded-md shimmer-block" />
                <div className="h-14 w-full rounded-xl shimmer-block" />
                <div className="h-3 w-40 rounded-md shimmer-block opacity-60" />
              </div>

              {/* Sidebar card 2 */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
                <div className="h-4 w-24 rounded-md shimmer-block" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full shimmer-block" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded-md shimmer-block" />
                    <div className="h-2.5 w-24 rounded-md shimmer-block opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar Skeleton (visible only on mobile, lg:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex h-[68px] items-center justify-around border-t border-white/5 bg-[#050B16]/90 p-2 backdrop-blur-md lg:hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1.5 w-12">
            <div className="h-5 w-5 rounded-full shimmer-block" />
            <div className="h-2.5 w-10 rounded-md shimmer-block opacity-50" />
          </div>
        ))}
      </div>

      {/* Floating Center Badge: Trackly Session Lock Loader */}
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 backdrop-blur-[1px]">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel max-w-sm rounded-[1.5rem] border border-cyan-500/20 bg-slate-950/85 p-6 text-center shadow-2xl"
        >
          <div className="flex justify-center mb-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-lg font-black animate-spin duration-3000">
              🌀
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Trackly</p>
          <h1 className="mt-2 text-base font-black text-white">Checking session</h1>
          <p className="mt-1 text-xs text-slate-400">Loading your workspace access...</p>
        </motion.div>
      </div>
    </div>
  );
}
