import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { supabase } from "../../lib/supabaseClient";
import { safeLocalStorage, VynoraDeveloperLogger } from "../../utils/personalDashboardHelpers";

// Helper to parse composite address (e.g. Address: blk 1 ... | Age: 24 | Purpose: ...) or JSON
export const parseCompositeAddress = (profileData) => {
  const defaultData = {
    address: "",
    streetAddress: "",
    city: "",
    province: "",
    country: "Philippines",
    birthday: "",
    gender: "",
    professionCategory: "",
    employmentType: "",
    workArrangement: "",
    careerGoal: "",
    skillFocus: "",
    experienceLevel: "",
    preferredWorkingDays: [1, 2, 3, 4, 5],
    weeklyProductivityGoal: 40,
    companyName: "",
  };

  if (!profileData) return defaultData;

  // Case 1: If direct database columns are present, use them!
  const hasCustomColumns = "birthday" in profileData;
  if (hasCustomColumns) {
    return {
      address: profileData.address || "",
      streetAddress: profileData.street_address || "",
      city: profileData.city || "",
      province: profileData.province || "",
      country: profileData.country || "Philippines",
      birthday: profileData.birthday || "",
      gender: profileData.gender || "",
      professionCategory: profileData.profession_category || "",
      employmentType: profileData.employment_type || "",
      workArrangement: profileData.work_arrangement || "",
      careerGoal: profileData.career_goal || "",
      skillFocus: profileData.skill_focus || "",
      experienceLevel: profileData.experience_level || "",
      preferredWorkingDays: Array.isArray(profileData.preferred_working_days)
        ? profileData.preferred_working_days
        : [1, 2, 3, 4, 5],
      weeklyProductivityGoal: profileData.weekly_productivity_goal || 40,
      companyName: profileData.company_name || "",
    };
  }

  // Case 2: Fallback to reading from the 'address' column
  const addrString = profileData.address || "";
  if (addrString.startsWith("{")) {
    try {
      const data = JSON.parse(addrString);
      return {
        ...defaultData,
        ...data,
        address: data.streetAddress
          ? `${data.streetAddress}, ${data.city || ""}`.replace(/,\s*$/, "")
          : "",
      };
    } catch (e) {
      console.error("Failed to parse serialized address JSON:", e);
    }
  }

  // Case 3: Legacy format: Address: blk 1 ... | Age: 24 | Purpose: ...
  const addressMatch = addrString.match(
    /^Address:\s*(.*?)(?:\s*\|\s*Age:\s*(.*?))?(?:\s*\|\s*Purpose:\s*(.*?))?$/i
  );
  if (addressMatch) {
    const cleanAddress = addressMatch[1] || "";
    const age = addressMatch[2] || "";
    const purpose = addressMatch[3] || "";

    // Attempt to split street address, city, etc. from legacy address
    const parts = cleanAddress.split(/,\s*/);
    return {
      ...defaultData,
      address: cleanAddress,
      streetAddress: parts[0] || cleanAddress,
      city: parts[1] || "",
      province: parts[2] || "",
      careerGoal: purpose ? `Purpose: ${purpose}` : "",
    };
  }

  // Case 4: Pure string address fallback
  let clean = addrString;
  if (clean.startsWith("Address:")) {
    clean = clean.replace(/^Address:\s*/i, "");
  }
  const parts = clean.split(/,\s*/);
  return {
    ...defaultData,
    address: clean,
    streetAddress: parts[0] || clean,
    city: parts[1] || "",
    province: parts[2] || "",
  };
};

