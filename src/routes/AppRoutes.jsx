import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import PersonalDashboardPage from "../pages/PersonalDashboardPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import CompleteRegistrationPage from "../pages/CompleteRegistrationPage";
import TermsPage from "../pages/TermsPage";
import PrivacyPage from "../pages/PrivacyPage";
import ProtectedRoute from "./ProtectedRoute";

// Vynora Public Subpages
import FeaturesPage from "../pages/vynora/FeaturesPage";
import HowItWorksPage from "../pages/vynora/HowItWorksPage";
import PricingPage from "../pages/vynora/PricingPage";
import AboutPage from "../pages/vynora/AboutPage";
import ContactPage from "../pages/vynora/ContactPage";

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111F]">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
          
          {/* Protected Personal Portal */}
          <Route 
            path="/personal-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["personal"]}>
                <PersonalDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/personal_dashboard" 
            element={
              <ProtectedRoute allowedRoles={["personal"]}>
                <PersonalDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/personal dashboard" 
            element={
              <ProtectedRoute allowedRoles={["personal"]}>
                <PersonalDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Route redirects to Landing or Dashboard */}
          <Route path="*" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default AppRoutes;

