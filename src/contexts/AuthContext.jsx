/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { requireSupabase, supabase, supabaseConfigured } from "../lib/supabaseClient";
import { defaultPermissions } from "../utils/permissions";
import { clientPermissionsToDb, dbPermissionsToClient } from "../utils/supabaseMappers";

const AuthContext = createContext(null);

const roleRedirects = {
  admin: "/personal-dashboard",
  employee: "/personal-dashboard",
  personal: "/personal-dashboard",
};

export function getRedirectPathByRole(role) {
  return "/personal-dashboard";
}

function getWorkspaceAccessRole(activeWorkspace, activeMembership, fallbackProfileRole) {
  return "personal";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [membership, setMembership] = useState(null);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [loading, setLoading] = useState(true);
  // Ref flag to suppress the onAuthStateChange listener during manual registration
  // flows where we call hydrateUser ourselves to avoid a double-hydration race condition.
  const suppressAuthListener = useRef(false);

  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setWorkspace(null);
    setWorkspaces([]);
    setMembership(null);
    setPermissions(defaultPermissions);
  };

  const hydrateUser = async (authUser) => {
    if (!authUser || !supabase) {
      clearAuthState();
      return { profile: null, workspace: null, permissions: defaultPermissions, workspaces: [] };
    }

    setUser(authUser);

    // Fetch user profile from public.profiles
    let { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) throw profileError;

    // If profile is missing (e.g. because tables were recreated), auto-create a default one!
    if (!profileData) {
      console.log("[AuthContext] Profile missing for logged-in user. Auto-creating...");
      const defaultProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        role: "personal",
        subscription_tier: "free",
        subscription_status: "active",
      };

      const { data: insertedData, error: insertError } = await supabase
        .from("profiles")
        .insert(defaultProfile)
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("[AuthContext] Failed to auto-create missing profile:", insertError);
      } else {
        profileData = insertedData;
      }
    }

    // Force profile role to personal
    if (profileData && profileData.role !== "personal") {
      profileData.role = "personal";
    }

    setProfile(profileData);

    if (!profileData) {
      setWorkspace(null);
      setMembership(null);
      setPermissions(defaultPermissions);
      setWorkspaces([]);
      return {
        profile: null,
        workspace: null,
        membership: null,
        permissions: defaultPermissions,
        workspaces: [],
      };
    }

    // Mock a clean personal workspace structure to satisfy the frontend component interfaces
    // without actually querying the missing workspaces/members tables in Supabase.
    const mockPersonalWorkspace = {
      id: "personal-ws",
      workspace_name: "Personal Workspace",
      shift_start_time: "09:00",
      expected_work_hours: 8,
      payroll_period: "monthly",
      default_hourly_rate: profileData.hourly_rate || 100,
      default_daily_rate: profileData.daily_rate || 800,
      late_grace_minutes: 0,
      overtime_rate: 1.25,
      break_is_paid: false,
    };

    const mockMembership = {
      id: "personal-membership",
      role: "personal",
      status: "active",
      workspace: mockPersonalWorkspace,
    };

    setWorkspace(mockPersonalWorkspace);
    setWorkspaces([mockPersonalWorkspace]);
    setMembership(mockMembership);
    setPermissions(defaultPermissions);

    return {
      profile: profileData,
      workspace: mockPersonalWorkspace,
      membership: mockMembership,
      permissions: defaultPermissions,
      workspaces: [mockPersonalWorkspace],
    };
  };

  useEffect(() => {
    let active = true;

    async function init() {
      if (!supabaseConfigured || !supabase) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session?.user) await hydrateUser(data.session.user);
        else clearAuthState();
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    if (!supabase) return () => {
      active = false;
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      // Skip if a registration flow is already managing hydration manually
      if (suppressAuthListener.current) return;
      if (session?.user) {
        setLoading(true);
        hydrateUser(session.user)
          .catch((err) => {
            console.error("[AuthContext] Failed to hydrate user on auth state change:", err);
            clearAuthState();
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      } else {
        clearAuthState();
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const ensureSessionForRegistration = (session) => {
    if (!session) {
      throw new Error(
        "Account was created, but Supabase email confirmation is enabled. For local testing, disable email confirmation in Supabase Auth settings, or confirm the email before logging in.",
      );
    }
  };

  const generateWorkspaceCode = async () => {
    const client = requireSupabase();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;
      const { data, error } = await client
        .from("workspaces")
        .select("id")
        .eq("workspace_code", code)
        .maybeSingle();

      if (error) throw error;
      if (!data) return code;
    }

    return `TRK-${Date.now().toString().slice(-5)}`;
  };

  const upsertProfile = async (authUser, values) => {
    const client = requireSupabase();
    const profilePayload = {
      id: authUser.id,
      full_name: values.fullName?.trim() || values.full_name?.trim() || "",
      email: values.email?.trim() || authUser.email,
      role: values.role,
      phone: values.phone || "",
      address: values.address || "",
      department: values.department || "",
      position: values.position || "",
      employee_id: values.employeeId || values.employee_id || "",
      sss: values.sss || "",
      philhealth: values.philhealth || "",
      pagibig: values.pagibig || "",
      tin: values.tin || "",
    };

    const { data, error } = await client
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const registerAdmin = async (adminValues, workspaceValues) => {
    const client = requireSupabase();
    setLoading(true);
    suppressAuthListener.current = true;

    try {
      let authUser = null;
      let authSession = null;

      const { data: authData, error: authError } = await client.auth.signUp({
        email: adminValues.email.trim(),
        password: adminValues.password,
        options: {
          data: {
            full_name: adminValues.fullName.trim(),
            role: "admin",
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered") || authError.message.toLowerCase().includes("already exists")) {
          // Attempt to sign in with this password
          const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: adminValues.email.trim(),
            password: adminValues.password,
          });

          if (signInError) {
            throw new Error("This email is already registered. If you are the owner, please enter your correct password to login and connect roles.");
          }
          authUser = signInData.user;
          authSession = signInData.session;
        } else {
          throw authError;
        }
      } else {
        authUser = authData.user;
        authSession = authData.session;
      }

      ensureSessionForRegistration(authSession);

      const createdProfile = await upsertProfile(authUser, {
        ...adminValues,
        role: profile?.role || "admin",
      });
      const workspaceCode = await generateWorkspaceCode();

      const { data: workspaceData, error: workspaceError } = await client
        .from("workspaces")
        .insert({
          workspace_name: workspaceValues.workspaceName.trim(),
          workspace_code: workspaceCode,
          owner_id: authUser.id,
          industry: workspaceValues.industry,
          team_size: workspaceValues.teamSize,
          company_address: workspaceValues.companyAddress || "",
          shift_start_time: workspaceValues.shiftStartTime || "08:00",
          expected_work_hours: Number(workspaceValues.expectedWorkHours || 8),
          payroll_period: workspaceValues.payrollPeriod || "semi-monthly",
          contact_number: workspaceValues.contactNumber || adminValues.phone || "",
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      const { error: memberError } = await client.from("workspace_members").insert({
        workspace_id: workspaceData.id,
        user_id: authUser.id,
        role: "admin",
        status: "active",
      });

      if (memberError) throw memberError;

      const { error: permissionError } = await client
        .from("employee_permissions")
        .insert(clientPermissionsToDb(defaultPermissions, workspaceData.id));

      if (permissionError) throw permissionError;

      await hydrateUser(authUser);
      return {
        profile: createdProfile,
        workspace: workspaceData,
        redirectTo: "/admin-dashboard",
      };
    } finally {
      suppressAuthListener.current = false;
      setLoading(false);
    }
  };

  const validateWorkspaceCode = async (workspaceCode) => {
    const client = requireSupabase();
    const code = workspaceCode.trim().toUpperCase();
    const { data, error } = await client
      .from("workspaces")
      .select("*")
      .eq("workspace_code", code)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Workspace code not found. Please check the code from your admin.");
    return data;
  };

  const registerEmployee = async (workspaceCode, employeeValues) => {
    const client = requireSupabase();
    setLoading(true);
    suppressAuthListener.current = true;

    try {
      const workspaceData = await validateWorkspaceCode(workspaceCode);
      let authUser = null;
      let authSession = null;

      const { data: authData, error: authError } = await client.auth.signUp({
        email: employeeValues.email.trim(),
        password: employeeValues.password,
        options: {
          data: {
            full_name: employeeValues.fullName.trim(),
            role: "employee",
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered") || authError.message.toLowerCase().includes("already exists")) {
          // Attempt to sign in with this password
          const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: employeeValues.email.trim(),
            password: employeeValues.password,
          });

          if (signInError) {
            throw new Error("This email is already registered. If you are the owner, please enter your correct password to login and connect roles.");
          }
          authUser = signInData.user;
          authSession = signInData.session;
        } else {
          throw authError;
        }
      } else {
        authUser = authData.user;
        authSession = authData.session;
      }

      ensureSessionForRegistration(authSession);

      const createdProfile = await upsertProfile(authUser, {
        ...employeeValues,
        role: profile?.role || "employee",
      });

      const { error: memberError } = await client
        .from("workspace_members")
        .upsert(
          {
            workspace_id: workspaceData.id,
            user_id: authUser.id,
            role: "employee",
            status: "active",
          },
          { onConflict: "workspace_id,user_id" },
        );

      if (memberError) throw memberError;

      await hydrateUser(authUser);
      return {
        profile: createdProfile,
        workspace: workspaceData,
        redirectTo: "/employee-dashboard",
      };
    } finally {
      suppressAuthListener.current = false;
      setLoading(false);
    }
  };

  const registerPersonal = async (values) => {
    const client = requireSupabase();
    setLoading(true);

    try {
      let authUser = null;
      let authSession = null;

      const { data: authData, error: authError } = await client.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
            role: "personal",
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered") || authError.message.toLowerCase().includes("already exists")) {
          // Attempt to sign in with this password
          const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: values.email.trim(),
            password: values.password,
          });

          if (signInError) {
            throw new Error("This email is already registered. If you are the owner, please enter your correct password to login and connect roles.");
          }
          authUser = signInData.user;
          authSession = signInData.session;
        } else {
          throw authError;
        }
      } else {
        authUser = authData.user;
        authSession = authData.session;
      }

      ensureSessionForRegistration(authSession);
      await upsertProfile(authUser, { ...values, role: profile?.role || "personal" });
      await hydrateUser(authUser);
      return { redirectTo: "/personal-dashboard" };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, expectedRole, workspaceCode }) => {
    const client = requireSupabase();
    setLoading(true);

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const loaded = await hydrateUser(data.user);
      const loadedRole = loaded.profile?.role;

      if (!loadedRole) {
        await client.auth.signOut();
        throw new Error("This account does not have a Trackly profile yet.");
      }

      // Flexible Role Validation:
      if (expectedRole === "personal") {
        // Every user has access to their own Personal Workspace, always allowed!
      } else if (expectedRole === "admin") {
        // Must be an admin/owner of a workspace
        const hasAdminAccess = loaded.workspaces.some(w => w.workspace_name !== "Personal Workspace" && w.owner_id === data.user.id) || (loaded.membership?.workspace?.workspace_name !== "Personal Workspace" && loaded.membership?.role === "admin") || loadedRole === "admin";
        if (!hasAdminAccess) {
          await client.auth.signOut();
          throw new Error("This account is not registered as an Admin or Workspace Owner.");
        }
      } else if (expectedRole === "employee") {
        // Must be a member of a company workspace
        const hasEmployeeAccess = loaded.workspaces.some(w => w.workspace_name !== "Personal Workspace") || loadedRole === "employee";
        if (!hasEmployeeAccess) {
          await client.auth.signOut();
          throw new Error("This account is not associated with any employee workspace.");
        }
      }

      if (workspaceCode && expectedRole !== "personal") {
        const expectedCode = workspaceCode.trim().toUpperCase();
        const actualCode = loaded.workspace?.workspace_code?.toUpperCase();
        if (expectedCode && actualCode !== expectedCode) {
          // Attempt to switch to this workspace if they belong to it
          const matchingWorkspace = loaded.workspaces.find(w => w.workspace_code?.toUpperCase() === expectedCode);
          if (matchingWorkspace) {
            await switchWorkspace(matchingWorkspace.id);
          } else {
            await client.auth.signOut();
            throw new Error("Workspace code does not match this account.");
          }
        }
      }

      // Determine correct redirect path
      return expectedRole ? getRedirectPathByRole(expectedRole) : getRedirectPathByRole(loadedRole);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    clearAuthState();
  };

  const updateProfile = async (values) => {
    const client = requireSupabase();
    if (!user) throw new Error("You must be logged in to update your profile.");

    const payload = {
      full_name: values.fullName ?? values.full_name ?? profile?.full_name,
      email: values.email ?? profile?.email,
      phone: values.phone ?? "",
      address: values.address ?? "",
      department: values.department ?? "",
      position: values.position ?? "",
      employee_id: values.employeeId ?? values.employee_id ?? profile?.employee_id ?? "",
      sss: values.sss ?? profile?.sss ?? "",
      philhealth: values.philhealth ?? profile?.philhealth ?? "",
      pagibig: values.pagibig ?? profile?.pagibig ?? "",
      tin: values.tin ?? profile?.tin ?? "",
      face_photo: values.face_photo ?? values.facePhoto ?? profile?.face_photo ?? "",
    };

    const { data, error } = await client
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const updateWorkspace = async (values) => {
    const client = requireSupabase();
    if (!workspace?.id) throw new Error("No workspace loaded.");

    const { data, error } = await client
      .from("workspaces")
      .update({
        workspace_name: values.workspaceName,
        industry: values.industry,
        team_size: values.teamSize,
        company_address: values.companyAddress,
        contact_number: values.contactNumber,
        shift_start_time: values.shiftStartTime,
        expected_work_hours: Number(values.expectedWorkHours || 8),
        late_grace_minutes: Number(values.lateGraceMinutes || 0),
        default_hourly_rate: Number(values.hourlyRate || 0),
        default_daily_rate: Number(values.dailyRate || 0),
        overtime_rate: Number(values.overtimeRate || 1.25),
        payroll_period: values.payrollPeriod || "semi-monthly",
        break_hours: Number(values.breakHours ?? 1.0),
        break_is_paid: Boolean(values.breakIsPaid ?? false),
        overtime_threshold_minutes: Number(values.overtimeThresholdMinutes ?? 30),
        custom_deductions: values.customDeductions || [],
        holiday_regular_rate: Number(values.holidayRegularRate ?? 2.0),
        holiday_special_rate: Number(values.holidaySpecialRate ?? 1.3),
        night_diff_rate: Number(values.nightDiffRate ?? 0.10),
        geofence_enabled: Boolean(values.geofenceEnabled ?? false),
        geofence_latitude: (values.geofenceLatitude != null && values.geofenceLatitude !== "") ? Number(values.geofenceLatitude) : null,
        geofence_longitude: (values.geofenceLongitude != null && values.geofenceLongitude !== "") ? Number(values.geofenceLongitude) : null,
        geofence_radius_meters: (values.geofenceRadiusMeters != null && values.geofenceRadiusMeters !== "") ? Number(values.geofenceRadiusMeters) : 100,
      })
      .eq("id", workspace.id)
      .select()
      .single();

    if (error) throw error;
    setWorkspace(data);
    return data;
  };

  const updatePermissions = async (nextPermissions) => {
    const client = requireSupabase();
    if (!workspace?.id) throw new Error("No workspace loaded.");

    const { data, error } = await client
      .from("employee_permissions")
      .upsert(clientPermissionsToDb(nextPermissions, workspace.id), { onConflict: "workspace_id" })
      .select()
      .single();

    if (error) throw error;
    const mapped = dbPermissionsToClient(data);
    setPermissions(mapped);
    return mapped;
  };

  const loginWithGoogle = async (expectedRole = "personal", workspaceCode = null) => {
    const client = requireSupabase();
    setLoading(true);
    try {
      localStorage.setItem("trackly_oauth_pending_role", expectedRole);
      if (workspaceCode) {
        localStorage.setItem("trackly_oauth_pending_workspace", workspaceCode.trim().toUpperCase());
      } else {
        localStorage.removeItem("trackly_oauth_pending_workspace");
      }

      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const linkGoogleIdentity = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const unlinkGoogleIdentity = async (identityId) => {
    const client = requireSupabase();
    const { error } = await client.auth.unlinkIdentity({
      identity_id: identityId,
    });
    if (error) throw error;
    await refreshSessionData();
  };

  const loginWithFacebook = async (expectedRole = "personal", workspaceCode = null) => {
    const client = requireSupabase();
    setLoading(true);
    try {
      localStorage.setItem("trackly_oauth_pending_role", expectedRole);
      if (workspaceCode) {
        localStorage.setItem("trackly_oauth_pending_workspace", workspaceCode.trim().toUpperCase());
      } else {
        localStorage.removeItem("trackly_oauth_pending_workspace");
      }

      const { error } = await client.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const linkFacebookIdentity = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.linkIdentity({
      provider: "facebook",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const unlinkFacebookIdentity = async (identityId) => {
    const client = requireSupabase();
    const { error } = await client.auth.unlinkIdentity({
      identity_id: identityId,
    });
    if (error) throw error;
    await refreshSessionData();
  };

  const completeGoogleRegistration = async (values) => {
    const client = requireSupabase();
    if (!user) throw new Error("No active Google/Apple session found. Please try logging in again.");

    setLoading(true);
    try {
      if (values.manualPassword) {
        const { error: pwdError } = await client.auth.updateUser({
          password: values.manualPassword,
        });
        if (pwdError) throw pwdError;
      }
      const role = values.role;
      await upsertProfile(user, {
        fullName: values.fullName,
        email: user.email,
        role: role,
        phone: values.phone,
        address: values.address,
        department: values.department,
        position: values.position,
        employeeId: values.employeeId,
        sss: values.sss,
        philhealth: values.philhealth,
        pagibig: values.pagibig,
        tin: values.tin,
      });

      if (role === "admin") {
        const workspaceCode = await generateWorkspaceCode();
        const { data: wsData, error: wsError } = await client
          .from("workspaces")
          .insert({
            workspace_name: values.workspaceName.trim(),
            workspace_code: workspaceCode,
            owner_id: user.id,
            industry: values.industry,
            team_size: values.teamSize,
            company_address: values.companyAddress || "",
            shift_start_time: values.shiftStartTime || "08:00",
            expected_work_hours: Number(values.expectedWorkHours || 8),
            payroll_period: values.payrollPeriod || "semi-monthly",
            contact_number: values.phone || "",
          })
          .select()
          .single();

        if (wsError) throw wsError;

        const { error: memberError } = await client.from("workspace_members").insert({
          workspace_id: wsData.id,
          user_id: user.id,
          role: "admin",
          status: "active",
        });
        if (memberError) throw memberError;

        const { error: permissionError } = await client
          .from("employee_permissions")
          .insert(clientPermissionsToDb(defaultPermissions, wsData.id));
        if (permissionError) throw permissionError;

      } else if (role === "employee") {
        const workspaceDataObj = await validateWorkspaceCode(values.workspaceCode);

        const { error: memberError } = await client
          .from("workspace_members")
          .upsert({
            workspace_id: workspaceDataObj.id,
            user_id: user.id,
            role: "employee",
            status: "active",
          }, { onConflict: "workspace_id,user_id" });
        if (memberError) throw memberError;
      }

      await hydrateUser(user);

      localStorage.removeItem("trackly_oauth_pending_role");
      localStorage.removeItem("trackly_oauth_pending_workspace");

      return getRedirectPathByRole(role);
    } finally {
      setLoading(false);
    }
  };

  const refreshSessionData = async () => {
    if (!user) return null;
    return hydrateUser(user);
  };

  const connectPersonalAccountToWorkspace = async (workspaceCode, values) => {
    const client = requireSupabase();
    if (!user) throw new Error("No active session found.");
    setLoading(true);

    try {
      const workspaceData = await validateWorkspaceCode(workspaceCode);
      
      const updatedProfile = await upsertProfile(user, {
        ...values,
        fullName: values.fullName || profile?.full_name || user?.user_metadata?.full_name || "",
        role: "employee",
      });

      const { error: memberError } = await client
        .from("workspace_members")
        .upsert(
          {
            workspace_id: workspaceData.id,
            user_id: user.id,
            role: "employee",
            status: "active",
          },
          { onConflict: "workspace_id,user_id" }
        );

      if (memberError) throw memberError;

      await hydrateUser(user);

      return {
        profile: updatedProfile,
        workspace: workspaceData,
        redirectTo: "/employee-dashboard",
      };
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromWorkspace = async () => {
    const client = requireSupabase();
    if (!user || !workspace?.id) return;
    setLoading(true);
    try {
      const { error: memberError } = await client
        .from("workspace_members")
        .delete()
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      await upsertProfile(user, {
        role: "personal",
      });

      localStorage.removeItem("trackly_active_workspace_id");
      await hydrateUser(user);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    const client = requireSupabase();
    if (!user) throw new Error("No active session found.");
    setLoading(true);
    try {
      const { data, error } = await client.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId) => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_members")
        .select("id, role, status, joined_at, workspace:workspaces(*)")
        .eq("user_id", user.id)
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .maybeSingle();

      if (memberError) throw memberError;
      if (!memberData) throw new Error("No active membership found for this workspace.");

      const { data: permissionsData, error: permissionsError } = await supabase
        .from("employee_permissions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (permissionsError) throw permissionsError;

      localStorage.setItem("trackly_active_workspace_id", workspaceId);
      
      setWorkspace(memberData.workspace);
      setMembership(memberData);
      setPermissions(dbPermissionsToClient(permissionsData));

      return {
        workspace: memberData.workspace,
        membership: memberData,
        role: getWorkspaceAccessRole(memberData.workspace, memberData, profile?.role),
      };
    } catch (err) {
      console.error("Failed to switch workspace:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      currentUser: user,
      getRedirectPathByRole,
      loading,
      login,
      logout,
      membership,
      permissions,
      profile,
      refreshSessionData,
      registerAdmin,
      registerEmployee,
      registerPersonal,
      role: getWorkspaceAccessRole(workspace, membership, profile?.role),
      supabaseConfigured,
      updatePermissions,
      updateProfile,
      updateWorkspace,
      user,
      validateWorkspaceCode,
      workspace,
      workspaces,
      switchWorkspace,
      loginWithGoogle,
      linkGoogleIdentity,
      unlinkGoogleIdentity,
      loginWithFacebook,
      linkFacebookIdentity,
      unlinkFacebookIdentity,
      completeGoogleRegistration,
      connectPersonalAccountToWorkspace,
      disconnectFromWorkspace,
      updatePassword,
    }),
    [loading, membership, permissions, profile, user, workspace, workspaces],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
