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
    // Role selection still works when browser storage is unavailable.
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

    if (!userId) {
      setProfile(null);
      setAvailableRoles([]);
      setActiveRole(null);
      return null;
    }

    // Clear previous permissions while checking the current account.
    setProfile(null);
    setAvailableRoles([]);
    setActiveRole(null);

    const profileData = await getProfile(userId);

    let roles = [];

    if (profileData?.account_status === "active") {
      const access = await getMyAccessRoles();
      roles = access.roles;
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
    const timers = new Set();

    async function applySession(nextSession) {
      if (!active) return;

      setLoading(true);
      setAuthError("");
      setSession(nextSession);
      setUser(nextSession?.user || null);

      try {
        if (nextSession?.user?.id) {
          await loadProfile(nextSession.user.id);
        } else {
          clearAccount();
        }
      } catch (error) {
        if (active) {
          clearAccount();
          setAuthError(
            error.message || "Unable to load your account.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    async function initializeAuth() {
      const startingVersion = authEventVersion;

      try {
        const currentSession = await getCurrentSession();

        if (active && startingVersion === authEventVersion) {
          await applySession(currentSession);
        }
      } catch (error) {
        if (active && startingVersion === authEventVersion) {
          clearAccount();
          setAuthError(
            error.message || "Unable to load your account.",
          );
          setLoading(false);
        }
      }
    }

    const subscription = subscribeToAuthChanges(
      (_event, nextSession) => {
        const eventVersion = ++authEventVersion;

        // Run database requests after the auth callback completes.
        const timer = window.setTimeout(() => {
          timers.delete(timer);

          if (active && eventVersion === authEventVersion) {
            void applySession(nextSession);
          }
        }, 0);

        timers.add(timer);
      },
    );

    void initializeAuth();

    return () => {
      active = false;
      loadVersion.current += 1;
      timers.forEach((timer) => window.clearTimeout(timer));
      subscription?.unsubscribe();
    };
  }, [loadProfile, clearAccount]);

  const registerStudent = useCallback(async (credentials) => {
    setAuthError("");

    try {
      return await registerStudentRequest(credentials);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const signIn = useCallback(async (credentials) => {
    setAuthError("");

    try {
      return await signInRequest(credentials);
    } catch (error) {
      setAuthError(error.message);
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

    try {
      await signOutRequest();

      if (currentUserId.current) {
        saveSelectedRole(currentUserId.current, null);
      }

      setSession(null);
      setUser(null);
      clearAccount();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, [clearAccount]);

  // const refreshProfile = useCallback(async () => {
  //   if (!user?.id) {
  //     clearAccount();
  //     return null;
  //   }

  //   setLoading(true);
  //   setAuthError("");

  //   try {
  //     return await loadProfile(user.id);
  //   } catch (error) {
  //     clearAccount();
  //     setAuthError(error.message);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [loadProfile, clearAccount, user?.id]);

  const userId = user?.id;

const refreshProfile = useCallback(async () => {
  if (!userId) {
    clearAccount();
    return null;
  }

  setLoading(true);
  setAuthError("");

  try {
    return await loadProfile(userId);
  } catch (error) {
    clearAccount();
    setAuthError(error.message);
    throw error;
  } finally {
    setLoading(false);
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

      // Used by existing hooks, route guards and dashboard redirects.
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