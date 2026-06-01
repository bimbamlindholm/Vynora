import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, getRedirectPathByRole } from "../contexts/AuthContext";
import LoginForm from "../components/LoginForm";
import LoginHero from "../components/LoginHero";
import LoginNavbar from "../components/LoginNavbar";
import LoginTrustBar from "../components/LoginTrustBar";
import PageTransition from "../components/PageTransition";
import { getLoginPortal } from "../utils/loginPortals.jsx";

function LoginPage({ portalType = "personal" }) {
  const [searchParams] = useSearchParams();
  const portal = getLoginPortal(searchParams.get("type") || portalType);
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!role) {
        navigate("/complete-registration", { replace: true });
        return;
      }

      const currentRolePath = getRedirectPathByRole(role);

      // Do not force-redirect a logged-in personal user away from the Admin/Employee
      // login portals. They may be trying to use the same email for another workspace.
      if (portal.dashboardTo === currentRolePath) {
        navigate(currentRolePath, { replace: true });
      }
    }
  }, [user, role, loading, navigate, portal.dashboardTo]);

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50">
        <div className="galaxy-bg" />
        <div className="register-planet-glow" />
        <div className="noise-overlay" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <LoginNavbar portal={portal} />
          <div className="login-layout mx-auto grid w-full max-w-7xl flex-1 items-start gap-8 px-4 py-8 sm:px-6 md:items-center lg:px-8 lg:py-10">
            <LoginHero portal={portal} />
            <LoginForm portal={portal} />
          </div>
          <LoginTrustBar />
        </div>
      </main>
    </PageTransition>
  );
}

export default LoginPage;
