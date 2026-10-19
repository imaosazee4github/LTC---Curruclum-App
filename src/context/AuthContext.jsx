import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getCurrentSession,
  getMyAccessRoles,
  getProfile,
  registerStudent as registerStudentRequest,
  signIn as signInRequest,
  signOut as signOutRequest,
  subscribeToAuthChanges,
} from "../services/authService";

import { AuthContext } from "./authContextStore.js";

function readSelectedRole(userId) {
  try {
    return sessionStorage.getItem(`ltc-active-role:${userId}`);
  } catch {
    return null;
  }
}

function saveSelectedRole(userId, role) {
  try {
    const key = `ltc-active-role:${userId}`;

    if (role) {
      sessionStorage.setItem(key, role);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Role selection still works without browser storage.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const currentUserId = useRef(null);
  const loadVersion = useRef(0);

  const clearAccount = useCallback(() => {
    loadVersion.current += 1;
    currentUserId.current = null;

    setProfile(null);
    setAvailableRoles([]);
    setActiveRole(null);
  }, []);

  const loadProfile = useCallback(async (userId) => {
    const version = ++loadVersion.current;
    currentUserId.current = userId;

    setProfile(null);
    setAvailableRoles([]);
    setActiveRole(null);

    if (!userId) {
      return null;
    }

    const profileData = await getProfile(userId);

    let roles = [];

    if (profileData?.account_status === "active") {
      const access = await getMyAccessRoles();

      roles = Array.isArray(access?.roles)
        ? access.roles
        : [];
    }

    if (
      version !== loadVersion.current ||
      currentUserId.current !== userId
    ) {
      return null;
    }

    const rememberedRole = readSelectedRole(userId);

    const selectedRole = roles.includes(rememberedRole)
      ? rememberedRole
      : roles.includes(profileData?.role)
        ? profileData.role
        : roles[0] || null;

    setProfile(profileData);
    setAvailableRoles(roles);
    setActiveRole(selectedRole);

    saveSelectedRole(userId, selectedRole);

    return profileData;
  }, []);

  useEffect(() => {
    let active = true;
    let authEventVersion = 0;
    let sessionVersion = 0;

    const timers = new Set();

    async function applySession(nextSession, event) {
      if (!active) {
        return;
      }

      const nextUser = nextSession?.user || null;
      const nextUserId = nextUser?.id || null;

      const routineEvent =
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "SESSION_RESTORED";

      const sameAccount =
        Boolean(nextUserId) &&
        currentUserId.current === nextUserId;

      // Keep the session current without unmounting forms.
      // This also avoids duplicate profile requests while
      // the same account is already being loaded.
      if (sameAccount && routineEvent) {
        setSession(nextSession);
        setUser(nextUser);
        return;
      }

      const version = ++sessionVersion;

      setLoading(true);
      setAuthError("");
      setSession(nextSession);
      setUser(nextUser);

      try {
        if (nextUserId) {
          await loadProfile(nextUserId);
        } else {
          clearAccount();
        }
      } catch (error) {
        if (active && version === sessionVersion) {
          clearAccount();

          setAuthError(
            error?.message || "Unable to load your account.",
          );
        }
      } finally {
        if (active && version === sessionVersion) {
          setLoading(false);
        }
      }
    }

    async function initializeAuth() {
      const startingVersion = authEventVersion;

      try {
        const currentSession = await getCurrentSession();

        if (active && startingVersion === authEventVersion) {
          await applySession(
            currentSession,
            "SESSION_RESTORED",
          );
        }
      } catch (error) {
        if (active && startingVersion === authEventVersion) {
          clearAccount();

          setAuthError(
            error?.message || "Unable to load your account.",
          );

          setLoading(false);
        }
      }
    }

    const subscription = subscribeToAuthChanges(
      (event, nextSession) => {
        const eventVersion = ++authEventVersion;

        // Run database requests after the auth callback exits.
        const timer = window.setTimeout(() => {
          timers.delete(timer);

          if (active && eventVersion === authEventVersion) {
            void applySession(nextSession, event);
          }
        }, 0);

        timers.add(timer);
      },
    );

    void initializeAuth();

    return () => {
      active = false;
      sessionVersion += 1;
      loadVersion.current += 1;
      currentUserId.current = null;

      timers.forEach((timer) => window.clearTimeout(timer));
      subscription?.unsubscribe();
    };
  }, [loadProfile, clearAccount]);

  const registerStudent = useCallback(async (credentials) => {
    setAuthError("");

    try {
      return await registerStudentRequest(credentials);
    } catch (error) {
      setAuthError(error?.message || "Registration failed.");
      throw error;
    }
  }, []);

  const signIn = useCallback(async (credentials) => {
    setAuthError("");

    try {
      return await signInRequest(credentials);
    } catch (error) {
      setAuthError(error?.message || "Sign in failed.");
      throw error;
    }
  }, []);

  const selectRole = useCallback(
    (nextRole) => {
      if (
        !profile?.id ||
        profile.account_status !== "active" ||
        !availableRoles.includes(nextRole)
      ) {
        throw new Error(
          "This role is not available for your account.",
        );
      }

      saveSelectedRole(profile.id, nextRole);
      setActiveRole(nextRole);
    },
    [profile, availableRoles],
  );

  const signOut = useCallback(async () => {
    setAuthError("");

    const signingOutUserId = currentUserId.current;

    try {
      await signOutRequest();

      if (signingOutUserId) {
        saveSelectedRole(signingOutUserId, null);
      }

      setSession(null);
      setUser(null);
      clearAccount();
      setLoading(false);
    } catch (error) {
      setAuthError(error?.message || "Sign out failed.");
      throw error;
    }
  }, [clearAccount]);

  const userId = user?.id;

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      clearAccount();
      return null;
    }

    setLoading(true);
    setAuthError("");

    const request = loadProfile(userId);
    const version = loadVersion.current;

    try {
      return await request;
    } catch (error) {
      if (version === loadVersion.current) {
        clearAccount();

        setAuthError(
          error?.message || "Unable to refresh your account.",
        );

        setLoading(false);
      }

      throw error;
    } finally {
      if (version === loadVersion.current) {
        setLoading(false);
      }
    }
  }, [loadProfile, clearAccount, userId]);

  const clearAuthError = useCallback(() => {
    setAuthError("");
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,

      role: activeRole,
      activeRole,
      primaryRole: profile?.role || null,
      availableRoles,

      accountStatus: profile?.account_status || null,
      loading,
      authError,

      registerStudent,
      signIn,
      signOut,
      selectRole,
      refreshProfile,
      clearAuthError,

      isAuthenticated: Boolean(session?.user),
    }),
    [
      session,
      user,
      profile,
      activeRole,
      availableRoles,
      loading,
      authError,
      registerStudent,
      signIn,
      signOut,
      selectRole,
      refreshProfile,
      clearAuthError,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}