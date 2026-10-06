import { supabase } from "../lib/supabase";

export async function getCurrentSession() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function getProfile(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      phone,
      profile_photo_url,
      profile_photo_public_id,
      role,
      account_status,
      created_at,
      updated_at
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function registerStudent({
  fullName,
  email,
  password,
}) {
  const cleanFullName =
    fullName?.trim();

  const cleanEmail =
    email?.trim().toLowerCase();

  if (!cleanFullName) {
    throw new Error(
      "Enter your full name.",
    );
  }

  if (!cleanEmail) {
    throw new Error(
      "Enter your email address.",
    );
  }

  if (!password || password.length < 8) {
    throw new Error(
      "Your password must contain at least 8 characters.",
    );
  }

  const { data, error } =
    await supabase.auth.signUp({
      email: cleanEmail,
      password,

      options: {
        data: {
          full_name: cleanFullName,
        },

        emailRedirectTo:
          `${window.location.origin}/auth/callback`,
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signIn({
  email,
  password,
}) {
  const cleanEmail =
    email?.trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error(
      "Enter your email and password.",
    );
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

  if (error) {
    throw new Error(
      getFriendlyAuthError(
        error.message,
      ),
    );
  }

  return data;
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPasswordReset(
  email,
) {
  const cleanEmail =
    email?.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error(
      "Enter your email address.",
    );
  }

  const { error } =
    await supabase.auth
      .resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        },
      );

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(
  password,
) {
  if (!password || password.length < 8) {
    throw new Error(
      "Your new password must contain at least 8 characters.",
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export function subscribeToAuthChanges(
  callback,
) {
  const {
    data: { subscription },
  } =
    supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      },
    );

  return subscription;
}

function getFriendlyAuthError(message) {
  const normalizedMessage =
    message?.toLowerCase() || "";

  if (
    normalizedMessage.includes(
      "invalid login credentials",
    )
  ) {
    return "The email or password is incorrect.";
  }

  if (
    normalizedMessage.includes(
      "email not confirmed",
    )
  ) {
    return "Confirm your email address before signing in.";
  }

  if (
    normalizedMessage.includes(
      "user is banned",
    )
  ) {
    return "This account is currently unavailable. Contact an administrator.";
  }

  return (
    message ||
    "Unable to sign in. Please try again."
  );
}