export function usePersonalProfile() {
  const { addToast } = useToast();
  const { profile, user, updateProfile, refreshSessionData } = useAuth();

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [manualPassword, setManualPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Profile form states
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    employeeId: "",
    sss: "",
    philhealth: "",
    pagibig: "",
    tin: "",
    facePhoto: "",
    birthday: "",
    gender: "",
    streetAddress: "",
    city: "",
    province: "",
    country: "Philippines",
    professionCategory: "",
    employmentType: "",
    workArrangement: "",
    careerGoal: "",
    skillFocus: "",
    experienceLevel: "",
    preferredWorkingDays: [1, 2, 3, 4, 5],
    weeklyProductivityGoal: 40,
    companyName: "",
  });

  const [onboardingForm, setOnboardingForm] = useState({
    fullName: "",
    phone: "",
    birthday: "",
    gender: "",
    streetAddress: "",
    city: "",
    province: "",
    country: "Philippines",
    avatar: "🚀",
    position: "",
    professionCategory: "",
    employmentType: "",
    companyName: "",
    department: "",
    employeeId: "",
    workArrangement: "",
    careerGoal: "",
    skillFocus: "",
    experienceLevel: "",
    preferredWorkingDays: [1, 2, 3, 4, 5],
    weeklyProductivityGoal: 40,
    discoverySource: "",
    purpose: "",
  });

  // Hydrate profile form when profile details are available
  useEffect(() => {
    if (profile) {
      const parsed = parseCompositeAddress(profile);
      setProfileForm({
        fullName: profile.full_name || "",
        phone: profile.phone || "",
        address: parsed.address,
        position: profile.position || "",
        department: profile.department || "",
        employeeId: profile.employee_id || "",
        sss: profile.sss || "",
        philhealth: profile.philhealth || "",
        pagibig: profile.pagibig || "",
        tin: profile.tin || "",
        facePhoto: profile.face_photo || "",
        birthday: parsed.birthday,
        gender: parsed.gender,
        streetAddress: parsed.streetAddress,
        city: parsed.city,
        province: parsed.province,
        country: parsed.country,
        professionCategory: parsed.professionCategory,
        employmentType: parsed.employmentType,
        workArrangement: parsed.workArrangement,
        careerGoal: parsed.careerGoal,
        skillFocus: parsed.skillFocus,
        experienceLevel: parsed.experienceLevel,
        preferredWorkingDays: parsed.preferredWorkingDays,
        weeklyProductivityGoal: parsed.weeklyProductivityGoal,
        companyName: parsed.companyName,
      });
    }
  }, [profile]);

  // Restore onboarding step & form once profile loads
  useEffect(() => {
    if (profile && profile.id) {
      const parsed = parseCompositeAddress(profile);

      const isProfileIncomplete =
        !profile.full_name ||
        profile.full_name.trim() === "" ||
        profile.full_name.trim().toLowerCase() === "user" ||
        !parsed.birthday ||
        !parsed.gender ||
        !parsed.streetAddress ||
        !parsed.city ||
        !parsed.province ||
        !profile.position ||
        profile.position.trim() === "" ||
        !parsed.professionCategory ||
        !parsed.employmentType ||
        !parsed.workArrangement;

      const onboarded = safeLocalStorage.getItem(`vynora_onboarded_${profile.id}`);

      if (!onboarded || isProfileIncomplete) {
        VynoraDeveloperLogger.log(
          "Onboarding",
          "Incomplete profile detected! Initializing profile setup wizard dialog.",
          { profileId: profile.id, isProfileIncomplete }
        );
        setShowOnboarding(true);

        // 1. Restore step
        const savedStep = safeLocalStorage.getItem(`vynora_onboarding_step_${profile.id}`);
        if (savedStep) {
          const stepNum = parseInt(savedStep, 10);
          if (stepNum >= 1 && stepNum <= 5) {
            setOnboardingStep(stepNum);
            VynoraDeveloperLogger.log(
              "Onboarding",
              `Restored setup wizard to Step ${stepNum} from storage cache.`
            );
          }
        }

        // 2. Restore form fields
        const savedForm = safeLocalStorage.getItem(`vynora_onboarding_form_${profile.id}`);
        let parsedForm = {};
        if (savedForm) {
          try {
            parsedForm = JSON.parse(savedForm) || {};
            VynoraDeveloperLogger.log(
              "Onboarding",
              "Restored setup form fields from storage cache.",
              parsedForm
            );
          } catch (e) {
            console.error("Failed to parse saved onboarding form:", e);
          }
        }

        setOnboardingForm(current => ({
          ...current,
          fullName:
            parsedForm.fullName ||
            current.fullName ||
            profile.full_name ||
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            "",
          phone: parsedForm.phone || current.phone || profile.phone || "",
          birthday: parsedForm.birthday || current.birthday || parsed.birthday || "",
          gender: parsedForm.gender || current.gender || parsed.gender || "",
          streetAddress:
            parsedForm.streetAddress || current.streetAddress || parsed.streetAddress || "",
          city: parsedForm.city || current.city || parsed.city || "",
          province: parsedForm.province || current.province || parsed.province || "",
          country: parsedForm.country || current.country || parsed.country || "Philippines",
          avatar: parsedForm.avatar || current.avatar || profile.face_photo || "🚀",
          position: parsedForm.position || current.position || profile.position || "",
          professionCategory:
            parsedForm.professionCategory ||
            current.professionCategory ||
            parsed.professionCategory ||
            "",
          employmentType:
            parsedForm.employmentType || current.employmentType || parsed.employmentType || "",
          companyName: parsedForm.companyName || current.companyName || parsed.companyName || "",
          department: parsedForm.department || current.department || profile.department || "",
          employeeId: parsedForm.employeeId || current.employeeId || profile.employee_id || "",
          workArrangement:
            parsedForm.workArrangement || current.workArrangement || parsed.workArrangement || "",
          careerGoal: parsedForm.careerGoal || current.careerGoal || parsed.careerGoal || "",
          skillFocus: parsedForm.skillFocus || current.skillFocus || parsed.skillFocus || "",
          experienceLevel:
            parsedForm.experienceLevel || current.experienceLevel || parsed.experienceLevel || "",
          preferredWorkingDays:
            parsedForm.preferredWorkingDays ||
            current.preferredWorkingDays ||
            parsed.preferredWorkingDays ||
            [1, 2, 3, 4, 5],
          weeklyProductivityGoal:
            parsedForm.weeklyProductivityGoal != null
              ? parsedForm.weeklyProductivityGoal
              : parsed.weeklyProductivityGoal || 40,
          discoverySource: parsedForm.discoverySource || current.discoverySource || "",
          purpose: parsedForm.purpose || current.purpose || parsed.purpose || "",
        }));
      } else {
        setShowOnboarding(false);
      }
    }
  }, [profile, user]);

  // Persist onboarding step & form on changes
  useEffect(() => {
    if (profile && profile.id && showOnboarding) {
      safeLocalStorage.setItem(`vynora_onboarding_step_${profile.id}`, onboardingStep.toString());
    }
  }, [onboardingStep, profile, showOnboarding]);

  useEffect(() => {
    if (profile && profile.id && showOnboarding) {
      safeLocalStorage.setItem(
        `vynora_onboarding_form_${profile.id}`,
        JSON.stringify(onboardingForm)
      );
    }
  }, [onboardingForm, profile, showOnboarding]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setOnboardingForm(current => ({
        ...current,
        avatar: reader.result, // Base64 representation
      }));
      VynoraDeveloperLogger.log(
        "Onboarding",
        "Custom profile photo base64 asset uploaded successfully."
      );
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteOnboarding = async () => {
    if (!profile) return;
    try {
      setUpdatingProfile(true);
      VynoraDeveloperLogger.log(
        "Onboarding",
        "Submitting profile updates to Supabase...",
        onboardingForm
      );

      const cleanAddress = onboardingForm.streetAddress
        ? `${onboardingForm.streetAddress}, ${onboardingForm.city || ""}`.replace(/,\s*$/, "")
        : "";

      await updateProfile({
        fullName: onboardingForm.fullName,
        phone: onboardingForm.phone,
        address: cleanAddress,
        facePhoto: onboardingForm.avatar,
        position: onboardingForm.position,
        department: onboardingForm.department,
        employeeId: onboardingForm.employeeId,
        birthday: onboardingForm.birthday,
        gender: onboardingForm.gender,
        streetAddress: onboardingForm.streetAddress,
        city: onboardingForm.city,
        province: onboardingForm.province,
        country: onboardingForm.country,
        professionCategory: onboardingForm.professionCategory,
        employmentType: onboardingForm.employmentType,
        workArrangement: onboardingForm.workArrangement,
        careerGoal: onboardingForm.careerGoal,
        skillFocus: onboardingForm.skillFocus,
        experienceLevel: onboardingForm.experienceLevel,
        preferredWorkingDays: onboardingForm.preferredWorkingDays,
        weeklyProductivityGoal: onboardingForm.weeklyProductivityGoal,
        companyName: onboardingForm.companyName,
      });

      await refreshSessionData();

      // Save the onboarded flags
      safeLocalStorage.setItem(`vynora_onboarded_${profile.id}`, "true");
      safeLocalStorage.setItem(`vynora_discovery_${profile.id}`, onboardingForm.discoverySource);
      safeLocalStorage.setItem(`vynora_purpose_${profile.id}`, onboardingForm.purpose);

      // Clean up onboarding temporary states
      safeLocalStorage.removeItem(`vynora_onboarding_step_${profile.id}`);
      safeLocalStorage.removeItem(`vynora_onboarding_form_${profile.id}`);

      VynoraDeveloperLogger.log("Onboarding", "Onboarding completed successfully. Workspace launched!", {
        profileId: profile.id,
      });
      addToast("Setup complete! Welcome to Vynora.", "success");
      setShowOnboarding(false);
    } catch (err) {
      VynoraDeveloperLogger.log("Onboarding", "Failed to complete onboarding", err, "error");
      addToast("Failed to complete onboarding. Please try again.", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please upload a valid image file.", "warning");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      addToast("Image must be smaller than 1.5MB to save space.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setProfileForm((current) => ({ ...current, facePhoto: base64String }));
      addToast("Profile photo loaded! Click 'Save Changes' to update.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePhoto = () => {
    setProfileForm((current) => ({ ...current, facePhoto: "" }));
    addToast("Profile photo removed! Click 'Save Changes' to apply.", "info");
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileForm.fullName.trim()) {
      addToast("Full Name is required.", "warning");
      return;
    }

    setUpdatingProfile(true);
    try {
      const cleanAddress = profileForm.streetAddress
        ? `${profileForm.streetAddress}, ${profileForm.city || ""}`.replace(/,\s*$/, "")
        : profileForm.address;

      await updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        address: cleanAddress,
        position: profileForm.position,
        department: profileForm.department,
        employeeId: profileForm.employeeId,
        sss: profileForm.sss,
        philhealth: profileForm.philhealth,
        pagibig: profileForm.pagibig,
        tin: profileForm.tin,
        facePhoto: profileForm.facePhoto,
        birthday: profileForm.birthday,
        gender: profileForm.gender,
        streetAddress: profileForm.streetAddress,
        city: profileForm.city,
        province: profileForm.province,
        country: profileForm.country,
        professionCategory: profileForm.professionCategory,
        employmentType: profileForm.employmentType,
        workArrangement: profileForm.workArrangement,
        careerGoal: profileForm.careerGoal,
        skillFocus: profileForm.skillFocus,
        experienceLevel: profileForm.experienceLevel,
        preferredWorkingDays: profileForm.preferredWorkingDays,
        weeklyProductivityGoal: profileForm.weeklyProductivityGoal,
        companyName: profileForm.companyName,
      });
      addToast("Profile information updated successfully!", "success");
    } catch (err) {
      console.error("Error saving profile details:", err);
      addToast(err.message || "Failed to update profile.", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    if (e) e.preventDefault();
    if (!manualPassword) {
      addToast("Password cannot be empty.", "warning");
      return;
    }
    if (manualPassword.length < 6) {
      addToast("Password must be at least 6 characters.", "warning");
      return;
    }
    if (manualPassword !== confirmPassword) {
      addToast("Passwords do not match.", "warning");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: manualPassword,
      });
      if (error) throw error;
      addToast(
        "Manual login password updated successfully! You can now log in using your email and password.",
        "success"
      );
      setManualPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      addToast(err.message || "Failed to update password.", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return {
    profileForm,
    setProfileForm,
    onboardingForm,
    setOnboardingForm,
    showOnboarding,
    setShowOnboarding,
    onboardingError,
    setOnboardingError,
    onboardingStep,
    setOnboardingStep,
    validationAttempted,
    setValidationAttempted,
    updatingProfile,
    updatingPassword,
    manualPassword,
    setManualPassword,
    confirmPassword,
    setConfirmPassword,
    handleAvatarFileChange,
    handleCompleteOnboarding,
    handleProfilePhotoChange,
    handleRemoveProfilePhoto,
    handleSaveProfile,
    handleUpdatePassword,
  };
}
