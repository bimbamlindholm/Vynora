import { motion } from "framer-motion";
import PersonalProfileCard from "../PersonalProfileCard";

function PersonalInformationSection({
  profile,
  user,
  profileForm,
  setProfileForm,
  updatingProfile,
  handleSaveProfile,
  handleProfilePhotoChange,
  handleRemoveProfilePhoto,
  setActiveTab,
  subscriptionTier,
  setSubscriptionTier
}) {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PersonalProfileCard
        profile={profile}
        user={user}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        updatingProfile={updatingProfile}
        handleSaveProfile={handleSaveProfile}
        handleProfilePhotoChange={handleProfilePhotoChange}
        handleRemoveProfilePhoto={handleRemoveProfilePhoto}
        setActiveTab={setActiveTab}
        subscriptionTier={subscriptionTier}
        setSubscriptionTier={setSubscriptionTier}
      />
    </motion.div>
  );
}

export default PersonalInformationSection;
