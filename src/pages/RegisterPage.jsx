import PageTransition from "../components/PageTransition";
import RegisterForm from "../components/RegisterForm";
import RegisterHero from "../components/RegisterHero";
import RegisterNavbar from "../components/RegisterNavbar";
import TrustBar from "../components/TrustBar";

function RegisterPage() {
  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden bg-[#07111F] text-slate-50">
        <div className="galaxy-bg" />
        <div className="register-planet-glow" />
        <div className="noise-overlay" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <RegisterNavbar />
          <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-12">
            <RegisterHero />
            <RegisterForm />
          </div>
          <TrustBar />
        </div>
      </main>
    </PageTransition>
  );
}

export default RegisterPage;
