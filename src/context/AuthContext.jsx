import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentSession,
  getProfile,
  registerStudent as registerStudentRequest,
  signIn as signInRequest,
  signOut as signOutRequest,
  subscribeToAuthChanges,
} from "../services/authService";

export const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [session, setSession] =
    useState(null);

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState("");

  const loadProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null);
        return null;
      }

      const profileData =
        await getProfile(userId);

      setProfile(profileData);

      return profileData;
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const currentSession =
          await getCurrentSession();

        if (!active) {
          return;
        }

        setSession(currentSession);
        setUser(
          currentSession?.user || null,
        );

        if (currentSession?.user?.id) {
          await loadProfile(
            currentSession.user.id,
          );
        }
      } catch (error) {
        if (active) {
          console.error(
            "Authentication initialization failed:",
            error,
          );

          setAuthError(
            error.message ||
              "Unable to load your account.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const subscription =
      subscribeToAuthChanges(
        (_event, nextSession) => {
          /*
           * Run profile loading after the
           * authentication callback completes.
           */
          window.setTimeout(async () => {
            if (!active) {
              return;
            }

            try {
              setLoading(true);
              setAuthError("");

              setSession(nextSession);
              setUser(
                nextSession?.user || null,
              );

              if (
                nextSession?.user?.id
              ) {
                await loadProfile(
                  nextSession.user.id,
                );
              } else {
                setProfile(null);
              }
            } catch (error) {
              if (active) {
                console.error(
                  "Authentication state update failed:",
                  error,
                );

                setAuthError(
                  error.message ||
                    "Unable to load your account.",
                );
              }
            } finally {
              if (active) {
                setLoading(false);
              }
            }
          }, 0);
        },
      );

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const registerStudent =
    useCallback(async (credentials) => {
      setAuthError("");

      try {
        return await registerStudentRequest(
          credentials,
        );
      } catch (error) {
        setAuthError(error.message);
        throw error;
      }
    }, []);

  const signIn =
    useCallback(async (credentials) => {
      setAuthError("");

      try {
        return await signInRequest(
          credentials,
        );
      } catch (error) {
        setAuthError(error.message);
        throw error;
      }
    }, []);

  const signOut =
    useCallback(async () => {
      setAuthError("");

      try {
        await signOutRequest();

        setSession(null);
        setUser(null);
        setProfile(null);
      } catch (error) {
        setAuthError(error.message);
        throw error;
      }
    }, []);

  const refreshProfile =
    useCallback(async () => {
      if (!user?.id) {
        setProfile(null);
        return null;
      }

      return loadProfile(user.id);
    }, [loadProfile, user?.id]);

  const clearAuthError =
    useCallback(() => {
      setAuthError("");
    }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,

      role:
        profile?.role || null,

      accountStatus:
        profile?.account_status ||
        null,

      loading,
      authError,

      registerStudent,
      signIn,
      signOut,
      refreshProfile,
      clearAuthError,

      isAuthenticated:
        Boolean(session?.user),
    }),
    [
      session,
      user,
      profile,
      loading,
      authError,
      registerStudent,
      signIn,
      signOut,
      refreshProfile,
      clearAuthError,
    ],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}