import { Save, Camera, User, Briefcase, Sparkles } from "lucide-react";

/**
 * Presentational card rendering personal information sheets, avatar uploads, and government IDs grid.
 */
export default function PersonalProfileCard({
  profile,
  user,
  profileForm,
  setProfileForm,
  updatingProfile,
  handleSaveProfile,
  handleProfilePhotoChange,
  handleRemoveProfilePhoto,
  setActiveTab,
  subscriptionTier = "free",
  setSubscriptionTier,
}) {
  return (
    <div className="space-y-6 text-left">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Personal Account</span>
            {subscriptionTier === "pro" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-cyan-400/35 bg-cyan-400/15 text-[8.5px] font-black text-cyan-300 uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <Sparkles size={9} /> Solo Pro
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-600/35 bg-slate-800/50 text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                Solo Free
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Profile & Work Information</h2>
          <p className="text-xs text-slate-400 mt-1">Manage your identity, personal profile photo, government IDs, and job details synced to Vynora Cloud.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className="px-4 py-2 rounded-xl border border-white/5 bg-slate-800/80 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={updatingProfile}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black transition shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.35)] disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Save size={13} />
            {updatingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Left Column: Avatar and Government IDs */}
        <div className="space-y-6">
          {/* Profile Photo Card */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-sm font-black text-white w-full text-left">Profile Picture</h3>
            <div className="relative group mt-2 h-32 w-32 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.1)] overflow-hidden cursor-pointer">
              {profileForm.facePhoto ? (
                <img
                  src={profileForm.facePhoto}
                  alt="Profile Preview"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Camera size={36} className="text-emerald-400" />
                </div>
              )}
              
              {/* Hover Overlay */}
              <div
                onClick={() => document.getElementById("profile-avatar-input").click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Camera size={20} className="text-white animate-pulse" />
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {profileForm.facePhoto ? "Change" : "Upload"}
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                id="profile-avatar-input"
                name="profile-avatar-input"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
              />
            </div>

            {profileForm.facePhoto ? (
              <button
                type="button"
                onClick={handleRemoveProfilePhoto}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                Remove Photo
              </button>
            ) : (
              <p className="text-[11px] leading-relaxed text-slate-400 max-w-[200px]">
                Tap the circle to upload a profile photo (max 1.5MB).
              </p>
            )}
          </div>

          {/* Government IDs Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white">Government Identifications</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">Optional government ID numbers used for personal references or tax logs.</p>
            
            <div className="space-y-3 pt-2">
              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                SSS Number
                <input
                  type="text"
                  id="profile_sss"
                  name="profile_sss"
                  placeholder="00-0000000-0"
                  value={profileForm.sss}
                  onChange={(e) => setProfileForm(f => ({ ...f, sss: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                PhilHealth ID
                <input
                  type="text"
                  id="profile_philhealth"
                  name="profile_philhealth"
                  placeholder="00-000000000-0"
                  value={profileForm.philhealth}
                  onChange={(e) => setProfileForm(f => ({ ...f, philhealth: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Pag-IBIG MID
                <input
                  type="text"
                  id="profile_pagibig"
                  name="profile_pagibig"
                  placeholder="0000-0000-0000"
                  value={profileForm.pagibig}
                  onChange={(e) => setProfileForm(f => ({ ...f, pagibig: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                TIN (Tax Identification Number)
                <input
                  type="text"
                  id="profile_tin"
                  name="profile_tin"
                  placeholder="000-000-000-000"
                  value={profileForm.tin}
                  onChange={(e) => setProfileForm(f => ({ ...f, tin: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Personal & Work Info */}
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <User size={15} className="text-emerald-400" />
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                Full Name
                <input
                  type="text"
                  id="profile_fullName"
                  name="profile_fullName"
                  required
                  placeholder="Juan Dela Cruz"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Email Address
                <input
                  type="email"
                  id="profile_email"
                  name="profile_email"
                  disabled
                  value={profile?.email || user?.email || ""}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/20 text-xs text-slate-500 outline-none cursor-not-allowed"
                  title="Email cannot be modified directly."
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Phone Number
                <input
                  type="text"
                  id="profile_phone"
                  name="profile_phone"
                  placeholder="+63 900 000 0000"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                Home Address
                <textarea
                  id="profile_address"
                  name="profile_address"
                  placeholder="Complete Home Address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(f => ({ ...f, address: e.target.value }))}
                  rows={3}
                  className="p-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 resize-none animate-none"
                />
              </label>
            </div>
          </div>

          {/* Work & Career Details Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Briefcase size={15} className="text-emerald-400" />
              Work & Career Details
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">Enter your job role details. These parameters can be printed directly on your generated attendance reports.</p>
            
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Job Title / Position
                <input
                  type="text"
                  id="profile_position"
                  name="profile_position"
                  placeholder="Software Engineer"
                  value={profileForm.position}
                  onChange={(e) => setProfileForm(f => ({ ...f, position: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Department
                <input
                  type="text"
                  id="profile_department"
                  name="profile_department"
                  placeholder="Engineering"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm(f => ({ ...f, department: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                Employee ID / Number
                <input
                  type="text"
                  id="profile_employeeId"
                  name="profile_employeeId"
                  placeholder="EMP-2026-001"
                  value={profileForm.employeeId}
                  onChange={(e) => setProfileForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-800/50 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600"
                />
              </label>
            </div>
          </div>

          {/* Subscription & Billing Card */}
          <div className="glass-panel border-white/5 bg-slate-900/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles size={15} className="text-cyan-400" />
              Subscription & Billing
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vynora V3 runs on flexible, transparent tiers. Choose a plan that matches your current profession.
            </p>
            
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active plan:</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                  subscriptionTier === "pro" 
                    ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse" 
                    : "bg-slate-800 border border-slate-700 text-slate-400"
                }`}>
                  {subscriptionTier === "pro" ? "Solo Pro (Premium)" : "Solo Tracker (Free)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">Billing Period:</span>
                <span className="text-white font-semibold">{subscriptionTier === "pro" ? "Monthly Saver (Auto-renews)" : "N/A (Free Account)"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">Next Invoice:</span>
                <span className="text-white font-extrabold">{subscriptionTier === "pro" ? "₱99.00 on Next Month" : "₱0.00"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">Payment details:</span>
                <span className="text-white font-semibold">{subscriptionTier === "pro" ? "Visa ending in 4242" : "No credit card on file"}</span>
              </div>
            </div>

            {/* Quick Demo Toggle Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {subscriptionTier === "free" ? (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("vynora_mock_subscription_tier", "pro");
                    setSubscriptionTier("pro");
                  }}
                  className="glow-button w-full py-3.5 rounded-xl text-center text-xs font-black text-white cursor-pointer"
                >
                  Upgrade to Solo Pro (₱99/mo)
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel your Solo Pro subscription? You will lose access to Estimated Pay calculations immediately.")) {
                        localStorage.setItem("vynora_mock_subscription_tier", "free");
                        setSubscriptionTier("free");
                      }
                    }}
                    className="w-1/2 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 text-xs font-black transition cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("vynora_mock_subscription_tier", "free");
                      setSubscriptionTier("free");
                    }}
                    className="w-1/2 py-3 rounded-xl border border-white/5 bg-slate-800/85 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-black transition cursor-pointer"
                  >
                    Switch to Free
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
