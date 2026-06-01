export const loginPortals = {
  personal: {
    badge: "Personal Portal",
    benefitTitle: "Your Personal Workspace",
    dividerText: "or log in with your personal email",
    fields: [
      {
        label: "Personal Email Address",
        name: "personalEmail",
        placeholder: "Enter your personal email",
        type: "email",
      },
      {
        label: "Password",
        name: "personalPassword",
        placeholder: "Enter your password",
        type: "password",
      },
    ],
    formTitle: "Personal Account Log In",
    googleLabel: "Connect Personal Google Account",
    facebookLabel: "Connect Personal Facebook Account",
    dashboardTo: "/personal-dashboard",
    headline: (
      <>
        Log in to your
        <br />
        personal <span className="gradient-text">time hub</span>.
      </>
    ),
    helperText: "New to personal tracking?",
    primaryWord: "time hub",
    signupLabel: "Create account",
    signupTo: "/register?type=personal",
    subtitle: "Access your personal dashboard, track your hours, and keep your productivity moving.",
    submitLabel: "Log In as Personal",
  },
};

export function getLoginPortal(type) {
  return loginPortals.personal;
}

