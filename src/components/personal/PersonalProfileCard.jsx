import { Save, Camera, User, Briefcase, Building2, TrendingUp, Settings, Trash2 } from "lucide-react";

/**
 * Presentational card rendering premium personal profile details,
 * split into five sleek glassmorphic sections with auto-calculated age,
 * dynamic badges, and responsive modern layouts.
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
}) {
  // Determine Account Type Badge
  const getAccountBadge = () => {
    const role = profile?.role || user?.user_metadata?.role || "personal";
    if (role === "admin") {
      return {
        text: "Admin Account",
        styles: "border-purple-500/35 bg-purple-500/15 text-purple-300",
      };
    }
    if (role === "employee") {
      return {
        text: "Employee Account",
        styles: "border-blue-500/35 bg-blue-500/15 text-blue-300",
      };
    }
    if (subscriptionTier === "pro") {
      return {
        text: "Solo Pro",
        styles: "border-cyan-400/35 bg-cyan-400/15 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] animate-pulse",
      };
    }
    return {
      text: "Personal Account",
      styles: "border-emerald-400/35 bg-emerald-400/15 text-emerald-300",
    };
  };

  const badge = getAccountBadge();

  // Helper to calculate age automatically
  const calculateAge = (bday) => {
    if (!bday) return "";
    const birthDate = new Date(bday);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge >= 0 ? computedAge : "";
  };

  const currentAge = calculateAge(profileForm.birthday);

  // Toggle preferred day checkbox helper
  const handleDayCheckboxChange = (dayNum) => {
    const days = [...(profileForm.preferredWorkingDays || [])];
    if (days.includes(dayNum)) {
      // Remove day
      const updated = days.filter((d) => d !== dayNum);
      setProfileForm((prev) => ({ ...prev, preferredWorkingDays: updated }));
    } else {
      // Add day
      const updated = [...days, dayNum].sort();
      setProfileForm((prev) => ({ ...prev, preferredWorkingDays: updated }));
    }
  };

  const daysOfWeek = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 0 },
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/[0.04] to-cyan-500/[0.04] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${badge.styles}`}>
              {badge.text}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">Vynora Personal Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Redesign your professional profile, track personal goals, and manage your productivity preferences.</p>
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
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-black transition shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.35)] disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Save size={13} />
            {updatingProfile ? "Saving..." : "Save Profile Changes"}
          </button>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* CARD 1: 👤 Identity (Personal Information) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Identity Details</h3>
              <p className="text-[11px] text-slate-400">Manage your basic details, avatar image, and contact details.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Column */}
            <div className="flex flex-col items-center space-y-3 shrink-0 self-center md:self-start">
              <div className="relative group h-32 w-32 rounded-full border border-emerald-500/25 bg-slate-900 shadow-[0_0_30px_rgba(52,211,153,0.1)] overflow-hidden cursor-pointer">
                {profileForm.facePhoto ? (
                  <img
                    src={profileForm.facePhoto}
                    alt="Profile Preview"
                    className="h-full w-full rounded-full object-cover animate-none"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">
                    👤
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div
                  onClick={() => document.getElementById("profile-avatar-input").click()}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Camera size={20} className="text-white animate-pulse" />
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white">
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                >
                  <Trash2 size={12} /> Remove Image
                </button>
              ) : (
                <p className="text-[10px] leading-relaxed text-slate-500 text-center max-w-[120px]">
                  Tap to upload a custom profile avatar.
                </p>
              )}
            </div>

            {/* Inputs Column */}
            <div className="grid gap-4 sm:grid-cols-2 w-full">
              <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                Full Name
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Email Address
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ""}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-950/45 text-xs text-slate-500 outline-none cursor-not-allowed"
                  title="Email cannot be modified directly."
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Phone Number
                <input
                  type="text"
                  placeholder="+63 900 000 0000"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Birthday
                <input
                  type="date"
                  value={profileForm.birthday || ""}
                  onChange={(e) => setProfileForm(f => ({ ...f, birthday: e.target.value }))}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition focus:bg-slate-900"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                Age (Auto-calculated)
                <input
                  type="text"
                  disabled
                  value={currentAge ? `${currentAge} years old` : "Select a Birthday"}
                  className="h-10 px-4 rounded-xl border border-white/5 bg-slate-950/45 text-xs text-slate-500 outline-none cursor-not-allowed"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                Gender
                <select
                  value={profileForm.gender || ""}
                  onChange={(e) => setProfileForm(f => ({ ...f, gender: e.target.value }))}
                  className="h-10 px-3 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition focus:bg-slate-900"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </label>

              {/* Address Fields Block */}
              <div className="sm:col-span-2 border-t border-white/5 pt-4 space-y-3">
                <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-400">Home Address details</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                    Street Address
                    <input
                      type="text"
                      placeholder="e.g. 123 Main St"
                      value={profileForm.streetAddress || ""}
                      onChange={(e) => setProfileForm(f => ({ ...f, streetAddress: e.target.value }))}
                      className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                    City
                    <input
                      type="text"
                      placeholder="e.g. Manila"
                      value={profileForm.city || ""}
                      onChange={(e) => setProfileForm(f => ({ ...f, city: e.target.value }))}
                      className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                    Province
                    <input
                      type="text"
                      placeholder="e.g. Metro Manila"
                      value={profileForm.province || ""}
                      onChange={(e) => setProfileForm(f => ({ ...f, province: e.target.value }))}
                      className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
                    Country
                    <input
                      type="text"
                      placeholder="e.g. Philippines"
                      value={profileForm.country || "Philippines"}
                      onChange={(e) => setProfileForm(f => ({ ...f, country: e.target.value }))}
                      className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CARD 2: 💼 Current Work */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Current Work</h3>
              <p className="text-[11px] text-slate-400">Your job title, role category, and employment setup.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Job Title / Role
              <input
                type="text"
                placeholder="Software Engineer"
                value={profileForm.position}
                onChange={(e) => setProfileForm(f => ({ ...f, position: e.target.value }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Profession Category
              <select
                value={profileForm.professionCategory || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, professionCategory: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition focus:bg-slate-900"
              >
                <option value="">Select Category</option>
                <option value="Technology / IT">Technology / IT</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Business">Business</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="Creative / Design">Creative / Design</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Employment Type
              <select
                value={profileForm.employmentType || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, employmentType: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition focus:bg-slate-900"
              >
                <option value="">Select Employment Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Student">Student</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
        </div>

        {/* CARD 3: 🏢 Organization */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Organization Details</h3>
              <p className="text-[11px] text-slate-400">Company alignment. (Optional for personal/productivity accounts)</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Company / Organization Name
              <input
                type="text"
                placeholder="e.g. Acme Corporation"
                value={profileForm.companyName || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, companyName: e.target.value }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Department / Team
              <input
                type="text"
                placeholder="e.g. IT Department"
                value={profileForm.department}
                onChange={(e) => setProfileForm(f => ({ ...f, department: e.target.value }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Employee ID / Number
              <input
                type="text"
                placeholder="e.g. EMP-001"
                value={profileForm.employeeId}
                onChange={(e) => setProfileForm(f => ({ ...f, employeeId: e.target.value }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>
          </div>
        </div>

        {/* CARD 4: 🚀 Career Growth */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Career Growth</h3>
              <p className="text-[11px] text-slate-400">Track your target goal, core skill focus, and expertise levels.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Career Goal
              <input
                type="text"
                placeholder="e.g. Learn new technologies"
                value={profileForm.careerGoal || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, careerGoal: e.target.value }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Skill / Field Focus
              <input
                type="text"
                placeholder="e.g. Javascript, CSS"
                value={profileForm.skillFocus || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, skillFocus: e.target.value }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Experience Level
              <select
                value={profileForm.experienceLevel || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, experienceLevel: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition focus:bg-slate-900"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Professional">Professional</option>
                <option value="Expert">Expert</option>
              </select>
            </label>
          </div>
        </div>

        {/* CARD 5: ⚙️ Preferences */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Work Preferences</h3>
              <p className="text-[11px] text-slate-400">Configure your shift arrangement, active days, and goals.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Work Arrangement
              <select
                value={profileForm.workArrangement || ""}
                onChange={(e) => setProfileForm(f => ({ ...f, workArrangement: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition focus:bg-slate-900"
              >
                <option value="">Select Setup</option>
                <option value="On Site">On Site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Flexible">Flexible</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-slate-300">
              Weekly Productivity Goal (Hours/Week)
              <input
                type="number"
                placeholder="40"
                value={profileForm.weeklyProductivityGoal || 40}
                onChange={(e) => setProfileForm(f => ({ ...f, weeklyProductivityGoal: Number(e.target.value) || 0 }))}
                className="h-10 px-4 rounded-xl border border-white/5 bg-slate-900/60 text-xs text-white outline-none focus:border-emerald-500/50 transition placeholder:text-slate-600 focus:bg-slate-900"
              />
            </label>

            {/* Checkbox Group for Preferred Days */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold text-slate-300">Preferred Working Days</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {daysOfWeek.map((day) => {
                  const isChecked = (profileForm.preferredWorkingDays || []).includes(day.value);
                  return (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-medium cursor-pointer transition select-none ${
                        isChecked
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 animate-none"
                          : "border-white/5 bg-slate-900/30 text-slate-400 hover:bg-slate-900/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDayCheckboxChange(day.value)}
                        className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>{day.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
